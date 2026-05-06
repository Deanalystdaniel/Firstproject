# Firstproject

A small dependency-free Python project with a command-line todo app and a
Tkinter Virtual Earth Clock.

## What it does

The app stores todos in a local JSON file and lets you:

- add todos
- list pending, completed, or all todos
- mark todos as done
- delete todos
- clear completed todos

## Usage

Run the CLI with Python 3:

```bash
python3 todo.py add "Write tests"
python3 todo.py list
python3 todo.py done 1
python3 todo.py list --all
python3 todo.py delete 1
```

By default, todos are saved to `~/.todo_cli.json`. To use a different file:

```bash
python3 todo.py --file ./todos.json add "Try the CLI"
```

## Commands

```text
add TEXT...       Add a new todo
list              List pending todos
list --all        List all todos
list --done       List completed todos
done ID           Mark a todo as complete
delete ID         Delete a todo
clear             Delete completed todos
clear --all       Delete every todo
```

## Tests

Run the test suite with:

```bash
python3 -m unittest discover -s tests
```

## Virtual Earth Clock

Run the Houston-focused Earth Clock GUI with:

```bash
python3 earth_clock.py
```

The clock shows UTC, Houston local time, and an approximate Houston local solar
time. It uses Python's standard-library `zoneinfo` support when available and
falls back to a built-in Central Time offset calculation if IANA timezone data is
missing.
