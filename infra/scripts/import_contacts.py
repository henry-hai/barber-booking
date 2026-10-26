# /// script
# requires-python = ">=3.13"
# dependencies = ["boto3>=1.35", "botocore[crt]>=1.35"]
# ///
"""
Copies contacts out of the mail client's NeDB file into the contacts table.

    uv run infra/scripts/import_contacts.py path/to/contacts.db            # dry run
    uv run infra/scripts/import_contacts.py path/to/contacts.db --apply    # writes

Where the contacts lived: server/dist/contacts.db, written by NeDB next to
the compiled server. On Render that path is inside the build output on an
ephemeral disk, so it was emptied on every deploy, and no copy exists on this
machine (checked 2026-10-24). This script exists for the case where one
turns up. Nothing in the running dashboard ever wrote a contact, so there is
most likely nothing to import.

NeDB's file is one JSON document per line, with later lines superseding
earlier ones for the same _id and `$$deleted` marking a removal.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import boto3


def load_nedb(path: Path) -> list[dict]:
    documents: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        document = json.loads(line)
        identifier = document.get("_id")
        if not identifier:
            continue
        if document.get("$$deleted"):
            documents.pop(identifier, None)
        else:
            documents[identifier] = document
    return list(documents.values())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("file", type=Path)
    parser.add_argument("--stage", choices=["test"], default="test")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--region", default="us-west-2")
    args = parser.parse_args()

    contacts = [
        {
            "contactId": str(document["_id"]),
            "name": str(document.get("name", "")).strip(),
            "email": str(document.get("email", "")).strip(),
            "createdAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        }
        for document in load_nedb(args.file)
    ]
    contacts = [contact for contact in contacts if contact["name"] and contact["email"]]

    print(f"{len(contacts)} contacts in {args.file}")
    for contact in contacts:
        print(f"   {contact['name']} <{contact['email']}>")

    if not args.apply:
        print("\nDry run. Re-run with --apply to write.")
        return 0

    table = boto3.resource("dynamodb", region_name=args.region).Table(f"barber-contacts-{args.stage}")
    for contact in contacts:
        table.put_item(Item=contact)
    print(f"\nWrote {len(contacts)} contacts to {table.name}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
