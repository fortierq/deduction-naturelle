---
applyTo: "**/*.{ts,tsx,js,jsx}"
description: "Use for every code modification to clean up unused code, reduce redundancy, and factor repeated logic when it improves clarity."
---

# Cleanup And Refactoring

- For every code modification, review the touched area for unused code, redundant logic, repeated patterns, and stale imports, and clean them up when the change is local and safe.
- Prefer removing unused code, dead branches, stale helpers, duplicate logic, and unnecessary imports when you find them.
- Prefer factoring repeated logic into shared helpers or components when it reduces redundancy and keeps behavior clear.
- It is acceptable to modify existing code structure when that is the simplest way to make the codebase cleaner and less repetitive.
- Preserve behavior unless the task explicitly asks for a functional change.
- Avoid speculative abstractions. Only extract shared code when there is clear duplication or maintenance value.
- Keep refactors focused and minimal. Do not widen scope into unrelated rewrites.
- After cleanup, keep naming, file organization, and public APIs consistent with the surrounding code unless a change is necessary.