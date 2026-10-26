# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "boto3>=1.35",
#   "botocore[crt]>=1.35",
#   "google-api-python-client>=2.150",
#   "google-auth>=2.35",
# ]
# ///
# botocore[crt] is what lets boto3 use the `aws login` session the CLI holds.
# Without it the script fails with MissingDependencyException before it reads
# anything.
"""
One-time import of the booking sheet into a DynamoDB bookings table.

    uv run infra/scripts/import_sheet.py --stage test            # dry run, writes nothing
    uv run infra/scripts/import_sheet.py --stage test --apply
    uv run infra/scripts/import_sheet.py --stage prod --apply

WHAT IT READS
Columns A through L, the twelve the server has always written: name,
submitted date, submitted time, phone, then the three preferred date and
availability pairs, the description, and the email. The sheet is opened with
a read-only scope. This script cannot write to it.

WHAT IT WRITES
One item per row, keyed `sheet#<sha256 of the twelve cells>`, with a
conditional put so running it twice writes nothing twice. Two rows that are
byte for byte identical collapse into one, which is the right outcome for
the double submissions the sheet is known to hold. The item carries
`source: sheet-import` so it can be told from a booking the API wrote.

The submission instant is rebuilt from columns B and C in Pacific time. A
row whose date will not parse keeps its original text for display and gets
an ordering timestamp in 1970 so it sorts to the bottom rather than failing.

--replace deletes every `sheet#` item already in the table before writing,
for when the mapping changes and the hashes with it.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import boto3
from boto3.dynamodb.conditions import Attr
from google.oauth2 import service_account
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parents[2]
PACIFIC = ZoneInfo("America/Los_Angeles")
READ_ONLY = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

# Columns A through L, in order.
COLUMNS = (
    "name", "submittedDate", "submittedTime", "phone",
    "date1", "availability1", "date2", "availability2", "date3", "availability3",
    "description", "email",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--stage", choices=["test", "prod"], default="test")
    parser.add_argument("--apply", action="store_true", help="write to the table. Without it, a dry run.")
    parser.add_argument("--replace", action="store_true", help="delete existing sheet# items first.")
    parser.add_argument("--region", default="us-west-2")
    parser.add_argument("--server-info", type=Path, default=ROOT / "server" / "serverInfo.json")
    parser.add_argument("--service-account", type=Path, default=ROOT / "server" / "serviceAccount.json")
    return parser.parse_args()


def sheet_title(a1_range: str) -> str:
    return a1_range.split("!")[0].strip("'") if "!" in a1_range else ""


def read_sheet(spreadsheet_id: str, title: str, key_file: Path) -> list[list[str]]:
    """Rows as twelve trimmed cells each, header excluded."""
    credentials = service_account.Credentials.from_service_account_file(str(key_file), scopes=READ_ONLY)
    sheets = build("sheets", "v4", credentials=credentials, cache_discovery=False)
    prefix = f"'{title}'!" if title else ""
    response = sheets.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id, range=f"{prefix}A:L"
    ).execute()
    values = response.get("values", [])
    return [[str(c).strip() for c in (row + [""] * 12)[:12]] for row in values[1:]]


def na(value: str) -> str:
    return "" if value == "N/A" else value


def submitted_instant(date_text: str, time_text: str, fallback_order: int) -> tuple[datetime, bool]:
    """(instant in UTC, parsed). Column B is M/D/YYYY, column C is hh:mm AM."""
    for date_format in ("%m/%d/%Y", "%Y-%m-%d"):
        try:
            day = datetime.strptime(date_text, date_format)
            break
        except ValueError:
            continue
    else:
        return datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=fallback_order), False

    try:
        clock = datetime.strptime(time_text.upper(), "%I:%M %p")
    except ValueError:
        clock = datetime(1900, 1, 1, 12, 0)

    local = day.replace(hour=clock.hour, minute=clock.minute, tzinfo=PACIFIC)
    return local.astimezone(timezone.utc), True


def build_item(cells: list[str], order: int) -> dict:
    row = dict(zip(COLUMNS, cells))
    digest = hashlib.sha256("\x1f".join(cells).encode("utf-8")).hexdigest()
    when, parsed = submitted_instant(row["submittedDate"], row["submittedTime"], order)

    item = {
        "bookingId": f"sheet#{digest}",
        "kind": "booking",
        "submittedAt": when.isoformat(timespec="seconds"),
        "date": when.astimezone(PACIFIC).date().isoformat() if parsed else "1970-01-01",
        "source": "sheet-import",
    }
    item.update({key: na(value) for key, value in row.items()})
    return item


def main() -> int:
    args = parse_args()

    info = json.loads(args.server_info.read_text())
    sheets_config = info.get("sheets") or {}
    spreadsheet_id = sheets_config.get("spreadsheetId")
    if not spreadsheet_id:
        print(f"No sheets.spreadsheetId in {args.server_info}", file=sys.stderr)
        return 1

    rows = read_sheet(spreadsheet_id, sheet_title(sheets_config.get("range", "")), args.service_account)
    # The sheet is newest first. Number from the bottom so the fallback order
    # for unparseable dates keeps older rows older.
    items = [build_item(cells, len(rows) - index) for index, cells in enumerate(rows)]
    items = [item for item in items if item["name"] or item["description"] or item["availability1"]]

    unique = {item["bookingId"]: item for item in items}
    unparsed = [item for item in unique.values() if item["date"] == "1970-01-01"]

    print(f"Read {len(rows)} rows, {len(items)} with content, {len(unique)} distinct.")
    print(f"With a phone: {sum(1 for i in unique.values() if i['phone'])}. "
          f"With an email: {sum(1 for i in unique.values() if i['email'])}.")
    if unparsed:
        print(f"{len(unparsed)} rows had a date that would not parse and will sort last:")
        for item in unparsed:
            print(f"   {item['name']!r} {item['submittedDate']!r} {item['submittedTime']!r}")

    if not args.apply:
        print("\nDry run. Re-run with --apply to write.")
        return 0

    table = boto3.resource("dynamodb", region_name=args.region).Table(f"barber-bookings-{args.stage}")

    if args.replace:
        removed = 0
        scan = {"FilterExpression": Attr("bookingId").begins_with("sheet#"), "ProjectionExpression": "bookingId"}
        while True:
            page = table.scan(**scan)
            with table.batch_writer() as batch:
                for old in page.get("Items", []):
                    batch.delete_item(Key={"bookingId": old["bookingId"]})
                    removed += 1
            if "LastEvaluatedKey" not in page:
                break
            scan["ExclusiveStartKey"] = page["LastEvaluatedKey"]
        print(f"Removed {removed} earlier sheet# items.")

    written = skipped = 0
    for item in unique.values():
        try:
            table.put_item(Item=item, ConditionExpression="attribute_not_exists(bookingId)")
            written += 1
        except table.meta.client.exceptions.ConditionalCheckFailedException:
            skipped += 1

    print(f"Wrote {written} items to {table.name}, skipped {skipped} already present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
