# Firstproject

A small dependency-free Python command-line todo app.

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
