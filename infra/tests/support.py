"""
Shared fixtures and helpers. The values mirror server/tests/fixtures.ts so
the two suites assert the same booking produces the same rows and emails.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import yaml

from barber.booking import ValidatedBooking
from barber.resend import MailerError

INFRA = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = INFRA / "template.yaml"

# 19:30 UTC is 12:30 PDT, which makes the America/Los_Angeles conversion in
# the timestamp visible rather than a no-op.
SUBMITTED_AT = datetime(2026, 8, 1, 19, 30, tzinfo=timezone.utc)
SUBMITTED_DATE_LA = "8/1/2026"
SUBMITTED_TIME_LA = "12:30 PM"

# Payload keys A..L, in order. The order itself is the contract.
COLUMN_KEYS = [
    "name", "date", "time", "phone",
    "date1", "avail1", "date2", "avail2", "date3", "avail3",
    "description", "email",
]

VALID_BODY: dict[str, Any] = {
    "name": "Jordan Reyes",
    "email": "jordan@example.com",
    "phone": "(408) 555-0147",
    "date1": "2026-08-05",
    "availability1": "After 4pm",
    "date2": "2026-08-07",
    "availability2": "Mornings only",
    "date3": "2026-08-09",
    "availability3": "Any time Saturday",
    "description": "Mid fade, scissor top, beard line-up",
    "policiesAccepted": True,
}

VALID_BOOKING = ValidatedBooking(
    name=VALID_BODY["name"],
    email=VALID_BODY["email"],
    phone=VALID_BODY["phone"],
    date1=VALID_BODY["date1"],
    availability1=VALID_BODY["availability1"],
    date2=VALID_BODY["date2"],
    availability2=VALID_BODY["availability2"],
    date3=VALID_BODY["date3"],
    availability3=VALID_BODY["availability3"],
    description=VALID_BODY["description"],
)

# Only the first slot filled, which is the common case.
SINGLE_SLOT_BOOKING = ValidatedBooking(
    **{**VALID_BOOKING.__dict__, "date2": "", "availability2": "", "date3": "", "availability3": ""}
)


class RecordingMailer:
    """Records instead of sending. Flip `fail` to make every send raise the
    way Resend does when it rejects a message."""

    def __init__(self) -> None:
        self.sent: list[dict[str, Any]] = []
        self.fail = False

    def send(self, **message: Any) -> str:
        if self.fail:
            raise MailerError("Resend rejected the message (HTTP 500): simulated")
        self.sent.append(message)
        return f"msg-{len(self.sent)}"


class FakeClock:
    def __init__(self, start: float = 1_800_000_000.0) -> None:
        self.now = start

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def api_event(
    method: str,
    path: str,
    body: Any = None,
    headers: Optional[dict[str, str]] = None,
    ip: str = "203.0.113.5",
    path_params: Optional[dict[str, str]] = None,
    route: Optional[str] = None,
) -> dict[str, Any]:
    """An API Gateway HTTP API (payload 2.0) event, the way Lambda sees it."""
    if body is not None and not isinstance(body, str):
        body = json.dumps(body)
    return {
        "version": "2.0",
        "routeKey": route or f"{method} {path}",
        "rawPath": path,
        "headers": {"content-type": "application/json", **(headers or {})},
        "requestContext": {"http": {"method": method, "path": path, "sourceIp": ip}},
        "body": body,
        "isBase64Encoded": False,
        "pathParameters": path_params,
    }


def body_of(response: dict[str, Any]) -> Any:
    return json.loads(response["body"])


# --- template.yaml, read the way the tests need it ---------------------------

class CfnLoader(yaml.SafeLoader):
    """Keeps CloudFormation's short-form tags as plain dicts instead of
    choking on them."""


def _tag(loader: yaml.Loader, suffix: str, node: yaml.Node) -> Any:
    if isinstance(node, yaml.ScalarNode):
        value: Any = loader.construct_scalar(node)
    elif isinstance(node, yaml.SequenceNode):
        value = loader.construct_sequence(node)
    else:
        value = loader.construct_mapping(node)
    return {"Ref" if suffix == "Ref" else f"Fn::{suffix}": value}


CfnLoader.add_multi_constructor("!", _tag)


def load_template() -> dict[str, Any]:
    return yaml.load(TEMPLATE_PATH.read_text(), Loader=CfnLoader)


def resolve(value: Any, stage: str = "test") -> Any:
    """Resolves the handful of intrinsics the table definitions use."""
    if isinstance(value, dict) and "Fn::Sub" in value and isinstance(value["Fn::Sub"], str):
        return re.sub(r"\$\{Stage\}", stage, value["Fn::Sub"])
    return value


def table_definitions(template: dict[str, Any], stage: str = "test") -> list[dict[str, Any]]:
    """The DynamoDB tables exactly as template.yaml declares them, in the
    shape create_table takes. The suite creates these, so a key schema change
    in the template that the code does not handle fails here first."""
    tables = []
    for resource in template["Resources"].values():
        if resource["Type"] != "AWS::DynamoDB::Table":
            continue
        props = resource["Properties"]
        spec: dict[str, Any] = {
            "TableName": resolve(props["TableName"], stage),
            "AttributeDefinitions": props["AttributeDefinitions"],
            "KeySchema": props["KeySchema"],
            "BillingMode": props["BillingMode"],
            "ProvisionedThroughput": props["ProvisionedThroughput"],
        }
        if "GlobalSecondaryIndexes" in props:
            spec["GlobalSecondaryIndexes"] = props["GlobalSecondaryIndexes"]
        tables.append(spec)
    return tables
