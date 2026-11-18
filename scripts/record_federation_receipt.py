#!/usr/bin/env python3
"""Write a non-executing, run-unique federation intake receipt."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

MAX_BRIEF_CHARS = 4000


def main():
    brief = os.getenv("BRIEF", "")
    run_id = os.getenv("RECEIVER_RUN_ID", "")
    if len(brief) > MAX_BRIEF_CHARS:
        raise SystemExit("Federation brief exceeds the 4000-character safety limit.")
    if not run_id or not run_id.isdigit():
        raise SystemExit("A numeric GitHub Actions receiver run ID is required.")

    stamp = datetime.now(timezone.utc)
    payload = {
        "schema_version": 1,
        "received_at": stamp.isoformat(),
        "receiver_run_id": run_id,
        "event": os.getenv("EVENT", ""),
        "source_repository": os.getenv("SOURCE") or "manual",
        "automation_mode": os.getenv("MODE") or "MANUAL",
        "brief": brief,
        "status": "RECEIVED",
        "policies": {
            "no_secret_exposure": True,
            "no_untrusted_execution": True,
            "human_review_before_irreversible_action": True,
        },
    }

    inbox = Path("federation/inbox")
    inbox.mkdir(parents=True, exist_ok=True)
    filename = stamp.strftime("%Y%m%dT%H%M%SZ") + "-" + run_id + ".json"
    destination = inbox / filename
    if destination.exists():
        raise SystemExit("Receipt path already exists; refusing to overwrite.")
    with destination.open("x", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"RECEIPT_WRITTEN {destination}")


if __name__ == "__main__":
    main()
