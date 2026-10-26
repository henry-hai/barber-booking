"""
The two booking emails. A port of server/tests/emails.test.ts.
"""

import re

from barber.booking import JSON_END, JSON_START, build_booking_payload, parse_booking_block
from barber.emails import escape_html, render_client_confirmation, render_owner_notification
from support import SINGLE_SLOT_BOOKING, SUBMITTED_AT, VALID_BOOKING

PAYLOAD = build_booking_payload(VALID_BOOKING, SUBMITTED_AT)


def test_escape_html_covers_the_five_characters():
    assert escape_html("<a href=\"x\">Tom & Jerry's</a>") == \
        "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;"


class TestClientConfirmation:

    def test_echoes_the_clients_name(self):
        email = render_client_confirmation(PAYLOAD)
        assert "Hi Jordan Reyes," in email.text
        assert "Hi Jordan Reyes," in email.html

    def test_lists_all_three_slots_with_their_availability(self):
        email = render_client_confirmation(PAYLOAD)
        assert "Option 1: Wednesday, August 5, 2026" in email.text
        assert "Availability: After 4pm" in email.text
        assert "Option 3: Sunday, August 9, 2026" in email.text
        assert "Any time Saturday" in email.html

    def test_omits_skipped_slots_rather_than_showing_na(self):
        email = render_client_confirmation(build_booking_payload(SINGLE_SLOT_BOOKING, SUBMITTED_AT))
        assert "Option 2" not in email.text
        assert "N/A" not in email.text
        assert "N/A" not in email.html

    def test_shows_the_submitted_time_in_pacific(self):
        email = render_client_confirmation(PAYLOAD)
        assert "8/1/2026 at 12:30 PM (Pacific)" in email.text

    def test_carries_no_machine_readable_block(self):
        email = render_client_confirmation(PAYLOAD)
        assert JSON_START not in email.text
        assert JSON_START not in email.html

    def test_escapes_client_text_in_the_html(self):
        hostile = build_booking_payload(
            VALID_BOOKING.__class__(**{**VALID_BOOKING.__dict__, "description": "<script>alert(1)</script>"}),
            SUBMITTED_AT,
        )
        email = render_client_confirmation(hostile)
        assert "<script>" not in email.html
        assert "&lt;script&gt;" in email.html


class TestOwnerNotification:

    def test_keeps_the_subject_prefix_the_mailbox_is_filed_under(self):
        assert render_owner_notification(PAYLOAD, "jordan@example.com").subject == \
            "Appointment Request from Jordan Reyes"

    def test_puts_the_sentinel_block_in_the_text_part_only(self):
        email = render_owner_notification(PAYLOAD, "jordan@example.com")
        assert JSON_START in email.text and JSON_END in email.text
        assert JSON_START not in email.html
        assert parse_booking_block(email.text) == PAYLOAD

    def test_includes_the_clients_email_in_the_readable_parts_and_the_payload(self):
        email = render_owner_notification(PAYLOAD, "jordan@example.com")
        assert "Email: jordan@example.com" in email.text
        assert "jordan@example.com" in email.html
        assert parse_booking_block(email.text)["email"] == "jordan@example.com"

    def test_lays_out_with_tables_not_flexbox_or_grid(self):
        html = render_owner_notification(PAYLOAD).html
        assert "<table" in html
        assert "display:flex" not in html and "display:grid" not in html

    def test_styles_inline_rather_than_in_a_stylesheet(self):
        html = render_owner_notification(PAYLOAD).html
        assert "<style" not in html
        assert 'style="' in html

    def test_loads_nothing_from_a_third_party(self):
        html = render_owner_notification(PAYLOAD).html
        assert not re.search(r'src="https?://', html)
        assert "<link" not in html

    def test_sets_a_viewport_and_a_max_width(self):
        html = render_owner_notification(PAYLOAD).html
        assert 'name="viewport"' in html
        assert "max-width:600px" in html
