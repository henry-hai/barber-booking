"""
Booking request handling: validation, the twelve column payload, and the
sentinel-wrapped JSON block carried in the owner notification.

Ported from server/src/Booking.ts. The rules are the same ones the Express
route enforces, field for field and message for message, so a request the
old API would accept the new one accepts, and the site's form keeps matching
both.

THE PAYLOAD
-----------
The twelve keys of the payload are the sheet's columns A through L, in order.
Nothing here writes a sheet any more, but the owner notification still ends
with the payload as JSON between two fixed sentinels, every request since
2024 is filed under that shape, and the import script maps sheet rows onto the
same keys. The order is the one thing an email, an old row and a DynamoDB item
all agree on, so it is kept.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any, Mapping, Optional
from zoneinfo import ZoneInfo

# Fixed sentinels bounding the JSON block in the owner notification, so the
# payload can be found again in a mailbox full of prose.
JSON_START = "---BOOKING_JSON_START---"
JSON_END = "---BOOKING_JSON_END---"

# Placeholder written for any empty field in the payload. The dashboard reads
# it back as "".
NA = "N/A"

PACIFIC = ZoneInfo("America/Los_Angeles")

# Field length caps, mirrored by the client-side checks in web/lib/booking.ts.
LIMITS = {
    "name": 100,
    "email": 254,
    "phone": 32,
    "availability": 500,
    "description": 2000,
}

ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Deliberately permissive: one @, something either side, a dot in the domain,
# no whitespace. Anything stricter rejects addresses that are actually valid.
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

# The payload keys in column order, A through L.
PAYLOAD_KEYS = (
    "name", "date", "time", "phone",
    "date1", "avail1", "date2", "avail2", "date3", "avail3",
    "description", "email",
)


@dataclass(frozen=True)
class ValidatedBooking:
    """A booking that passed validation, before the timestamp is applied."""

    name: str
    email: str
    phone: str
    date1: str
    availability1: str
    date2: str
    availability2: str
    date3: str
    availability3: str
    description: str


@dataclass
class ValidationResult:
    """Field name to message. Empty when the booking is valid."""

    errors: dict[str, str] = field(default_factory=dict)
    booking: Optional[ValidatedBooking] = None


def _str(value: Any) -> str:
    """Coerces anything to a trimmed string. Non-strings become "", which then
    fails the required-field checks rather than reaching the table."""
    return value.strip() if isinstance(value, str) else ""


def count_digits(value: str) -> int:
    # ASCII digits only, the same as the JavaScript \d this replaces.
    return len(re.findall(r"[0-9]", value))


def is_real_date(value: str) -> bool:
    """A date is valid if it is a real calendar day, which rejects 2026-02-31
    and friends that a lenient parser would roll over into March."""
    if not ISO_DATE.match(value):
        return False
    try:
        date.fromisoformat(value)
    except ValueError:
        return False
    return True


def validate_booking(body: Mapping[str, Any]) -> ValidationResult:
    """Validates the posted body. Everything the browser sends is re-checked
    here. The client-side checks only exist to give faster feedback."""
    errors: dict[str, str] = {}

    name = _str(body.get("name"))
    email = _str(body.get("email"))
    phone = _str(body.get("phone"))
    description = _str(body.get("description"))
    dates = [_str(body.get("date1")), _str(body.get("date2")), _str(body.get("date3"))]
    availabilities = [
        _str(body.get("availability1")),
        _str(body.get("availability2")),
        _str(body.get("availability3")),
    ]

    if not name:
        errors["name"] = "A name is required."
    elif len(name) > LIMITS["name"]:
        errors["name"] = f"Name must be {LIMITS['name']} characters or fewer."

    if not email:
        errors["email"] = "An email address is required."
    elif len(email) > LIMITS["email"] or not EMAIL.match(email):
        errors["email"] = "A valid email address is required."

    if not phone:
        errors["phone"] = "A phone number is required."
    elif count_digits(phone) < 7:
        errors["phone"] = "A phone number needs at least 7 digits."
    elif len(phone) > LIMITS["phone"]:
        errors["phone"] = f"Phone number must be {LIMITS['phone']} characters or fewer."

    if not dates[0]:
        errors["date1"] = "A first preferred date is required."
    elif not is_real_date(dates[0]):
        errors["date1"] = "Preferred date 1 must be a valid YYYY-MM-DD date."

    if not availabilities[0]:
        errors["availability1"] = "Availability for the first date is required."

    # Dates 2 and 3 are optional but must be complete pairs: a lone availability
    # note or a lone date would land half-filled.
    for index in (1, 2):
        label = index + 1
        value = dates[index]
        availability = availabilities[index]

        if value and not is_real_date(value):
            errors[f"date{label}"] = f"Preferred date {label} must be a valid YYYY-MM-DD date."
        if availability and not value:
            errors[f"date{label}"] = f"Preferred date {label} is required alongside its availability."
        if value and not availability:
            errors[f"availability{label}"] = f"Availability for date {label} is required."

    for index, availability in enumerate(availabilities):
        if len(availability) > LIMITS["availability"]:
            errors[f"availability{index + 1}"] = (
                f"Availability must be {LIMITS['availability']} characters or fewer."
            )

    if not description:
        errors["description"] = "A description of the haircut is required."
    elif len(description) > LIMITS["description"]:
        errors["description"] = f"Description must be {LIMITS['description']} characters or fewer."

    # Exactly the boolean true. "true", 1 and "yes" are rejected, the same as
    # the Express route's strict comparison.
    if body.get("policiesAccepted") is not True:
        errors["policiesAccepted"] = "The booking policies must be accepted."

    if errors:
        return ValidationResult(errors=errors)

    return ValidationResult(
        errors=errors,
        booking=ValidatedBooking(
            name=name,
            email=email,
            phone=phone,
            date1=dates[0],
            availability1=availabilities[0],
            date2=dates[1],
            availability2=availabilities[1],
            date3=dates[2],
            availability3=availabilities[2],
            description=description,
        ),
    )


def is_honeypot_tripped(body: Mapping[str, Any]) -> bool:
    """True when the hidden `website` field was filled, which only a bot does."""
    return _str(body.get("website")) != ""


def or_na(value: str) -> str:
    return NA if value == "" else value


def format_submitted_at(when: datetime) -> dict[str, str]:
    """Formats the submission time the way every row since 2024 reads.

    Pacific rather than the machine's clock, because a booking that arrives
    at 11pm in Milpitas should not be logged as the next day. M/D/YYYY with no
    leading zeros and a two digit hour, which is what the old
    toLocaleDateString and toLocaleTimeString calls produced.
    """
    local = when.astimezone(PACIFIC)
    return {
        "date": f"{local.month}/{local.day}/{local.year}",
        "time": local.strftime("%I:%M %p"),
    }


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def build_booking_payload(
    booking: ValidatedBooking, when: Optional[datetime] = None
) -> dict[str, str]:
    """Builds the twelve key payload. Key order here is column order A..L."""
    submitted = format_submitted_at(when or now_utc())
    return {
        "name": or_na(booking.name),
        "date": submitted["date"],
        "time": submitted["time"],
        "phone": or_na(booking.phone),
        "date1": or_na(booking.date1),
        "avail1": or_na(booking.availability1),
        "date2": or_na(booking.date2),
        "avail2": or_na(booking.availability2),
        "date3": or_na(booking.date3),
        "avail3": or_na(booking.availability3),
        "description": or_na(booking.description),
        "email": or_na(booking.email),
    }


def serialize_booking_block(payload: Mapping[str, str]) -> str:
    """Wraps the payload in the sentinels, for the copy in the owner email.

    Pretty-printed rather than minified: it keeps every line short, so no mail
    transport along the way has a reason to fold one, and it stays readable if
    anyone opens the raw email. json.loads is indifferent to the whitespace.
    """
    return f"{JSON_START}\n{json.dumps(dict(payload), indent=2, ensure_ascii=False)}\n{JSON_END}"


def parse_booking_block(body: str) -> dict[str, str]:
    """Reads a payload back out of an email body.

    Nothing calls this on the request path. It exists so the round trip is
    testable, and so a request can be rebuilt from the mailbox if it ever
    failed to save.
    """
    start = body.find(JSON_START)
    if start == -1:
        raise ValueError(f"Missing {JSON_START} sentinel")
    # find() from the start sentinel rather than split(): splitting on the end
    # sentinel returns the whole remainder when it is absent, so a truncated
    # email would parse whatever happened to follow instead of failing.
    end = body.find(JSON_END, start)
    if end == -1:
        raise ValueError(f"Missing {JSON_END} sentinel")
    return json.loads(body[start + len(JSON_START):end].strip())
