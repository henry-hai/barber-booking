"""
The bookings and contacts tables.

Bookings replace the Google Sheet as the record. Each booking is one item
keyed by a random bookingId, with the submission instant in `submittedAt`
(UTC, ISO 8601, sortable) and the Pacific calendar day in `date`, which is
the partition key of the date-index GSI. The dashboard's display strings,
"8/1/2026" and "12:30 PM", are stored alongside as `submittedDate` and
`submittedTime` so the dashboard keeps showing exactly what the sheet did.

Three kinds of item share the table, told apart by `kind`: `booking`, the
`guard` items duplicates.py writes, and the `window` counters ratelimit.py
bumps. The second and third carry an `expiresAt` the table's TTL cleans up.
One table rather than three because the extra kinds are transient and tiny,
and a table is a provisioned-capacity line item of its own.

The dashboard lists bookings with a Scan. At fifty bookings a month the
whole table stays under a megabyte for years, which is one read unit burst,
and an index whose only job is global ordering would be a single hot
partition. If the volume ever changes, a month-keyed index is the upgrade.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from boto3.dynamodb.conditions import Attr

from .booking import NA, PACIFIC, ValidatedBooking, format_submitted_at


def clean(value: Any) -> str:
    """Trims a value and treats the historical "N/A" placeholder as empty, so
    imported rows and fresh bookings read the same on the dashboard."""
    text = "" if value is None else str(value).strip()
    return "" if text == NA else text


def new_booking_id() -> str:
    return uuid.uuid4().hex


def booking_item(
    booking: ValidatedBooking,
    *,
    booking_id: str,
    when: datetime,
    fingerprint: str,
    source: str = "web",
) -> dict[str, Any]:
    """One booking as a table item. Empty optional fields are stored as "",
    not "N/A": the placeholder belongs to the email payload and the sheet,
    and the dashboard's clean() turns either into the same thing."""
    submitted = format_submitted_at(when)
    return {
        "bookingId": booking_id,
        "kind": "booking",
        "submittedAt": when.isoformat(timespec="seconds"),
        "date": when.astimezone(PACIFIC).date().isoformat(),
        "submittedDate": submitted["date"],
        "submittedTime": submitted["time"],
        "name": booking.name,
        "email": booking.email,
        "phone": booking.phone,
        "date1": booking.date1,
        "availability1": booking.availability1,
        "date2": booking.date2,
        "availability2": booking.availability2,
        "date3": booking.date3,
        "availability3": booking.availability3,
        "description": booking.description,
        "fingerprint": fingerprint,
        "source": source,
    }


def to_request(item: dict[str, Any]) -> dict[str, Any]:
    """The shape the dashboard has always read from GET /appointments."""
    preferred = [
        {"date": clean(item.get("date1")), "availability": clean(item.get("availability1"))},
        {"date": clean(item.get("date2")), "availability": clean(item.get("availability2"))},
        {"date": clean(item.get("date3")), "availability": clean(item.get("availability3"))},
    ]
    return {
        "name": clean(item.get("name")),
        "submittedDate": clean(item.get("submittedDate")),
        "submittedTime": clean(item.get("submittedTime")),
        "phone": clean(item.get("phone")),
        "preferred": [slot for slot in preferred if slot["date"] or slot["availability"]],
        "notes": clean(item.get("description")),
        "email": clean(item.get("email")),
    }


def _scan_all(table: Any, **kwargs: Any) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    start_key: Optional[dict[str, Any]] = None
    while True:
        if start_key:
            kwargs["ExclusiveStartKey"] = start_key
        page = table.scan(**kwargs)
        items.extend(page.get("Items", []))
        start_key = page.get("LastEvaluatedKey")
        if not start_key:
            return items


class BookingStore:
    def __init__(self, table: Any) -> None:
        self.table = table

    def put(self, item: dict[str, Any]) -> None:
        """Writes one booking. The condition makes a repeated write with the
        same id a loud failure instead of a silent overwrite, which is what
        lets the import script be re-run safely."""
        self.table.put_item(
            Item=item, ConditionExpression="attribute_not_exists(bookingId)"
        )

    def list_requests(self) -> list[dict[str, Any]]:
        """Every booking, newest first, in the dashboard's shape."""
        items = _scan_all(self.table, FilterExpression=Attr("kind").eq("booking"))
        items.sort(key=lambda item: str(item.get("submittedAt", "")), reverse=True)
        return [to_request(item) for item in items]


class ContactStore:
    def __init__(self, table: Any) -> None:
        self.table = table

    def list_contacts(self) -> list[dict[str, str]]:
        items = _scan_all(self.table)
        items.sort(key=lambda item: str(item.get("name", "")).lower())
        return [self._public(item) for item in items]

    def add_contact(self, name: str, email: str) -> dict[str, str]:
        item = {
            "contactId": uuid.uuid4().hex,
            "name": name,
            "email": email,
            "createdAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        }
        self.table.put_item(Item=item)
        return self._public(item)

    def delete_contact(self, contact_id: str) -> None:
        self.table.delete_item(Key={"contactId": contact_id})

    @staticmethod
    def _public(item: dict[str, Any]) -> dict[str, str]:
        # `_id` rather than `contactId`: the dashboard's contact code was
        # written against NeDB's field name and has no reason to change.
        return {
            "_id": str(item["contactId"]),
            "name": str(item.get("name", "")),
            "email": str(item.get("email", "")),
        }
