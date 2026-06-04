# Copilot Instructions

## Project Overview

- This repository is a small React + TypeScript + Vite application for natural deduction exercises in propositional logic.
- For product context, start with [README.md](../README.md).
- Most behavior lives in a compact set of source files under [src](../src), so agents should prefer targeted local edits over broad rewrites.

## Where Behavior Lives

- Proof logic and rule application live in [src/proof.ts](../src/proof.ts), [src/rules.ts](../src/rules.ts), [src/formulas.ts](../src/formulas.ts), and [src/sequent.ts](../src/sequent.ts).
- Exercise data and rule constraints live in [src/exercises.ts](../src/exercises.ts).
- App-level state, modal flows for rule inputs, drawer state, notation handling, and user messages live in [src/App.tsx](../src/App.tsx).
- UI rendering is split across [src/components/ProofTree.tsx](../src/components/ProofTree.tsx), [src/components/RulePanel.tsx](../src/components/RulePanel.tsx), and [src/components/ExerciseList.tsx](../src/components/ExerciseList.tsx).
- Internationalized UI copy lives in [src/i18n.tsx](../src/i18n.tsx); rule display assets and latex labels live in [src/ruleLabels.ts](../src/ruleLabels.ts).
- Production path behavior is configured in [vite.config.ts](../vite.config.ts); builds use `/deduction-naturelle/` as the base path.

## Project-Specific Conventions

- Keep domain logic in the pure logic modules; avoid pushing React or DOM concerns into proof/rule/formula code.
- Compare formulas with `.equals()`, not strict equality.
- Rules listed in `RULES_REQUIRING_FORMULA_INPUT` trigger modal-driven input flows, so rule changes often require corresponding updates in both [src/rules.ts](../src/rules.ts) and [src/App.tsx](../src/App.tsx).
- User-facing copy is bilingual. When adding or changing UI text, update both French and English entries in [src/i18n.tsx](../src/i18n.tsx).
- If rule names, rule labels, or rule imagery change, verify the matching updates in [src/ruleLabels.ts](../src/ruleLabels.ts) and [public/assets/rules](../public/assets/rules).
- [src/App.tsx](../src/App.tsx) uses imperative refs for proof-tree state, timeout cleanup, and modal focus. Preserve cleanup behavior and watch for stale-closure regressions.

## Command Execution Policy

- Do **not** run project-wide build commands by default.
- Specifically, do **not** run `npm run build`, `npm run dev`, or other full build/start commands unless the user explicitly asks.
- The default verification command is `npm run lint`.
- There is no automated test suite in this repository, so do not claim test coverage that does not exist.
- If verification beyond linting may be useful, ask the user before running build- or browser-oriented checks.
- Because `npm run build` runs `tsc && vite build`, treat it as a heavier validation step than linting.

## Refactor and Cleanup

- For every code modification, review the touched area for unused code, redundant logic, repeated patterns, and stale imports, and clean them up when the change is local and safe.
- Prefer removing unused code, dead branches, stale helpers, duplicate logic, and unnecessary imports when you find them.
- Prefer factoring repeated logic into shared helpers or components when it reduces redundancy and keeps behavior clear.
- It is acceptable to modify existing code structure when that is the simplest way to make the codebase cleaner and less repetitive.
- Preserve behavior unless the task explicitly asks for a functional change.
- Keep refactors focused and minimal. Do not widen scope into unrelated rewrites.
