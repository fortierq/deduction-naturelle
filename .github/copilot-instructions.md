# Copilot Instructions

## Command Execution Policy

- Do **not** run project-wide build commands by default.
- Specifically, do **not** run `npm run build`, `npm run dev`, or other full build/start commands unless the user explicitly asks.
- After code edits, report what changed without auto-running build/test/lint commands.
- If verification may be useful, ask the user first before running any build/test command.

## Scope

- Keep changes minimal and targeted to the requested task.
- Avoid unrelated refactors or formatting-only edits.
