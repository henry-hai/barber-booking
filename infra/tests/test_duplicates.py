"""
The duplicate guard. A port of server/tests/duplicates.test.ts, with the
guard now a conditional write against a moto table.
"""

from barber.booking import ValidatedBooking
from barber.duplicates import DuplicateGuard, fingerprint, fingerprint_hash
from support import VALID_BOOKING

WINDOW = 10 * 60


def booking(**overrides) -> ValidatedBooking:
    return ValidatedBooking(**{**VALID_BOOKING.__dict__, **overrides})


class TestFingerprint:

    def test_ignores_case_and_surrounding_whitespace(self):
        assert fingerprint(booking(name="  JORDAN reyes ")) == fingerprint(booking(name="Jordan Reyes"))

    def test_ignores_repeated_whitespace_inside_a_value(self):
        assert fingerprint(booking(availability1="After  4pm")) == fingerprint(booking(availability1="after 4pm"))

    def test_does_not_let_a_value_run_into_the_next_field(self):
        a = booking(date2="", availability2="x")
        b = booking(date2="x", availability2="")
        assert fingerprint(a) != fingerprint(b)

    def test_hash_is_fixed_width_hex(self):
        assert len(fingerprint_hash(VALID_BOOKING)) == 64


class TestDuplicateGuard:

    def test_lets_the_first_submission_through(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        assert guard.is_repeat(VALID_BOOKING) is False

    def test_catches_an_identical_submission_moments_later(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        clock.advance(2)
        assert guard.is_repeat(booking(name="  jordan REYES ")) is True

    def test_lets_an_identical_submission_through_once_the_window_has_passed(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        clock.advance(WINDOW + 1)
        assert guard.is_repeat(VALID_BOOKING) is False

    def test_lets_a_client_change_their_times_and_rebook_straight_away(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        assert guard.is_repeat(booking(availability1="After 5pm")) is False

    def test_lets_a_client_correct_a_mistyped_phone_number(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        assert guard.is_repeat(booking(phone="(408) 555-0174")) is False

    def test_treats_two_different_people_as_different_bookings(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        assert guard.is_repeat(booking(name="Sam Reyes", email="sam@example.com")) is False

    def test_forgets_a_booking_so_a_retry_is_not_mistaken_for_a_duplicate(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        guard.forget(VALID_BOOKING)
        assert guard.is_repeat(VALID_BOOKING) is False

    def test_two_instances_share_the_guard(self, bookings_table, clock):
        # Two Lambda instances, one table. The second sees the first's write,
        # which is the whole reason the guard left the process.
        first = DuplicateGuard(bookings_table, WINDOW, clock)
        second = DuplicateGuard(bookings_table, WINDOW, clock)
        first.is_repeat(VALID_BOOKING)
        assert second.is_repeat(VALID_BOOKING) is True

    def test_guard_items_carry_a_ttl_the_table_cleans_up(self, bookings_table, clock):
        guard = DuplicateGuard(bookings_table, WINDOW, clock)
        guard.is_repeat(VALID_BOOKING)
        item = bookings_table.get_item(Key={"bookingId": guard.key(VALID_BOOKING)})["Item"]
        assert item["kind"] == "guard"
        assert int(item["expiresAt"]) == int(clock()) + WINDOW
