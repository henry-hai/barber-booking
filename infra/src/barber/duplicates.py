"""
Catches the same booking arriving twice.

A client who taps Submit twice, or reloads the confirmation page, sends the
form again byte for byte. Two years of history had thirteen of those in it as
separate rows. Only an identical resubmission counts: change any field, a
time, a note, a mistyped digit, and it goes through as a new request, because
that is a client correcting themselves and the correction is worth keeping.

Ported from server/src/Duplicates.ts, with one change forced by the host. The
Express version kept the fingerprints in a Map, which was fine for one long
lived Node process. Lambda gives no such guarantee: two taps can land on two
different instances, and neither would know about the other. So the guard is
a DynamoDB conditional write instead. The first submission creates a guard
item keyed on a hash of the booking. An identical one inside the window finds
the item already there, the condition fails, and that failure is the answer.
Recording and checking are one atomic call, so there is no gap between them
for a second request to slip through.

The window runs from the first attempt rather than the latest one, which is
the one semantic the port gives up. A conditional put cannot extend the expiry
on the copy it refuses, and a second write to do it would reopen the gap the
single call closes. For a double tap it makes no difference.
"""

from __future__ import annotations

import hashlib
import re
import time
from typing import Any, Callable, Optional

from .booking import ValidatedBooking

# A unit separator cannot appear in form input, so no combination of fields
# can fingerprint the same as a different combination.
SEPARATOR = "\x1f"

GUARD_PREFIX = "dup#"


def normalize(value: str) -> str:
    """Trims, folds case and collapses runs of whitespace, so "After  4pm" and
    "after 4pm" fingerprint the same. Anything less and the guard misses the
    resubmission it exists to catch."""
    return re.sub(r"\s+", " ", value.strip().lower())


def fingerprint(booking: ValidatedBooking) -> str:
    return SEPARATOR.join(normalize(value) for value in (
        booking.name, booking.email, booking.phone,
        booking.date1, booking.availability1,
        booking.date2, booking.availability2,
        booking.date3, booking.availability3,
        booking.description,
    ))


def fingerprint_hash(booking: ValidatedBooking) -> str:
    """SHA-256 of the fingerprint. The hash is the table key, so client text
    never becomes a partition key and every key is the same length."""
    return hashlib.sha256(fingerprint(booking).encode("utf-8")).hexdigest()


class DuplicateGuard:
    """Guard items live in the bookings table under `dup#<hash>` with a
    `kind` of `guard`, and carry an `expiresAt` the table's TTL cleans up.
    TTL deletion can lag by a day or two, so the condition checks the expiry
    itself rather than trusting the item's absence."""

    def __init__(
        self,
        table: Any,
        window_seconds: int = 10 * 60,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.table = table
        self.window_seconds = window_seconds
        self.clock = clock

    def key(self, booking: ValidatedBooking) -> str:
        return GUARD_PREFIX + fingerprint_hash(booking)

    def is_repeat(self, booking: ValidatedBooking, now: Optional[float] = None) -> bool:
        """Records the booking and reports whether an identical one arrived
        inside the window."""
        at = int(now if now is not None else self.clock())
        try:
            self.table.put_item(
                Item={
                    "bookingId": self.key(booking),
                    "kind": "guard",
                    "expiresAt": at + self.window_seconds,
                },
                ConditionExpression="attribute_not_exists(bookingId) OR expiresAt <= :now",
                ExpressionAttributeValues={":now": at},
            )
        except self.table.meta.client.exceptions.ConditionalCheckFailedException:
            return True
        return False

    def forget(self, booking: ValidatedBooking) -> None:
        """Drops the guard item again, so a submission that failed on the way
        out does not make the client's retry look like a duplicate."""
        self.table.delete_item(Key={"bookingId": self.key(booking)})
