"""
Fixed-window rate limiter, in DynamoDB.

Ported from server/src/RateLimit.ts. That version counted in a Map, which
works for one long lived Node process and not at all for Lambda, where every
concurrent request may land on a fresh instance with an empty Map. The counts
live in the bookings table instead: one item per key per window, bumped with
an atomic ADD so concurrent requests cannot lose each other's increments.

Items are keyed `rl#<key>#<window start>` with a `kind` of `window` and an
`expiresAt` a minute past the window's end, so the table's TTL clears them
and nothing accumulates.

API Gateway's own throttling sits in front of this as a flood backstop. It
counts every caller together, which is what the global window here also does.
This exists for the per address limit, which API Gateway's HTTP APIs do not
offer and AWS WAF does not attach to.
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass
from typing import Any, Callable, Optional

WINDOW_PREFIX = "rl#"


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    # Requests left in the current window.
    remaining: int
    # Seconds until the window resets, for the Retry-After header.
    retry_after_seconds: int


class RateLimiter:
    def __init__(
        self,
        table: Any,
        limit: int,
        window_seconds: int,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.table = table
        self.limit = limit
        self.window_seconds = window_seconds
        self.clock = clock

    def check(self, key: str, now: Optional[float] = None) -> RateLimitResult:
        """Records a hit against the key and reports whether it is allowed."""
        at = now if now is not None else self.clock()
        window_start = int(at // self.window_seconds) * self.window_seconds
        resets_at = window_start + self.window_seconds

        response = self.table.update_item(
            Key={"bookingId": f"{WINDOW_PREFIX}{key}#{window_start}"},
            UpdateExpression="ADD hits :one SET kind = :kind, expiresAt = :expires",
            ExpressionAttributeValues={
                ":one": 1,
                ":kind": "window",
                ":expires": resets_at + 60,
            },
            ReturnValues="UPDATED_NEW",
        )
        hits = int(response["Attributes"]["hits"])

        return RateLimitResult(
            allowed=hits <= self.limit,
            remaining=max(0, self.limit - hits),
            retry_after_seconds=max(1, math.ceil(resets_at - at)),
        )
