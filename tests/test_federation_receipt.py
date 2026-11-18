import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "record_federation_receipt.py"


def run_writer(root, run_id, brief="pilot brief"):
    env = os.environ.copy()
    env.update({
        "BRIEF": brief,
        "RECEIVER_RUN_ID": str(run_id),
        "EVENT": "repository_dispatch",
        "SOURCE": "rampaulsaini/Omniverse-Platform",
        "MODE": "AUTOMISSION",
    })
    return subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=root,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


class FederationReceiptTests(unittest.TestCase):
    def test_dispatch_brief_is_preserved(self):
        with tempfile.TemporaryDirectory() as temp:
            result = run_writer(temp, 1001, "dispatch payload brief")
            self.assertEqual(result.returncode, 0, result.stderr)
            files = list((Path(temp) / "federation" / "inbox").glob("*.json"))
            self.assertEqual(len(files), 1)
            payload = json.loads(files[0].read_text(encoding="utf-8"))
            self.assertEqual(payload["brief"], "dispatch payload brief")
            self.assertEqual(payload["receiver_run_id"], "1001")
            self.assertEqual(payload["source_repository"], "rampaulsaini/Omniverse-Platform")

    def test_distinct_run_ids_create_distinct_receipts(self):
        with tempfile.TemporaryDirectory() as temp:
            first = run_writer(temp, 2001)
            second = run_writer(temp, 2002)
            self.assertEqual(first.returncode, 0, first.stderr)
            self.assertEqual(second.returncode, 0, second.stderr)
            files = list((Path(temp) / "federation" / "inbox").glob("*.json"))
            self.assertEqual(len(files), 2)
            self.assertEqual(
                {json.loads(p.read_text(encoding="utf-8"))["receiver_run_id"] for p in files},
                {"2001", "2002"},
            )

    def test_oversized_brief_is_rejected_without_receipt(self):
        with tempfile.TemporaryDirectory() as temp:
            result = run_writer(temp, 3001, "x" * 4001)
            self.assertNotEqual(result.returncode, 0)
            inbox = Path(temp) / "federation" / "inbox"
            self.assertFalse(inbox.exists())

    def test_missing_run_id_fails_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            env = os.environ.copy()
            env.update({"BRIEF": "brief", "RECEIVER_RUN_ID": ""})
            result = subprocess.run(
                [sys.executable, str(SCRIPT)],
                cwd=temp,
                env=env,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse((Path(temp) / "federation" / "inbox").exists())


if __name__ == "__main__":
    unittest.main()
