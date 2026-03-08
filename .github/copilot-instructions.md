# Copilot Instructions

## Command Execution Policy

- Do **not** run project-wide build commands by default.
- Specifically, do **not** run `npm run build`, `npm run dev`, or other full build/start commands unless the user explicitly asks.
- After code edits, report what changed and run lint commands.
- If verification may be useful, ask the user first before running any build/test command.

## Refactor and Cleanup

- For every code modification, review the touched area for unused code, redundant logic, repeated patterns, and stale imports, and clean them up when the change is local and safe.
- Prefer removing unused code, dead branches, stale helpers, duplicate logic, and unnecessary imports when you find them.
- Prefer factoring repeated logic into shared helpers or components when it reduces redundancy and keeps behavior clear.
- It is acceptable to modify existing code structure when that is the simplest way to make the codebase cleaner and less repetitive.
- Preserve behavior unless the task explicitly asks for a functional change.
- Keep refactors focused and minimal. Do not widen scope into unrelated rewrites.
