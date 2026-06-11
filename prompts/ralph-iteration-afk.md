# Ralph Iteration: AFK

AUTONOMOUS MODE. You are running unattended. Never stop to ask for human input.

Read `AGENTS.md` first. If `CLAUDE.md` also exists, read it too. Follow the repository conventions over generic framework defaults.

You have been given context files in the command line, usually:
- `prd.md`, when available, for product intent, decisions, and testing strategy.
- `plan.json`, the task list.
- `progress.md`, the previous iteration log.

## Workflow

1. Read the plan and progress log.
2. Pick exactly one highest-priority incomplete task where `"passes": false`.
3. Use this priority order when several tasks are available:
   - Architectural decisions and core abstractions.
   - Integration points between modules.
   - Unknown unknowns and spike work.
   - Standard features and implementation.
   - Polish, cleanup, and quick wins.
4. Explore the relevant code before editing.
5. Implement the task using TDD. Every guard, service, helper, util, component, and container must have tests. Follow `~/.agents/skills/tdd/SKILL.md` for red-green-refactor workflow. Skip TDD only for purely structural wiring such as route config files, barrel exports, or scaffolding.
6. Run feedback loops after each meaningful change, and before committing.
7. Do not commit if any feedback loop fails. Fix the failure first.
8. Update `progress.md` with what was done, decisions made, files changed, and blockers.
9. Mark only the completed task as `"passes": true` in `plan.json`.
10. Commit the changes with a descriptive commit message.
11. If all tasks now have `"passes": true`, output exactly `<promise>COMPLETE</promise>`.

## Project Commands

Use Bun. Do not introduce npm, pnpm, or yarn lockfiles.

Feedback loops:
- Type/build check: `bun run build`
- Lint: `bun lint`
- Tests: `bun test`

Route tests expect the test database to exist and a separate app server to be running with `bun dev:test`. If route tests fail because the server or test database is unavailable, record the environment blocker in `progress.md` and still run all feedback loops that can run locally.

If the task changes Drizzle schema, do not generate migrations. Note in `progress.md` that the developer must run `bun db:generate`.

## Decision Making

- When you encounter an architectural decision, make the best decision you can based on codebase context and the PRD.
- Document every non-trivial decision as an ADR following the format and location documented in this repo's `CLAUDE.md` or `AGENTS.md`.
- If no ADR format or location is specified, create ADRs in `docs/adrs/` using this format:

```md
# ADR-NNN: <Title>
## Status: Proposed
## Context
<Why this decision was needed>
## Decision
<What was decided>
## Alternatives Considered
<What else was considered and why it was rejected>
## Consequences
<What this means going forward>
```

- After creating an ADR, add a TODO to the feature's `TODO.md` in the same `docs/features/<feature-name>/` directory:

```md
- [ ] Review ADR-NNN: <Title> (docs/adrs/NNN-<slug>.md)
```

- If a decision is blocked by missing information that cannot be inferred from the codebase or PRD, document the blocker in the feature's `progress.md`, skip that task, and move on to the next one.

## TDD

- Follow `~/.agents/skills/tdd/SKILL.md` for any task with testable behavior.
- Decide which behaviors to test. Prioritize critical paths and complex logic.
- Do not skip TDD just because no human is watching.
- If acceptance criteria mention testable behavior, those must have tests.

## Risk Management

- Prefer reversible decisions over irreversible ones.
- When uncertain between approaches, pick the simpler one.
- Never delete or rename public APIs without documenting the migration path.

## Introspect

After completing and committing the task, run the introspect skill at `~/.agents/skills/introspect/SKILL.md`. Apply improvements autonomously:
1. Friction log: review what went wrong, including retried commands, reworked code, and pattern mismatches.
2. Skill audit: check if global skills need non-codebase-specific updates.
3. Guidance updates: update `CLAUDE.md` or `AGENTS.md` with cross-cutting learnings; put feature-specific learnings under `docs/`.
4. Prompt sync: keep all three `prompts/ralph-iteration*.md` variants consistent.
5. Commit introspect changes separately with message `chore: introspect - <brief summary>`.

## Quality

- Keep changes small and focused: one logical change per commit.
- If a task feels too large, split it into subtasks and complete one per iteration.
- Run feedback loops after each change, not only at the end.
- Follow the patterns already established in this codebase.
- Leave the codebase better than you found it.
- When modifying existing test files, reuse the existing test setup. Do not duplicate factories or providers.
- Read `AGENTS.md` carefully for project conventions before writing code.
- API route handlers stay thin: parse input, validate, call service functions, and translate known errors.
- User-facing validation and error messages are Dutch unless surrounding feature copy is explicitly English.
- Code, identifiers, and comments are English.

ONLY WORK ON A SINGLE TASK PER ITERATION.
