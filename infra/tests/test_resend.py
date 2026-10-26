"""
The Resend client, with urlopen replaced by a recorder.
"""

import io
import json
import urllib.error

import pytest

from barber.resend import ENDPOINT, USER_AGENT, MailerError, ResendMailer


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


def test_posts_the_message_with_a_named_user_agent():
    seen = {}

    def opener(request, timeout):
        seen["url"] = request.full_url
        seen["headers"] = {k.lower(): v for k, v in request.header_items()}
        seen["body"] = json.loads(request.data)
        return FakeResponse(b'{"id": "msg_1"}')

    mailer = ResendMailer("re_test", "Henry Hai Studio <bookings@example.com>", opener=opener)
    message_id = mailer.send(to="a@example.com", subject="s", text="t", html="<p>h</p>", reply_to="r@example.com", cc="c@example.com")

    assert message_id == "msg_1"
    assert seen["url"] == ENDPOINT
    assert seen["headers"]["authorization"] == "Bearer re_test"
    assert seen["headers"]["content-type"] == "application/json"
    # Cloudflare in front of Resend rejected urllib's default agent with 403
    # error 1010 on the prod function's first sends.
    assert seen["headers"]["user-agent"] == USER_AGENT
    assert seen["body"] == {
        "from": "Henry Hai Studio <bookings@example.com>",
        "to": ["a@example.com"],
        "subject": "s",
        "text": "t",
        "html": "<p>h</p>",
        "reply_to": ["r@example.com"],
        "cc": ["c@example.com"],
    }


def test_omits_reply_to_and_cc_when_absent():
    seen = {}

    def opener(request, timeout):
        seen["body"] = json.loads(request.data)
        return FakeResponse(b"{}")

    ResendMailer("re_test", "x <x@example.com>", opener=opener).send(to="a@example.com", subject="s", text="t", html="h")
    assert "reply_to" not in seen["body"] and "cc" not in seen["body"]


def test_surfaces_resends_error_body():
    def opener(request, timeout):
        raise urllib.error.HTTPError(ENDPOINT, 403, "Forbidden", {}, io.BytesIO(b"error code: 1010"))

    with pytest.raises(MailerError, match=r"HTTP 403\): error code: 1010"):
        ResendMailer("re_test", "x <x@example.com>", opener=opener).send(to="a@example.com", subject="s", text="t", html="h")


def test_reports_an_unreachable_resend():
    def opener(request, timeout):
        raise urllib.error.URLError("name resolution failed")

    with pytest.raises(MailerError, match="unreachable"):
        ResendMailer("re_test", "x <x@example.com>", opener=opener).send(to="a@example.com", subject="s", text="t", html="h")
