"""
The fixed-window rate limiter, counted in DynamoDB.
"""

from barber.ratelimit import RateLimiter


def test_allows_up_to_the_limit_then_refuses(bookings_table, clock):
    limiter = RateLimiter(bookings_table, limit=3, window_seconds=60, clock=clock)
    results = [limiter.check("203.0.113.5") for _ in range(4)]
    assert [r.allowed for r in results] == [True, True, True, False]
    assert [r.remaining for r in results] == [2, 1, 0, 0]


def test_retry_after_counts_down_to_the_window_end(bookings_table, clock):
    clock.now = 1_800_000_000.0  # a window boundary for 60 s windows
    limiter = RateLimiter(bookings_table, limit=1, window_seconds=60, clock=clock)
    limiter.check("k")
    clock.advance(45)
    assert limiter.check("k").retry_after_seconds == 15


def test_keys_are_independent(bookings_table, clock):
    limiter = RateLimiter(bookings_table, limit=1, window_seconds=60, clock=clock)
    assert limiter.check("a").allowed is True
    assert limiter.check("a").allowed is False
    assert limiter.check("b").allowed is True


def test_a_new_window_starts_fresh(bookings_table, clock):
    limiter = RateLimiter(bookings_table, limit=1, window_seconds=60, clock=clock)
    limiter.check("k")
    assert limiter.check("k").allowed is False
    clock.advance(60)
    assert limiter.check("k").allowed is True


def test_two_instances_count_together(bookings_table, clock):
    one = RateLimiter(bookings_table, limit=2, window_seconds=60, clock=clock)
    two = RateLimiter(bookings_table, limit=2, window_seconds=60, clock=clock)
    one.check("k")
    two.check("k")
    assert one.check("k").allowed is False


def test_window_items_expire(bookings_table, clock):
    limiter = RateLimiter(bookings_table, limit=1, window_seconds=60, clock=clock)
    limiter.check("k")
    items = bookings_table.scan()["Items"]
    assert len(items) == 1
    assert items[0]["kind"] == "window"
    assert int(items[0]["expiresAt"]) > int(clock())
