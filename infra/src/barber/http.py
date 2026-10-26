"""
Request parsing and responses for API Gateway's HTTP API (payload format 2.0).

CORS is deliberately absent here. The HTTP API answers preflights itself and
stamps the allow headers onto every response, including the Lambda's 4xx and
5xx ones, from the CorsConfiguration in template.yaml. Adding the headers
again from the function would double them, which browsers reject.
"""

from __future__ import annotations

import base64
import json
from typing import Any, Optional

JSON_HEADERS = {"Content-Type": "application/json; charset=utf-8"}

# Express capped the body at 64 KB. The booking's own field limits add up to
# a few KB, so anything near this is not a real booking.
MAX_BODY_BYTES = 64 * 1024


class BadRequest(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


def respond(status: int, body: Any, headers: Optional[dict[str, str]] = None) -> dict[str, Any]:
    return {
        "statusCode": status,
        "headers": {**JSON_HEADERS, **(headers or {})},
        "body": json.dumps(body),
    }


def route_key(event: dict[str, Any]) -> str:
    """"POST /booking", "GET /contacts/{id}" and so on, as API Gateway routes it."""
    if event.get("routeKey"):
        return str(event["routeKey"])
    http = event.get("requestContext", {}).get("http", {})
    return f"{http.get('method', '')} {http.get('path', '')}"


def header(event: dict[str, Any], name: str) -> Optional[str]:
    """Case-insensitive header lookup. API Gateway lowercases them, but a
    locally built event may not."""
    wanted = name.lower()
    for key, value in (event.get("headers") or {}).items():
        if key.lower() == wanted:
            return value
    return None


def source_ip(event: dict[str, Any]) -> str:
    return str(event.get("requestContext", {}).get("http", {}).get("sourceIp") or "unknown")


def path_param(event: dict[str, Any], name: str) -> Optional[str]:
    return (event.get("pathParameters") or {}).get(name)


def json_body(event: dict[str, Any]) -> dict[str, Any]:
    """The request body as a dict. An absent body is {}. Anything that is not
    a JSON object is a 400, and anything oversized is a 413, before any
    handler logic runs."""
    raw = event.get("body")
    if raw is None or raw == "":
        return {}

    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8", errors="replace")

    if len(raw.encode("utf-8")) > MAX_BODY_BYTES:
        raise BadRequest(413, "The request body is too large.")

    try:
        parsed = json.loads(raw)
    except ValueError as error:
        raise BadRequest(400, "The request body must be JSON.") from error

    if not isinstance(parsed, dict):
        raise BadRequest(400, "The request body must be a JSON object.")

    return parsed
