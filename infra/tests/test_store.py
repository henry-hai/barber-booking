"""
The bookings and contacts stores.
"""

import pytest

from barber.store import BookingStore, ContactStore, booking_item, clean, to_request
from support import SINGLE_SLOT_BOOKING, SUBMITTED_AT, VALID_BOOKING


def test_clean_treats_na_and_none_as_empty():
    assert clean("N/A") == ""
    assert clean(None) == ""
    assert clean("  x ") == "x"


def test_booking_item_stores_empty_optionals_as_empty_strings():
    item = booking_item(SINGLE_SLOT_BOOKING, booking_id="a", when=SUBMITTED_AT, fingerprint="f")
    assert item["date2"] == "" and item["availability2"] == ""
    assert item["source"] == "web"


def test_to_request_drops_empty_slots_and_keeps_order():
    item = booking_item(VALID_BOOKING, booking_id="a", when=SUBMITTED_AT, fingerprint="f")
    item["date2"] = ""
    item["availability2"] = ""
    request = to_request(item)
    assert [slot["date"] for slot in request["preferred"]] == ["2026-08-05", "2026-08-09"]


def test_put_refuses_to_overwrite_an_existing_id(bookings_table):
    store = BookingStore(bookings_table)
    item = booking_item(VALID_BOOKING, booking_id="same", when=SUBMITTED_AT, fingerprint="f")
    store.put(item)
    with pytest.raises(bookings_table.meta.client.exceptions.ConditionalCheckFailedException):
        store.put(item)
    assert len(store.list_requests()) == 1


def test_contacts_sort_by_name_case_insensitively(contacts_table):
    store = ContactStore(contacts_table)
    store.add_contact("zed", "z@example.com")
    store.add_contact("Amy", "a@example.com")
    store.add_contact("bob", "b@example.com")
    assert [c["name"] for c in store.list_contacts()] == ["Amy", "bob", "zed"]
