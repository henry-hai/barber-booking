"""
HTTP basic auth for the dashboard routes.

Ported from server/src/Auth.ts. The dashboard shows client names, phone
numbers and appointment times, so every route it calls sits behind this.
POST /booking does not: it is the public route the site posts to from another
origin, with no credentials to offer.

The expected credentials come from Parameter Store, never from the template
or the code. When they are absent the guard fails closed and every protected
route answers 503, so a misconfigured stage exposes nothing rather than
quietly serving the dashboard to whoever finds the URL.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import re
from dataclasses import dataclass
from typing import Optional

REALM = 'Basic realm="Henry Hai Studio appointments", charset="UTF-8"'


@dataclass(frozen=True)
class Credentials:
    user: str
    password: str


def parse_basic_auth(header: Optional[str]) -> Optional[Credentials]:
    """Pulls the user and password out of an Authorization header. Returns
    None for anything that is not a well-formed Basic credential."""
    if not isinstance(header, str):
        return None

    match = re.match(r"^Basic\s+(.+)$", header.strip(), re.IGNORECASE)
    if match is None:
        return None

    try:
        decoded = base64.b64decode(match.group(1), validate=False).decode("utf-8")
    except (binascii.Error, ValueError):
        return None

    # The password may itself contain colons, so split on the first one only.
    separator = decoded.find(":")
    if separator == -1:
        return None

    return Credentials(user=decoded[:separator], password=decoded[separator + 1:])


def safe_equal(a: str, b: str) -> bool:
    """Constant-time comparison. compare_digest leaks nothing about where two
    equal-length inputs differ, and hashing both sides first makes them equal
    length, so the length of the real password is not leaked either."""
    digest = lambda value: hashlib.sha256(value.encode("utf-8")).digest()  # noqa: E731
    return hmac.compare_digest(digest(a), digest(b))


def credentials_match(offered: Optional[Credentials], expected: Credentials) -> bool:
    """Both comparisons always run, so the response time does not reveal
    whether it was the user or the password that was wrong."""
    if offered is None:
        return False
    results = [
        safe_equal(offered.user, expected.user),
        safe_equal(offered.password, expected.password),
    ]
    return all(results)
