"""Tests for the todo CLI."""

from __future__ import annotations

import io
import json
import tempfile
import unittest
from pathlib import Path

import todo


class TodoCliTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.data_file = Path(self.temp_dir.name) / "todos.json"

    def run_cli(self, *args: str) -> tuple[int, str, str]:
        parser = todo.build_parser()
        namespace = parser.parse_args(["--file", str(self.data_file), *args])
        output = io.StringIO()
        error = io.StringIO()

        exit_code = todo.run(namespace, output=output, error=error)

        return exit_code, output.getvalue(), error.getvalue()

    def test_add_and_list_pending_todos(self) -> None:
        exit_code, output, error = self.run_cli("add", "write", "tests")

        self.assertEqual(exit_code, 0)
        self.assertEqual(output, "Added todo #1: write tests\n")
        self.assertEqual(error, "")
        self.assertEqual(
            json.loads(self.data_file.read_text(encoding="utf-8")),
            [{"id": 1, "text": "write tests", "done": False}],
        )

        exit_code, output, error = self.run_cli("list")

        self.assertEqual(exit_code, 0)
        self.assertEqual(output, "[ ] 1. write tests\n")
        self.assertEqual(error, "")

    def test_done_hides_item_from_default_list(self) -> None:
        self.run_cli("add", "ship", "cli")

        exit_code, output, error = self.run_cli("done", "1")

        self.assertEqual(exit_code, 0)
        self.assertEqual(output, "Marked todo #1 as done.\n")
        self.assertEqual(error, "")

        self.assertEqual(self.run_cli("list")[1], "No matching todos.\n")
        self.assertEqual(self.run_cli("list", "--all")[1], "[x] 1. ship cli\n")

    def test_delete_removes_a_todo(self) -> None:
        self.run_cli("add", "temporary", "task")

        exit_code, output, error = self.run_cli("delete", "1")

        self.assertEqual(exit_code, 0)
        self.assertEqual(output, "Deleted todo #1: temporary task\n")
        self.assertEqual(error, "")
        self.assertEqual(json.loads(self.data_file.read_text(encoding="utf-8")), [])

    def test_missing_todo_returns_error(self) -> None:
        exit_code, output, error = self.run_cli("done", "99")

        self.assertEqual(exit_code, 1)
        self.assertEqual(output, "")
        self.assertEqual(error, "Todo #99 was not found.\n")

    def test_clear_completed_only_removes_done_items(self) -> None:
        self.run_cli("add", "keep", "me")
        self.run_cli("add", "remove", "me")
        self.run_cli("done", "2")

        exit_code, output, error = self.run_cli("clear")

        self.assertEqual(exit_code, 0)
        self.assertEqual(output, "Deleted 1 todo.\n")
        self.assertEqual(error, "")
        self.assertEqual(self.run_cli("list", "--all")[1], "[ ] 1. keep me\n")


if __name__ == "__main__":
    unittest.main()
