"""
POST /booking and GET /healthz.

Port of the request path in server/src/Booking.ts: honeypot, rate limits,
validation, duplicate guard, then the booking itself. The order is the same,
and so are the status codes and messages, so the site's form cannot tell
which API answered it.

WHY THE HANDLER WAITS FOR THE EMAILS
------------------------------------
Lambda freezes the instance the moment the handler returns, so anything still
in flight is lost. The Express server could answer first and send after. Here
the table write and both Resend calls finish before the response goes out,
which adds about a second to a request that used to wait fifty on a cold
Render instance. The rejected alternative was a queue and a second function
for the emails: more parts, only worth it at far higher volume.

WHAT COUNTS AS SUCCESS
----------------------
A booking that reached the table is a success whether or not its emails went
out. Answering the client with an error would have them submit again, and a
second identical request is exactly what the duplicate guard would then
swallow, so nothing would be gained. Only a booking that left no trace at all,
neither in the table nor in the owner's mailbox, is reported as a failure, and
then the guard forgets it so the client's retry goes through.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

import boto3

from barber import http, secrets
from barber.booking import (
    ValidatedBooking,
    build_booking_payload,
    is_honeypot_tripped,
    now_utc,
    validate_booking,
)
from barber.duplicates import DuplicateGuard, fingerprint_hash
from barber.emails import render_client_confirmation, render_owner_notification
from barber.ratelimit import RateLimiter
from barber.resend import DisabledMailer, Mailer, ResendMailer
from barber.store import BookingStore, booking_item, new_booking_id

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

# Five per address per ten minutes leaves room for a client fixing a typo and
# resubmitting. The global cap stops a distributed flood draining the Resend
# quota. Same numbers as the Express route.
WINDOW_SECONDS = 10 * 60
PER_CLIENT_LIMIT = 5
GLOBAL_LIMIT = 60
DUPLICATE_WINDOW_SECONDS = 10 * 60


@dataclass
class Runtime:
    """Everything the handler needs, built once per cold start. Tests build
    their own with recorders in place of Resend and real tables."""

    store: BookingStore
    guard: DuplicateGuard
    per_client: RateLimiter
    overall: RateLimiter
    mailer: Mailer
    owner_email: str
    # A second mailbox copied on every owner notification. Henry reads the
    # studio inbox and keeps the personal one as the backup, so the history
    # is never in only one place. Empty means no copy.
    owner_cc: str = ""


_runtime: Optional[Runtime] = None


def build_runtime() -> Runtime:
    table = boto3.resource("dynamodb").Table(os.environ["BOOKINGS_TABLE"])

    prefix = os.environ["SSM_PREFIX"].rstrip("/")
    api_key = secrets.read_parameter(f"{prefix}/resend/api-key")
    sender = os.environ.get("MAIL_FROM", "")
    if api_key and sender:
        mailer: Mailer = ResendMailer(api_key=api_key, sender=sender)
    else:
        log.warning("Resend is not configured for this stage. Bookings will save and send nothing.")
        mailer = DisabledMailer()

    return Runtime(
        store=BookingStore(table),
        guard=DuplicateGuard(table, DUPLICATE_WINDOW_SECONDS),
        per_client=RateLimiter(table, PER_CLIENT_LIMIT, WINDOW_SECONDS),
        overall=RateLimiter(table, GLOBAL_LIMIT, WINDOW_SECONDS),
        mailer=mailer,
        owner_email=os.environ["OWNER_EMAIL"],
        owner_cc=os.environ.get("OWNER_CC", "").strip(),
    )


def runtime() -> Runtime:
    global _runtime
    if _runtime is None:
        _runtime = build_runtime()
    return _runtime


def configure(rt: Optional[Runtime]) -> None:
    """Test seam. Replaces the cached runtime, or clears it with None."""
    global _runtime
    _runtime = rt


def submit(
    booking: ValidatedBooking,
    rt: Runtime,
    when: Optional[datetime] = None,
    booking_id: Optional[str] = None,
) -> dict[str, str]:
    """Records one booking and sends the two emails for it. Three independent
    deliveries, and no one of them is allowed to take down the others. The
    table goes first because it is the record."""
    at = when or now_utc()
    payload = build_booking_payload(booking, at)
    item = booking_item(
        booking,
        booking_id=booking_id or new_booking_id(),
        when=at,
        fingerprint=fingerprint_hash(booking),
    )

    def attempt(what: str, action) -> bool:
        try:
            action()
            return True
        except Exception as error:  # noqa: BLE001  every failure is logged and survived
            log.error("Booking %s failed: %s", what, error)
            return False

    saved = attempt("save", lambda: rt.store.put(item))

    # The owner notification carries the whole request, JSON block included,
    # so while it is not the record it is enough to rebuild the item by hand.
    notification = render_owner_notification(payload, booking.email)
    notified = attempt("owner notification", lambda: rt.mailer.send(
        to=rt.owner_email,
        subject=notification.subject,
        text=notification.text,
        html=notification.html,
        reply_to=booking.email,
        cc=rt.owner_cc or None,
    ))

    confirmation = render_client_confirmation(payload)
    attempt("client confirmation", lambda: rt.mailer.send(
        to=booking.email,
        subject=confirmation.subject,
        text=confirmation.text,
        html=confirmation.html,
    ))

    if not saved and not notified:
        raise RuntimeError("Booking reached neither the table nor the owner mailbox.")

    return payload


def handle_booking(event: dict[str, Any], rt: Runtime) -> dict[str, Any]:
    try:
        body = http.json_body(event)
    except http.BadRequest as error:
        return http.respond(error.status, {"ok": False, "message": error.message})

    # Honeypot: the form renders a `website` field hidden from people, so
    # anything in it means a bot. Answer 200 so there is nothing to tune
    # against, and do nothing.
    if is_honeypot_tripped(body):
        return http.respond(200, {"ok": True})

    client = rt.per_client.check(http.source_ip(event))
    overall = rt.overall.check("global")
    if not client.allowed or not overall.allowed:
        retry_after = client.retry_after_seconds if not client.allowed else overall.retry_after_seconds
        return http.respond(
            429,
            {"ok": False, "message": "Too many booking requests. Please try again shortly."},
            {"Retry-After": str(retry_after)},
        )

    validation = validate_booking(body)
    if validation.booking is None:
        return http.respond(400, {
            "ok": False,
            "message": "Some of the details need fixing.",
            "errors": validation.errors,
        })

    # A second identical submission is the same person tapping twice or
    # reloading, so answer as though it worked. Telling them it failed would
    # only get a third. Anything they changed makes a new fingerprint and goes
    # through normally.
    if rt.guard.is_repeat(validation.booking):
        return http.respond(200, {"ok": True})

    try:
        submit(validation.booking, rt)
    except Exception as error:  # noqa: BLE001
        # Let the client retry: this booking never made it out.
        rt.guard.forget(validation.booking)
        log.error("POST /booking error: %s", error)
        return http.respond(502, {
            "ok": False,
            "message": "Your request could not be sent. Please try again in a moment.",
        })

    return http.respond(200, {"ok": True})


def handler(event: dict[str, Any], context: Any = None) -> dict[str, Any]:
    route = http.route_key(event)

    # Unauthenticated liveness check. Reports nothing beyond that and touches
    # no table, so a monitor can poll it freely.
    if route == "GET /healthz":
        return http.respond(200, {"ok": True})

    if route == "POST /booking":
        return handle_booking(event, runtime())

    return http.respond(404, {"ok": False, "message": "Not found."})
