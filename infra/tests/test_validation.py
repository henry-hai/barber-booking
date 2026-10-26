"""
Booking validation, the A..L payload, and the sentinel-wrapped serializer.

A port of server/tests/booking.test.ts. The two suites assert the same
inputs produce the same errors and the same payload, which is what makes the
Lambda a drop-in for the Express route.
"""

from datetime import datetime, timezone

import pytest

from barber.booking import (
    JSON_END,
    JSON_START,
    NA,
    build_booking_payload,
    format_submitted_at,
    is_honeypot_tripped,
    parse_booking_block,
    serialize_booking_block,
    validate_booking,
)
from support import (
    COLUMN_KEYS,
    SINGLE_SLOT_BOOKING,
    SUBMITTED_AT,
    SUBMITTED_DATE_LA,
    SUBMITTED_TIME_LA,
    VALID_BODY,
    VALID_BOOKING,
)


class TestValidateBooking:

    def test_accepts_a_complete_booking_and_trims(self):
        result = validate_booking({**VALID_BODY, "name": "  Jordan Reyes  "})
        assert result.errors == {}
        assert result.booking is not None
        assert result.booking.name == "Jordan Reyes"

    def test_accepts_only_the_first_slot(self):
        result = validate_booking({
            **VALID_BODY, "date2": "", "availability2": "", "date3": "", "availability3": "",
        })
        assert result.errors == {}

    def test_rejects_an_empty_body_without_throwing(self):
        result = validate_booking({})
        assert result.booking is None
        assert sorted(result.errors) == [
            "availability1", "date1", "description", "email", "name", "phone", "policiesAccepted",
        ]

    def test_rejects_non_string_values_rather_than_coercing(self):
        result = validate_booking({**VALID_BODY, "name": {"toString": "injected"}, "phone": 4085550147})
        assert "name" in result.errors
        assert "phone" in result.errors

    def test_rejects_a_calendar_date_that_does_not_exist(self):
        assert "date1" in validate_booking({**VALID_BODY, "date1": "2026-02-31"}).errors
        assert "date1" in validate_booking({**VALID_BODY, "date1": "2026-13-01"}).errors

    def test_leap_day(self):
        assert validate_booking({**VALID_BODY, "date1": "2028-02-29"}).errors == {}
        assert "date1" in validate_booking({**VALID_BODY, "date1": "2027-02-29"}).errors

    def test_slots_2_and_3_must_be_complete_pairs(self):
        assert "date2" in validate_booking({**VALID_BODY, "availability2": "Evenings", "date2": ""}).errors
        assert "availability3" in validate_booking({**VALID_BODY, "date3": "2026-08-09", "availability3": ""}).errors

    def test_policies_must_be_boolean_true(self):
        for value in ("true", 1, "yes", None):
            assert "policiesAccepted" in validate_booking({**VALID_BODY, "policiesAccepted": value}).errors

    def test_length_caps(self):
        assert "name" in validate_booking({**VALID_BODY, "name": "x" * 101}).errors
        assert "description" in validate_booking({**VALID_BODY, "description": "x" * 2001}).errors
        assert "availability1" in validate_booking({**VALID_BODY, "availability1": "x" * 501}).errors
        assert "phone" in validate_booking({**VALID_BODY, "phone": "1234567" + "-" * 30}).errors
        assert validate_booking({**VALID_BODY, "name": "x" * 100}).errors == {}

    def test_phone_needs_seven_digits(self):
        assert "phone" in validate_booking({**VALID_BODY, "phone": "555-01"}).errors
        assert validate_booking({**VALID_BODY, "phone": "+1 (408) 555 0147"}).errors == {}

    def test_requires_a_plausible_email(self):
        for bad in ("no-at.example.com", "two@@example.com", "a@b", "a b@example.com"):
            assert "email" in validate_booking({**VALID_BODY, "email": bad}).errors, bad
        assert validate_booking({**VALID_BODY, "email": "first.last+tag@example.co.uk"}).errors == {}

    def test_messages_match_the_express_route(self):
        errors = validate_booking({}).errors
        assert errors["name"] == "A name is required."
        assert errors["policiesAccepted"] == "The booking policies must be accepted."
        assert validate_booking({**VALID_BODY, "name": "x" * 101}).errors["name"] == \
            "Name must be 100 characters or fewer."


class TestHoneypot:

    def test_false_for_a_normal_submission(self):
        assert is_honeypot_tripped(VALID_BODY) is False
        assert is_honeypot_tripped({**VALID_BODY, "website": "   "}) is False

    def test_true_when_the_hidden_field_carries_anything(self):
        assert is_honeypot_tripped({**VALID_BODY, "website": "http://spam.example"}) is True


class TestFormatSubmittedAt:

    def test_formats_in_los_angeles_regardless_of_host_timezone(self):
        assert format_submitted_at(SUBMITTED_AT) == {"date": SUBMITTED_DATE_LA, "time": SUBMITTED_TIME_LA}

    def test_keeps_the_two_digit_hour_the_sheet_has_always_had(self):
        early = datetime(2026, 8, 1, 15, 5, tzinfo=timezone.utc)
        assert format_submitted_at(early)["time"] == "08:05 AM"

    def test_a_late_evening_booking_stays_on_its_pacific_day(self):
        # 06:30 UTC on the 2nd is 11:30 PM on the 1st in Milpitas.
        late = datetime(2026, 8, 2, 6, 30, tzinfo=timezone.utc)
        assert format_submitted_at(late) == {"date": "8/1/2026", "time": "11:30 PM"}


class TestBuildBookingPayload:

    def test_emits_exactly_the_twelve_columns_in_order(self):
        payload = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)
        assert list(payload) == COLUMN_KEYS

    def test_maps_each_field_to_its_column(self):
        payload = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)
        assert payload == {
            "name": "Jordan Reyes",
            "date": SUBMITTED_DATE_LA,
            "time": SUBMITTED_TIME_LA,
            "phone": "(408) 555-0147",
            "date1": "2026-08-05",
            "avail1": "After 4pm",
            "date2": "2026-08-07",
            "avail2": "Mornings only",
            "date3": "2026-08-09",
            "avail3": "Any time Saturday",
            "description": "Mid fade, scissor top, beard line-up",
            "email": "jordan@example.com",
        }

    def test_writes_na_for_skipped_slots(self):
        payload = build_booking_payload(SINGLE_SLOT_BOOKING, SUBMITTED_AT)
        assert (payload["date2"], payload["avail2"], payload["date3"], payload["avail3"]) == (NA, NA, NA, NA)

    def test_puts_the_email_last_so_a_to_k_keep_their_columns(self):
        assert COLUMN_KEYS[-1] == "email"
        assert COLUMN_KEYS[:11] == [
            "name", "date", "time", "phone",
            "date1", "avail1", "date2", "avail2", "date3", "avail3", "description",
        ]


class TestSerializeBookingBlock:

    def test_uses_the_exact_sentinel_strings(self):
        assert JSON_START == "---BOOKING_JSON_START---"
        assert JSON_END == "---BOOKING_JSON_END---"
        block = serialize_booking_block(build_booking_payload(VALID_BOOKING, SUBMITTED_AT))
        assert block.startswith(JSON_START + "\n")
        assert block.endswith("\n" + JSON_END)

    def test_round_trips_a_payload_and_its_key_order(self):
        payload = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)
        parsed = parse_booking_block(serialize_booking_block(payload))
        assert parsed == payload
        assert list(parsed) == COLUMN_KEYS

    def test_survives_characters_that_would_break_a_label_anchored_parser(self):
        hostile = ValidatedBooking_with(description='Phone #: 555\nPreferred Date 1: never "quoted" \\ done')
        payload = build_booking_payload(hostile, SUBMITTED_AT)
        assert parse_booking_block(serialize_booking_block(payload)) == payload

    def test_survives_a_maximum_length_description(self):
        payload = build_booking_payload(ValidatedBooking_with(description="x" * 2000), SUBMITTED_AT)
        assert parse_booking_block(serialize_booking_block(payload))["description"] == "x" * 2000

    def test_finds_the_block_inside_a_full_email_body(self):
        payload = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)
        body = f"New request.\n\nSome prose here.\n\n{serialize_booking_block(payload)}\n\n-- \nSignature"
        assert parse_booking_block(body) == payload

    def test_throws_when_the_start_sentinel_is_missing(self):
        with pytest.raises(ValueError, match="Missing ---BOOKING_JSON_START---"):
            parse_booking_block('{"name": "x"}\n' + JSON_END)

    def test_throws_when_the_end_sentinel_is_missing_rather_than_parsing_what_follows(self):
        with pytest.raises(ValueError, match="Missing ---BOOKING_JSON_END---"):
            parse_booking_block(JSON_START + '\n{"name": "x"}\n')

    def test_ignores_a_second_block_later_in_the_body(self):
        first = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)
        second = build_booking_payload(SINGLE_SLOT_BOOKING, SUBMITTED_AT)
        body = serialize_booking_block(first) + "\n\n" + serialize_booking_block(second)
        assert parse_booking_block(body) == first


def ValidatedBooking_with(**overrides):  # noqa: N802  reads as a constructor
    from barber.booking import ValidatedBooking
    return ValidatedBooking(**{**VALID_BOOKING.__dict__, **overrides})
