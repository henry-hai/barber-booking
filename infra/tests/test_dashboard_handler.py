"""
GET /appointments and the contacts routes, against moto.
"""

import base64
from datetime import datetime, timedelta, timezone

import dashboard_handler
from barber.duplicates import DuplicateGuard, fingerprint_hash
from barber.ratelimit import RateLimiter
from barber.store import booking_item
from conftest import DASHBOARD_PASSWORD, DASHBOARD_USER
from support import SINGLE_SLOT_BOOKING, SUBMITTED_AT, VALID_BOOKING, api_event, body_of

AUTH = {"Authorization": "Basic " + base64.b64encode(f"{DASHBOARD_USER}:{DASHBOARD_PASSWORD}".encode()).decode()}


def call(method, path, body=None, path_params=None):
    return dashboard_handler.handler(api_event(method, path, body, headers=AUTH, path_params=path_params))


class TestAppointments:

    def test_lists_bookings_newest_first_in_the_dashboards_shape(self, dashboard_rt, bookings_table):
        older = booking_item(SINGLE_SLOT_BOOKING, booking_id="a", when=SUBMITTED_AT, fingerprint="f1")
        newer = booking_item(VALID_BOOKING, booking_id="b", when=SUBMITTED_AT + timedelta(hours=1), fingerprint="f2")
        bookings_table.put_item(Item=older)
        bookings_table.put_item(Item=newer)

        rows = body_of(call("GET", "/appointments"))
        assert [row["submittedTime"] for row in rows] == ["01:30 PM", "12:30 PM"]
        assert rows[0] == {
            "name": "Jordan Reyes",
            "submittedDate": "8/1/2026",
            "submittedTime": "01:30 PM",
            "phone": "(408) 555-0147",
            "preferred": [
                {"date": "2026-08-05", "availability": "After 4pm"},
                {"date": "2026-08-07", "availability": "Mornings only"},
                {"date": "2026-08-09", "availability": "Any time Saturday"},
            ],
            "notes": "Mid fade, scissor top, beard line-up",
            "email": "jordan@example.com",
        }
        assert rows[1]["preferred"] == [{"date": "2026-08-05", "availability": "After 4pm"}]

    def test_leaves_guard_and_window_items_out(self, dashboard_rt, bookings_table, clock):
        bookings_table.put_item(Item=booking_item(VALID_BOOKING, booking_id="a", when=SUBMITTED_AT, fingerprint="f"))
        DuplicateGuard(bookings_table, 600, clock).is_repeat(VALID_BOOKING)
        RateLimiter(bookings_table, 5, 600, clock).check("203.0.113.5")

        assert len(bookings_table.scan()["Items"]) == 3
        assert len(body_of(call("GET", "/appointments"))) == 1

    def test_reads_imported_rows_with_na_placeholders_as_empty(self, dashboard_rt, bookings_table):
        bookings_table.put_item(Item={
            "bookingId": "sheet#1", "kind": "booking", "submittedAt": "2025-01-05T20:00:00+00:00",
            "date": "2025-01-05", "submittedDate": "1/5/2025", "submittedTime": "12:00 PM",
            "name": "Old Client", "phone": "N/A", "email": "", "date1": "", "availability1": "Weekends",
            "date2": "N/A", "availability2": "N/A", "date3": "", "availability3": "",
            "description": "N/A", "source": "sheet-import",
        })
        row = body_of(call("GET", "/appointments"))[0]
        assert row["phone"] == ""
        assert row["notes"] == ""
        assert row["preferred"] == [{"date": "", "availability": "Weekends"}]

    def test_answers_an_empty_array_on_failure(self, dashboard_rt):
        class Broken:
            def list_requests(self):
                raise RuntimeError("simulated")
        dashboard_rt.bookings = Broken()
        response = call("GET", "/appointments")
        assert response["statusCode"] == 500
        assert body_of(response) == []


class TestContacts:

    def test_starts_empty(self, dashboard_rt):
        assert body_of(call("GET", "/contacts")) == []

    def test_adds_lists_and_deletes(self, dashboard_rt):
        added = body_of(call("POST", "/contacts", {"name": "Sam", "email": "sam@example.com"}))
        assert added["name"] == "Sam"
        assert added["email"] == "sam@example.com"
        assert added["_id"]

        call("POST", "/contacts", {"name": "Alex", "email": "alex@example.com"})
        listed = body_of(call("GET", "/contacts"))
        assert [contact["name"] for contact in listed] == ["Alex", "Sam"]

        response = call("DELETE", "/contacts/{id}", path_params={"id": added["_id"]})
        assert response["statusCode"] == 200
        assert [contact["name"] for contact in body_of(call("GET", "/contacts"))] == ["Alex"]

    def test_requires_a_name_and_an_email(self, dashboard_rt):
        assert call("POST", "/contacts", {"name": "", "email": "x@example.com"})["statusCode"] == 400
        assert call("POST", "/contacts", {"name": "Sam"})["statusCode"] == 400
        assert call("POST", "/contacts", {"name": 5, "email": "x@example.com"})["statusCode"] == 400
        assert body_of(call("GET", "/contacts")) == []

    def test_caps_the_lengths(self, dashboard_rt):
        assert call("POST", "/contacts", {"name": "x" * 101, "email": "x@example.com"})["statusCode"] == 400

    def test_trims_what_it_saves(self, dashboard_rt):
        added = body_of(call("POST", "/contacts", {"name": "  Sam ", "email": " sam@example.com "}))
        assert (added["name"], added["email"]) == ("Sam", "sam@example.com")


def test_booking_items_stay_readable_through_the_store(bookings_table):
    # The item the handler writes is the item the dashboard reads. One shape.
    item = booking_item(VALID_BOOKING, booking_id="x", when=SUBMITTED_AT, fingerprint=fingerprint_hash(VALID_BOOKING))
    assert item["date"] == "2026-08-01"
    assert item["submittedAt"] == "2026-08-01T19:30:00+00:00"
    assert item["kind"] == "booking"
    assert "expiresAt" not in item
    assert datetime.fromisoformat(item["submittedAt"]).tzinfo is not None
    assert datetime.fromisoformat(item["submittedAt"]) == SUBMITTED_AT.astimezone(timezone.utc)
