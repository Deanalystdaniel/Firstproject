# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview
This is a minimal starter repository ("Firstproject") containing:
- `README.md` — project readme
- `Testchild.py` — a single-line Python script (`print("Inside Child Branch")`)

There are no frameworks, build tools, package managers, test frameworks, or external service dependencies on the `main` branch.

### Running the application
```
python3 Testchild.py
```
No dependencies need to be installed. Python 3 is the only runtime requirement and is pre-installed in the Cloud Agent VM.

### Lint / Test / Build
No linter, test framework, or build system is configured. Running `python3 Testchild.py` and checking the exit code is the only verification available.

### Other branches
A Next.js/TypeScript productivity organizer app exists on the `cursor/productivity-organizer-e071` remote branch but is **not** merged into `main`.
