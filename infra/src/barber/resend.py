"""
Outbound email over Resend's HTTPS API.

Ported from server/src/ResendMailer.ts. The Express server chose between SMTP
and Resend at runtime because a development machine could reach Gmail and
Render could not. Lambda has no SMTP path at all, so Resend is the only
transport here, and the API key comes from Parameter Store at cold start.

urllib rather than a client library: this is one POST with a bearer token,
and a dependency-free function package builds the same everywhere without a
pip step.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Callable, Optional, Protocol

ENDPOINT = "https://api.resend.com/emails"
USER_AGENT = "henryhaistudio-booking/1.0 (+https://henryhaistudio.com)"


class MailerError(Exception):
    """Anything that stopped a message going out."""


class Mailer(Protocol):
    def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str,
        reply_to: Optional[str] = None,
        cc: Optional[str] = None,
    ) -> str: ...


class ResendMailer:
    def __init__(
        self,
        api_key: str,
        sender: str,
        timeout: float = 10.0,
        opener: Callable[..., object] = urllib.request.urlopen,
    ) -> None:
        self.api_key = api_key
        # The verified sender, e.g. "Henry Hai Studio <bookings@henryhaistudio.com>".
        # Resend rejects anything on an unverified domain.
        self.sender = sender
        self.timeout = timeout
        self.opener = opener

    def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str,
        reply_to: Optional[str] = None,
        cc: Optional[str] = None,
    ) -> str:
        """Sends one message and returns Resend's message id."""
        body: dict[str, object] = {
            "from": self.sender,
            "to": [to],
            "subject": subject,
            "text": text,
            "html": html,
        }
        if reply_to:
            body["reply_to"] = [reply_to]
        if cc:
            body["cc"] = [cc]

        request = urllib.request.Request(
            ENDPOINT,
            data=json.dumps(body).encode("utf-8"),
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                # Resend sits behind Cloudflare, which answered the prod
                # function's first sends with a 403 and error code 1010, its
                # "banned browser signature" rule, on urllib's default agent.
                # A named agent is what a real client sends.
                "User-Agent": USER_AGENT,
            },
        )

        try:
            with self.opener(request, timeout=self.timeout) as response:  # type: ignore[call-arg]
                sent = json.loads(response.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as error:
            # Resend returns a JSON error body. Surface it, because "email
            # failed" with no detail is what cost hours on the SMTP path.
            detail = error.read().decode("utf-8", errors="replace")
            raise MailerError(
                f"Resend rejected the message (HTTP {error.code}): {detail}"
            ) from error
        except urllib.error.URLError as error:
            raise MailerError(f"Resend was unreachable: {error.reason}") from error

        return str(sent.get("id", ""))


class DisabledMailer:
    """Stands in when no Resend key is configured. Every send fails loudly,
    which the booking handler logs and survives: a booking that saved is a
    success whether or not its emails went out."""

    def send(self, **_: object) -> str:
        raise MailerError(
            "No Resend API key in Parameter Store, so no email was sent."
        )
