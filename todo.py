"""A small dependency-free todo list command-line app."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import TextIO


DEFAULT_DATA_FILE = Path(os.environ.get("TODO_CLI_FILE", "~/.todo_cli.json")).expanduser()


def load_todos(data_file: Path) -> list[dict[str, object]]:
    """Load todos from disk, returning an empty list when no file exists."""
    if not data_file.exists():
        return []

    try:
        data = json.loads(data_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Could not read todo file: {data_file}") from exc

    if not isinstance(data, list):
        raise ValueError(f"Todo file has an invalid format: {data_file}")

    return data


def save_todos(data_file: Path, todos: list[dict[str, object]]) -> None:
    """Write todos to disk as pretty-printed JSON."""
    data_file.parent.mkdir(parents=True, exist_ok=True)
    data_file.write_text(json.dumps(todos, indent=2) + "\n", encoding="utf-8")


def next_todo_id(todos: list[dict[str, object]]) -> int:
    ids = [todo["id"] for todo in todos if isinstance(todo.get("id"), int)]
    return max(ids, default=0) + 1


def find_todo(todos: list[dict[str, object]], todo_id: int) -> dict[str, object] | None:
    for todo in todos:
        if todo.get("id") == todo_id:
            return todo
    return None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage a simple local todo list.")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_DATA_FILE,
        help=f"path to the todo JSON file (default: {DEFAULT_DATA_FILE})",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="add a new todo")
    add_parser.add_argument("text", nargs="+", help="todo text")

    list_parser = subparsers.add_parser("list", help="list todos")
    list_parser.add_argument("--all", action="store_true", help="show completed todos too")
    list_parser.add_argument("--done", action="store_true", help="show only completed todos")

    done_parser = subparsers.add_parser("done", help="mark a todo as complete")
    done_parser.add_argument("id", type=int, help="todo id")

    delete_parser = subparsers.add_parser("delete", help="delete a todo")
    delete_parser.add_argument("id", type=int, help="todo id")

    clear_parser = subparsers.add_parser("clear", help="delete completed todos")
    clear_parser.add_argument("--all", action="store_true", help="delete every todo")

    return parser


def run(args: argparse.Namespace, output: TextIO, error: TextIO) -> int:
    try:
        todos = load_todos(args.file)
    except ValueError as exc:
        print(exc, file=error)
        return 1

    if args.command == "add":
        text = " ".join(args.text).strip()
        if not text:
            print("Todo text cannot be empty.", file=error)
            return 1

        todo = {"id": next_todo_id(todos), "text": text, "done": False}
        todos.append(todo)
        save_todos(args.file, todos)
        print(f"Added todo #{todo['id']}: {todo['text']}", file=output)
        return 0

    if args.command == "list":
        if args.all and args.done:
            print("Use either --all or --done, not both.", file=error)
            return 1

        visible_todos = todos
        if args.done:
            visible_todos = [todo for todo in todos if todo.get("done") is True]
        elif not args.all:
            visible_todos = [todo for todo in todos if todo.get("done") is not True]

        if not visible_todos:
            message = "No todos yet." if not todos else "No matching todos."
            print(message, file=output)
            return 0

        for todo in visible_todos:
            marker = "x" if todo.get("done") is True else " "
            print(f"[{marker}] {todo['id']}. {todo['text']}", file=output)
        return 0

    if args.command == "done":
        todo = find_todo(todos, args.id)
        if todo is None:
            print(f"Todo #{args.id} was not found.", file=error)
            return 1

        todo["done"] = True
        save_todos(args.file, todos)
        print(f"Marked todo #{args.id} as done.", file=output)
        return 0

    if args.command == "delete":
        todo = find_todo(todos, args.id)
        if todo is None:
            print(f"Todo #{args.id} was not found.", file=error)
            return 1

        todos.remove(todo)
        save_todos(args.file, todos)
        print(f"Deleted todo #{args.id}: {todo['text']}", file=output)
        return 0

    if args.command == "clear":
        original_count = len(todos)
        if args.all:
            todos = []
            deleted_count = original_count
        else:
            todos = [todo for todo in todos if todo.get("done") is not True]
            deleted_count = original_count - len(todos)

        save_todos(args.file, todos)
        label = "todo" if deleted_count == 1 else "todos"
        print(f"Deleted {deleted_count} {label}.", file=output)
        return 0

    print(f"Unsupported command: {args.command}", file=error)
    return 1


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return run(args, output=sys.stdout, error=sys.stderr)


if __name__ == "__main__":
    raise SystemExit(main())
