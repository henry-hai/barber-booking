"""
Parameter Store reads, cached per cold start.
"""

import boto3

from barber import secrets


def test_reads_a_secure_string_decrypted(aws):
    boto3.client("ssm").put_parameter(Name="/barber/test/resend/api-key", Value="re_123", Type="SecureString")
    assert secrets.read_parameter("/barber/test/resend/api-key") == "re_123"


def test_a_missing_parameter_is_none_not_an_error(aws):
    assert secrets.read_parameter("/barber/test/resend/api-key") is None


def test_the_value_is_cached_for_the_life_of_the_instance(aws):
    ssm = boto3.client("ssm")
    ssm.put_parameter(Name="/barber/test/dashboard/user", Value="henry", Type="SecureString")
    assert secrets.read_parameter("/barber/test/dashboard/user") == "henry"
    ssm.delete_parameter(Name="/barber/test/dashboard/user")
    assert secrets.read_parameter("/barber/test/dashboard/user") == "henry"
    secrets.reset()
    assert secrets.read_parameter("/barber/test/dashboard/user") is None


def test_the_handlers_build_from_parameter_store(aws, bookings_table, contacts_table, monkeypatch):
    import booking_handler
    import dashboard_handler
    from barber.resend import DisabledMailer, ResendMailer

    ssm = boto3.client("ssm")
    ssm.put_parameter(Name="/barber/test/dashboard/user", Value="henry", Type="SecureString")
    ssm.put_parameter(Name="/barber/test/dashboard/password", Value="pw", Type="SecureString")

    # No Resend key: the booking function still builds, with sending disabled.
    rt = booking_handler.build_runtime()
    assert isinstance(rt.mailer, DisabledMailer)
    assert rt.owner_email == "owner@example.com"
    assert rt.owner_cc == ""
    monkeypatch.setenv("OWNER_CC", " backup@example.com ")
    assert booking_handler.build_runtime().owner_cc == "backup@example.com"

    ssm.put_parameter(Name="/barber/test/resend/api-key", Value="re_123", Type="SecureString")
    secrets.reset()
    rt = booking_handler.build_runtime()
    assert isinstance(rt.mailer, ResendMailer)
    assert rt.mailer.sender == "Henry Hai Studio <bookings@example.com>"

    drt = dashboard_handler.build_runtime()
    assert drt.expected is not None
    assert (drt.expected.user, drt.expected.password) == ("henry", "pw")
