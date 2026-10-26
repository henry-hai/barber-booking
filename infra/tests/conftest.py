"""
Everything runs against moto. No test reaches AWS or Resend.

The tables are created from template.yaml itself (see support.table_definitions),
so the suite exercises the same key schema the stack deploys.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# The handlers import `barber` as a top-level package, the way Lambda does,
# and the tests import `support` beside them.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

os.environ.setdefault("AWS_DEFAULT_REGION", "us-west-2")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_SECURITY_TOKEN", "testing")
os.environ.setdefault("AWS_SESSION_TOKEN", "testing")
os.environ["STAGE"] = "test"
os.environ["SSM_PREFIX"] = "/barber/test"
os.environ["BOOKINGS_TABLE"] = "barber-bookings-test"
os.environ["CONTACTS_TABLE"] = "barber-contacts-test"
os.environ["MAIL_FROM"] = "Henry Hai Studio <bookings@example.com>"
os.environ["OWNER_EMAIL"] = "owner@example.com"

import boto3  # noqa: E402
import pytest  # noqa: E402
from moto import mock_aws  # noqa: E402

import booking_handler  # noqa: E402
import dashboard_handler  # noqa: E402
from barber import secrets  # noqa: E402
from barber.auth import Credentials  # noqa: E402
from barber.duplicates import DuplicateGuard  # noqa: E402
from barber.ratelimit import RateLimiter  # noqa: E402
from barber.store import BookingStore, ContactStore  # noqa: E402
from support import FakeClock, RecordingMailer, load_template, table_definitions  # noqa: E402

DASHBOARD_USER = "henry"
DASHBOARD_PASSWORD = "correct horse battery staple"


@pytest.fixture
def aws():
    with mock_aws():
        client = boto3.client("dynamodb")
        for spec in table_definitions(load_template()):
            client.create_table(**spec)
        secrets.reset()
        yield
        secrets.reset()


@pytest.fixture
def bookings_table(aws):
    return boto3.resource("dynamodb").Table(os.environ["BOOKINGS_TABLE"])


@pytest.fixture
def contacts_table(aws):
    return boto3.resource("dynamodb").Table(os.environ["CONTACTS_TABLE"])


@pytest.fixture
def clock():
    return FakeClock()


@pytest.fixture
def mailer():
    return RecordingMailer()


@pytest.fixture
def booking_rt(bookings_table, mailer, clock):
    """The booking handler wired to moto and a recording mailer."""
    rt = booking_handler.Runtime(
        store=BookingStore(bookings_table),
        guard=DuplicateGuard(bookings_table, booking_handler.DUPLICATE_WINDOW_SECONDS, clock),
        per_client=RateLimiter(bookings_table, booking_handler.PER_CLIENT_LIMIT, booking_handler.WINDOW_SECONDS, clock),
        overall=RateLimiter(bookings_table, booking_handler.GLOBAL_LIMIT, booking_handler.WINDOW_SECONDS, clock),
        mailer=mailer,
        owner_email=os.environ["OWNER_EMAIL"],
    )
    booking_handler.configure(rt)
    yield rt
    booking_handler.configure(None)


@pytest.fixture
def dashboard_rt(bookings_table, contacts_table):
    rt = dashboard_handler.Runtime(
        bookings=BookingStore(bookings_table),
        contacts=ContactStore(contacts_table),
        expected=Credentials(DASHBOARD_USER, DASHBOARD_PASSWORD),
    )
    dashboard_handler.configure(rt)
    yield rt
    dashboard_handler.configure(None)
