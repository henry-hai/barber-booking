"""
POST /booking end to end against moto, with Resend recorded.

The important cases are the ones about what counts as success: a booking that
saved answers 200 even when both emails fail, and only a booking that reached
nothing at all answers 502 and lets the client retry.
"""

import json

import booking_handler
from barber.resend import DisabledMailer
from support import VALID_BODY, api_event, body_of


def bookings_in(table):
    return [item for item in table.scan()["Items"] if item["kind"] == "booking"]


def post(body=VALID_BODY, **kwargs):
    return booking_handler.handler(api_event("POST", "/booking", body, **kwargs))


class FailingStore:
    def put(self, item):
        raise RuntimeError("DynamoDB is down (simulated)")

    def list_requests(self):
        return []


def test_healthz_is_public_and_touches_nothing(booking_rt):
    response = booking_handler.handler(api_event("GET", "/healthz"))
    assert response["statusCode"] == 200
    assert body_of(response) == {"ok": True}


def test_writes_one_item_and_sends_two_emails(booking_rt, bookings_table, mailer):
    response = post()
    assert response["statusCode"] == 200
    assert body_of(response) == {"ok": True}

    saved = bookings_in(bookings_table)
    assert len(saved) == 1
    assert saved[0]["name"] == "Jordan Reyes"
    assert saved[0]["email"] == "jordan@example.com"
    assert saved[0]["source"] == "web"

    assert len(mailer.sent) == 2
    notification, confirmation = mailer.sent
    assert notification["to"] == "owner@example.com"
    assert notification["subject"] == "Appointment Request from Jordan Reyes"
    assert notification["reply_to"] == "jordan@example.com"
    assert notification["cc"] is None
    assert "---BOOKING_JSON_START---" in notification["text"]
    assert confirmation["to"] == "jordan@example.com"
    assert confirmation.get("cc") is None
    assert "Appointment request received" in confirmation["subject"]


def test_copies_the_owner_notification_to_the_backup_mailbox(booking_rt, mailer):
    # The studio inbox gets the notification, the personal one gets a copy,
    # and the client's confirmation is never copied anywhere.
    booking_rt.owner_cc = "backup@example.com"
    post()
    notification, confirmation = mailer.sent
    assert notification["cc"] == "backup@example.com"
    assert confirmation.get("cc") is None


def test_writes_nothing_extra_when_the_same_form_is_submitted_twice(booking_rt, bookings_table, mailer):
    assert post()["statusCode"] == 200
    assert post({**VALID_BODY, "name": " jordan REYES "})["statusCode"] == 200
    assert len(bookings_in(bookings_table)) == 1
    assert len(mailer.sent) == 2


def test_writes_a_second_item_when_the_client_changes_something(booking_rt, bookings_table):
    post()
    post({**VALID_BODY, "availability1": "After 5pm"})
    assert len(bookings_in(bookings_table)) == 2


def test_still_records_the_booking_when_the_emails_fail(booking_rt, bookings_table, mailer):
    mailer.fail = True
    response = post()
    assert response["statusCode"] == 200
    assert body_of(response) == {"ok": True}
    assert len(bookings_in(bookings_table)) == 1
    assert mailer.sent == []


def test_saves_and_answers_ok_when_resend_is_not_configured(booking_rt, bookings_table):
    booking_rt.mailer = DisabledMailer()
    assert post()["statusCode"] == 200
    assert len(bookings_in(bookings_table)) == 1


def test_tells_the_client_to_retry_only_when_nothing_was_recorded_anywhere(booking_rt, bookings_table, mailer):
    working_store = booking_rt.store
    booking_rt.store = FailingStore()
    mailer.fail = True

    response = post()
    assert response["statusCode"] == 502
    assert body_of(response)["message"] == "Your request could not be sent. Please try again in a moment."

    # The guard forgot it, so the retry is not mistaken for a duplicate.
    booking_rt.store = working_store
    mailer.fail = False
    assert post()["statusCode"] == 200
    assert len(bookings_in(bookings_table)) == 1


def test_a_failed_save_with_a_delivered_notification_still_counts(booking_rt, bookings_table, mailer):
    # The owner email carries the whole request, so the booking is recoverable.
    booking_rt.store = FailingStore()
    response = post()
    assert response["statusCode"] == 200
    assert len(mailer.sent) == 2
    assert bookings_in(bookings_table) == []


def test_records_nothing_for_a_honeypot_hit(booking_rt, bookings_table, mailer):
    response = post({**VALID_BODY, "website": "http://spam.example"})
    assert response["statusCode"] == 200
    assert bookings_in(bookings_table) == []
    assert mailer.sent == []


def test_records_nothing_for_a_booking_that_fails_validation(booking_rt, bookings_table, mailer):
    response = post({**VALID_BODY, "email": "not-an-email"})
    assert response["statusCode"] == 400
    body = body_of(response)
    assert body["ok"] is False
    assert body["errors"] == {"email": "A valid email address is required."}
    assert bookings_in(bookings_table) == []
    assert mailer.sent == []


def test_rate_limits_an_address_after_five_requests(booking_rt, bookings_table, clock):
    for index in range(5):
        assert post({**VALID_BODY, "description": f"attempt {index}"})["statusCode"] == 200
    sixth = post({**VALID_BODY, "description": "attempt 6"})
    assert sixth["statusCode"] == 429
    assert sixth["headers"]["Retry-After"].isdigit()
    assert body_of(sixth)["message"] == "Too many booking requests. Please try again shortly."

    # Another address is unaffected.
    assert post({**VALID_BODY, "description": "attempt 6"}, ip="198.51.100.9")["statusCode"] == 200
    assert len(bookings_in(bookings_table)) == 6


def test_rejects_a_body_that_is_not_json(booking_rt):
    response = post("{not json")
    assert response["statusCode"] == 400
    assert body_of(response) == {"ok": False, "message": "The request body must be JSON."}


def test_rejects_an_oversized_body(booking_rt):
    response = post(json.dumps({**VALID_BODY, "description": "x" * (70 * 1024)}))
    assert response["statusCode"] == 413


def test_unknown_routes_are_404(booking_rt):
    assert booking_handler.handler(api_event("GET", "/nope"))["statusCode"] == 404


def test_the_function_adds_no_cors_headers_of_its_own(booking_rt):
    # API Gateway stamps them on. A second copy from here would be rejected
    # by browsers as a duplicate header.
    for response in (post(), booking_handler.handler(api_event("GET", "/healthz"))):
        assert not any(name.lower().startswith("access-control-") for name in response["headers"])
