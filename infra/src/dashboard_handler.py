"""
The dashboard's routes: GET /appointments, and GET, POST, DELETE /contacts.

Everything here sits behind the basic auth guard in barber/auth.py, with the
credentials read from Parameter Store at cold start. The guard runs before
routing, so an unknown path with bad credentials is a 401 and not a 404 that
confirms what exists.

The 401 carries a WWW-Authenticate challenge unless the request announces
itself as the dashboard with an X-Requested-With header. The dashboard has
its own sign-in form and sends the header on every call. Without that
exception some browsers would raise their native password dialog on top of
the form's own, and the two would fight.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any, Optional

import boto3

from barber import http, secrets
from barber.auth import REALM, Credentials, credentials_match, parse_basic_auth
from barber.store import BookingStore, ContactStore

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

CONTACT_LIMITS = {"name": 100, "email": 254}


@dataclass
class Runtime:
    bookings: BookingStore
    contacts: ContactStore
    # None when either half is missing from Parameter Store, which puts the
    # guard into its fail-closed state.
    expected: Optional[Credentials]


_runtime: Optional[Runtime] = None


def build_runtime() -> Runtime:
    dynamodb = boto3.resource("dynamodb")
    prefix = os.environ["SSM_PREFIX"].rstrip("/")

    user = (secrets.read_parameter(f"{prefix}/dashboard/user") or "").strip()
    password = secrets.read_parameter(f"{prefix}/dashboard/password") or ""
    expected = Credentials(user, password) if user and password else None
    if expected is None:
        log.warning(
            "Dashboard credentials are not in Parameter Store under %s/dashboard/. "
            "Every dashboard route will answer 503 until both are set.", prefix,
        )

    return Runtime(
        bookings=BookingStore(dynamodb.Table(os.environ["BOOKINGS_TABLE"])),
        contacts=ContactStore(dynamodb.Table(os.environ["CONTACTS_TABLE"])),
        expected=expected,
    )


def runtime() -> Runtime:
    global _runtime
    if _runtime is None:
        _runtime = build_runtime()
    return _runtime


def configure(rt: Optional[Runtime]) -> None:
    """Test seam."""
    global _runtime
    _runtime = rt


def guard(event: dict[str, Any], rt: Runtime) -> Optional[dict[str, Any]]:
    """None when the request may proceed, otherwise the response to send."""
    if rt.expected is None:
        return http.respond(503, {"ok": False, "message": "The dashboard is not configured on this stage."})

    offered = parse_basic_auth(http.header(event, "authorization"))
    if credentials_match(offered, rt.expected):
        return None

    headers = {} if http.header(event, "x-requested-with") else {"WWW-Authenticate": REALM}
    return http.respond(401, {"ok": False, "message": "Authentication required."}, headers)


def handle_add_contact(event: dict[str, Any], rt: Runtime) -> dict[str, Any]:
    try:
        body = http.json_body(event)
    except http.BadRequest as error:
        return http.respond(error.status, {"ok": False, "message": error.message})

    name = body.get("name", "")
    email = body.get("email", "")
    name = name.strip() if isinstance(name, str) else ""
    email = email.strip() if isinstance(email, str) else ""

    if not name or not email:
        return http.respond(400, {"ok": False, "message": "A contact needs a name and an email."})
    if len(name) > CONTACT_LIMITS["name"] or len(email) > CONTACT_LIMITS["email"]:
        return http.respond(400, {"ok": False, "message": "That contact is too long to save."})

    return http.respond(200, rt.contacts.add_contact(name, email))


def handler(event: dict[str, Any], context: Any = None) -> dict[str, Any]:
    rt = runtime()

    refused = guard(event, rt)
    if refused is not None:
        return refused

    route = http.route_key(event)
    try:
        if route == "GET /appointments":
            return http.respond(200, rt.bookings.list_requests())

        if route == "GET /contacts":
            return http.respond(200, rt.contacts.list_contacts())

        if route == "POST /contacts":
            return handle_add_contact(event, rt)

        if route == "DELETE /contacts/{id}":
            contact_id = http.path_param(event, "id") or ""
            if not contact_id:
                return http.respond(400, {"ok": False, "message": "A contact id is required."})
            rt.contacts.delete_contact(contact_id)
            return http.respond(200, {"ok": True})
    except Exception as error:  # noqa: BLE001
        log.error("%s error: %s", route, error)
        # The dashboard reads an array from GET /appointments and guards
        # against anything else, the same as it did against Express.
        if route == "GET /appointments":
            return http.respond(500, [])
        return http.respond(500, {"ok": False, "message": "Something went wrong."})

    return http.respond(404, {"ok": False, "message": "Not found."})
