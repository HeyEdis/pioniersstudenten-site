---
name: ralph-init
description: Bootstrap the Ralph loop (autonomous AI coding loop) into the current repo
allowed_tools: Read, Write, Edit, Bash, Glob
---

# Ralph Init

Scaffold the Ralph autonomous coding loop into the current repository. This creates the scripts, prompt templates, and starter files needed to run Claude in an iterative loop that autonomously works through a task list.

Reference: https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum

## Pipeline

This skill is designed to work as the final step in this pipeline:

1. **write-a-prd** → generates a PRD markdown in `docs/features/<feature-name>/prd.md`
2. **prd-to-plan-json** → reads the PRD, generates `docs/features/<feature-name>/plan.json`
3. **ralph-init** (this skill) → scaffolds the loop scripts to execute the plan

All feature artifacts are colocated in `docs/features/<feature-name>/`:
- `prd.md` — Product Requirements Document
- `plan.md` — Milestone/vertical-slice plan
- `plan.json` — Ralph task list
- `progress.md` — Iteration log
- `TODO.md` — Open items and ADR review tasks

Steps 1 and 2 are optional. You can also use ralph-init standalone — it will create a starter `plan.json` if none exists.

## Steps

1. Check what already exists — don't overwrite any existing Ralph files without asking
2. Detect the project's language/framework (check package.json, Cargo.toml, pyproject.toml, go.mod, etc.) to customize the feedback commands in the script
3. Determine the **feature name**:
   - Check `docs/features/*/plan.json` for existing feature directories with plans
   - If exactly one feature directory has a `plan.json`, use that feature name
   - Otherwise, ask the user which feature to scaffold for
4. Check for existing artifacts in the feature directory (`docs/features/<feature-name>/`):
   - If `plan.json` already exists (from prd-to-plan-json), **do not recreate it** — use it as-is
   - If `prd.md` exists, note its path — it will be passed as context to the iteration prompt
   - Also check legacy locations (`./plan.json`, `docs/prds/`) and suggest migrating if found
5. Create the following files (skip any that already exist and are valid):

### `scripts/ralph.sh`

An executable bash script that:

- Takes an iteration count as the first argument (default: 5)
- **Accepts `--feature=<name>` to resolve all paths from `docs/features/<name>/`**:
  - `--feature=custom-dashboards` → plan=`docs/features/custom-dashboards/plan.json`, prd=`docs/features/custom-dashboards/prd.md`, progress=`docs/features/custom-dashboards/progress.md`
- Optionally takes `--plan=<path>` and `--prd=<path>` as manual overrides (take precedence over `--feature`)
- Loops N times, each time calling `claude -p` with the iteration prompt, passing the plan file, progress.md, and optionally the PRD as context
- After each iteration, checks stdout for `<promise>COMPLETE</promise>` — if found, exits early with a success message
- Includes a `--hitl` flag that runs one interactive session (not `-p`) using `prompts/ralph-iteration-hitl.md`. The HITL prompt includes a review phase: after completing the task, Claude asks the user for feedback within the same session. If feedback is given, Claude updates guidance files (CLAUDE.md, rules, skills, prompts) to prevent the same mistakes in future iterations — all without leaving the session
- Supports `--afk` flag for fully autonomous mode — implies `--yolo`, uses the AFK-specific prompt (`prompts/ralph-iteration-afk.md`) that instructs Ralph to make all decisions independently and document ADRs
- Supports `--sandbox` flag to run inside `docker sandbox run claude` for AFK safety
- Supports `--yolo` flag to run with `--dangerously-skip-permissions --permission-mode=bypassPermissions` for fully autonomous operation (no permission prompts)

Example structure:

```bash
#!/usr/bin/env bash
set -e

ITERATIONS=5
FEATURE=""
PLAN=""
PRD=""
PROGRESS=""
HITL=false
AFK=false
SANDBOX=false
YOLO=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --hitl) HITL=true; ITERATIONS=1 ;;
    --afk) AFK=true; YOLO=true ;;
    --sandbox) SANDBOX=true ;;
    --yolo) YOLO=true ;;
    --feature=*) FEATURE="${1#*=}" ;;
    --plan=*) PLAN="${1#*=}" ;;
    --prd=*) PRD="${1#*=}" ;;
    [0-9]*) ITERATIONS="$1" ;;
  esac
  shift
done

# Resolve paths from feature directory (explicit flags override)
if [ -n "$FEATURE" ]; then
  FEATURE_DIR="docs/features/${FEATURE}"
  if [ ! -d "$FEATURE_DIR" ]; then
    echo "Error: feature directory not found: $FEATURE_DIR" >&2
    exit 1
  fi
  [ -z "$PLAN" ] && PLAN="${FEATURE_DIR}/plan.json"
  [ -z "$PRD" ] && [ -f "${FEATURE_DIR}/prd.md" ] && PRD="${FEATURE_DIR}/prd.md"
  [ -z "$PROGRESS" ] && PROGRESS="${FEATURE_DIR}/progress.md"
else
  # Legacy fallback: root-level files
  [ -z "$PLAN" ] && PLAN="plan.json"
  [ -z "$PROGRESS" ] && PROGRESS="progress.md"
fi

CLAUDE_FLAGS=""
if [ "$YOLO" = true ]; then
  CLAUDE_FLAGS="--dangerously-skip-permissions --permission-mode=bypassPermissions"
fi

PROMPT_FILE="prompts/ralph-iteration.md"
if [ "$HITL" = true ]; then
  PROMPT_FILE="prompts/ralph-iteration-hitl.md"
elif [ "$AFK" = true ]; then
  PROMPT_FILE="prompts/ralph-iteration-afk.md"
fi

for ((i=1; i<=ITERATIONS; i++)); do
  echo "=== Ralph iteration $i/$ITERATIONS ==="

  PROMPT=$(cat "$PROMPT_FILE")
  CONTEXT="@${PLAN} @${PROGRESS}"
  if [ -n "$PRD" ] && [ -f "$PRD" ]; then
    CONTEXT="@${PRD} ${CONTEXT}"
  fi

  if [ "$HITL" = true ]; then
    # Interactive mode — user stays in the same session for review
    claude $CLAUDE_FLAGS --append-system-prompt "$PROMPT" "$CONTEXT"
  elif [ "$SANDBOX" = true ]; then
    result=$(docker sandbox run claude $CLAUDE_FLAGS -p "$CONTEXT $PROMPT" | tee /dev/stderr)
  else
    result=$(claude $CLAUDE_FLAGS -p "$CONTEXT $PROMPT" | tee /dev/stderr)
  fi

  if [ "$HITL" != true ] && [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "All tasks complete, exiting."
    exit 0
  fi
done
```

### `prompts/ralph-iteration.md`

The prompt for a single Ralph iteration. It should instruct Claude to:

1. Read CLAUDE.md and/or AGENTS.md if present — follow all project conventions
2. Read the plan file and progress.md to understand what's done and what remains. If a PRD was passed as context, use it for deeper understanding of the problem, architectural decisions, and testing strategy
3. Pick the highest-priority incomplete task, using this priority order:
   - Architectural decisions and core abstractions
   - Integration points between modules
   - Unknown unknowns and spike work
   - Standard features and implementation
   - Polish, cleanup, and quick wins
4. Explore the codebase to understand relevant code before making changes
5. Implement the task using TDD. **Every guard, service, helper, util, component, and container MUST have tests** — if you create a file, create its `.spec.ts` too. Follow the TDD skill (`~/.claude/skills/tdd/SKILL.md`) for red-green-refactor workflow. Skip TDD only for purely structural wiring (route config files, barrel exports, scaffolding).
6. Run ALL feedback loops before committing (use the project's actual commands):
   - Type checking
   - Tests
   - Linting
7. Do NOT commit if any feedback loop fails — fix issues first
8. Update progress.md with: what was done, decisions made, files changed, any blockers
9. Mark the task as complete in the plan file (set `"passes": true`)
10. Commit the changes with a descriptive commit message
11. If ALL tasks now have `"passes": true`, output `<promise>COMPLETE</promise>`

The prompt should be concrete and specific, not vague. Include the actual feedback commands detected from the project. IMPORTANT: The prompt must reference CLAUDE.md/AGENTS.md so Ralph respects project-specific conventions.

Include this quality guidance in the prompt:

```
QUALITY:
- Keep changes small and focused — one logical change per commit
- If a task feels too large, break it into subtasks and do one per iteration
- Run feedback loops after each change, not at the end
- Do not take shortcuts — follow the patterns already established in this codebase
- Leave the codebase better than you found it
- When modifying existing test files, reuse the existing test setup — never duplicate factories or providers
- Read CLAUDE.md carefully for inject function preferences and coding conventions before writing code

TDD: Every guard, service, helper, util, component, and container MUST have tests.
     Follow ~/.claude/skills/tdd/SKILL.md for red-green-refactor workflow.
     Skip TDD only for purely structural wiring (route configs, barrel exports, scaffolding).

ONLY WORK ON A SINGLE TASK PER ITERATION.
```

### `prompts/ralph-iteration-hitl.md`

The HITL prompt (used when `--hitl` flag is set). This is identical to `ralph-iteration.md` (including all TDD, quality, and feedback loop sections) with one addition at the end — a **HITL Review Phase** section:

```
## HITL Review Phase

After completing and committing the task above, **do not exit**. Simply tell the user: "Task complete. Ready for your review." Then wait.

### Step 1: Code review loop

When the user provides feedback about the code:
1. Fix the code based on their feedback.
2. Run feedback loops again (tsc, lint, test).
3. Commit the fix.
4. Tell the user: "Fixed and committed. Anything else?"
5. Repeat until the user approves the code.

### Step 2: Introspect

Once the code is approved, run the introspect skill (`~/.agents/skills/introspect/SKILL.md`).
This reviews the session for friction — especially any review remarks — and applies targeted
improvements to skills, guidance files, and docs.

Key rules:
- Global skills (~/.claude/skills/, ~/.agents/skills/) — only non-codebase-specific improvements
- CLAUDE.md / AGENTS.md — only cross-cutting, non-feature-specific guidance
- Feature docs (docs/) — feature-specific learnings go here
- Prompt sync — keep all three prompts/ralph-iteration*.md variants consistent

If the user had no remarks and the session was smooth, skip this step.
```

IMPORTANT: The review phase must NOT run git commands or generate a summary. The user reviews the code themselves. Claude just waits for feedback.

### `prompts/ralph-iteration-afk.md`

The AFK prompt (used when `--afk` flag is set). This is a variant of the standard iteration prompt with one key difference: Ralph must make all decisions autonomously and never block on human input. It includes everything from `ralph-iteration.md` (including the TDD workflow and quality guidance) plus these additional instructions:

```
AUTONOMOUS MODE — You are running unattended. Never stop to ask for human input.

DECISION MAKING:
- When you encounter an architectural decision (technology choice, API design,
  data model shape, module boundaries, error handling strategy, etc.), make
  the best decision you can based on the codebase context and the PRD.
- Document every non-trivial decision as an ADR (Architecture Decision Record)
  following the format and location documented in this repo's CLAUDE.md.
  If CLAUDE.md does not specify an ADR format or location, create ADRs in
  docs/adrs/ using this format:

    # ADR-NNN: <Title>
    ## Status: Proposed
    ## Context: <Why this decision was needed>
    ## Decision: <What was decided>
    ## Alternatives considered: <What else was considered and why it was rejected>
    ## Consequences: <What this means going forward>

- After creating an ADR, add a TODO to the feature's `TODO.md` (in the same
  `docs/features/<feature-name>/` directory) for the user to review:

    - [ ] Review ADR-NNN: <Title> (docs/adr/NNN-<slug>.md)

- If a decision is blocked by missing information that cannot be inferred from
  the codebase or PRD, document the blocker in the feature's progress.md, skip that task,
  and move on to the next one.

TDD: Follow ~/.claude/skills/tdd/SKILL.md for any task with testable behavior.
- You decide which behaviors to test — prioritize critical paths and complex logic.
- Do not skip TDD just because no human is watching. Tests are your safety net.
- If acceptance criteria mention testable behavior, those MUST have tests.

RISK MANAGEMENT:
- Prefer reversible decisions over irreversible ones.
- When uncertain between approaches, pick the simpler one.
- Never delete or rename public APIs without documenting the migration path.

INTROSPECT:
After completing and committing the task, run the introspect skill
(~/.agents/skills/introspect/SKILL.md). Apply all improvements autonomously:
1. Friction log — review what went wrong (retried commands, reworked code, pattern mismatches).
2. Skill audit — check if global skills need updates (non-codebase-specific only).
3. Guidance updates — update CLAUDE.md/AGENTS.md with cross-cutting learnings; feature-specific → docs/.
4. Prompt sync — keep all three prompts/ralph-iteration*.md variants consistent.
Commit introspect changes separately (message: "chore: introspect — <brief summary>").
```

ADR review TODOs go in the feature's `TODO.md` (`docs/features/<feature-name>/TODO.md`) — no separate review file.

### `docs/features/<feature-name>/plan.json`

**Skip this file if it already exists** (e.g. generated by `prd-to-plan-json` skill).

If creating from scratch, write to `docs/features/<feature-name>/plan.json`. Use this structure (compatible with `prd-to-plan-json` skill output):

```json
{
  "tasks": [
    {
      "id": "short-kebab-case-id",
      "title": "Short descriptive title",
      "description": "What needs to be done and why. Detailed enough for an autonomous agent to implement without further clarification.",
      "acceptance_criteria": [
        "Specific, testable criterion 1",
        "Specific, testable criterion 2"
      ],
      "priority": 1,
      "passes": false
    }
  ]
}
```

Rules:

- `id`: unique kebab-case identifier
- `priority`: integer, 1 is highest (do first). Architectural/foundational work comes first
- `passes`: always `false` — Ralph marks these `true` as it completes them
- `description`: detailed enough for an autonomous agent to act on without ambiguity
- `acceptance_criteria`: concrete and verifiable — "tests pass", "endpoint returns 200", not "works correctly"
- Tasks should be small — sized so one iteration can complete one task

Include 1-2 example tasks that make sense for the detected project type.

### `docs/features/<feature-name>/progress.md`

An empty file with a header, created in the feature directory:

```
# Ralph Progress Log

Each iteration appends what was done, decisions made, and files changed.
Keep entries concise. This file helps future iterations skip exploration.
```

### Alternative loop prompts (optional)

If the user asks for a specific loop type, create a matching prompt in `prompts/`:

**Test coverage loop** (`prompts/ralph-coverage.md`):

```
@coverage-report.txt
Find uncovered lines in the coverage report.
Write tests for the most critical uncovered code paths.
Run coverage again and update coverage-report.txt.
Target: 80% coverage minimum.
```

**Linting loop** (`prompts/ralph-lint.md`):

```
Run: <lint command>
Fix ONE linting error at a time.
Run lint again to verify the fix.
Repeat until no errors remain.
```

**Entropy loop** (`prompts/ralph-entropy.md`):

```
Scan for code smells: unused exports, dead code, inconsistent patterns.
Fix ONE issue per iteration.
Document what you changed in progress.md.
Run all feedback loops before committing.
```

6. Make `scripts/ralph.sh` executable
7. Print a ready-to-run summary tailored to what was detected. Build the **exact command** the user should run based on:
   - The feature name
   - The number of tasks in `plan.json` (suggest iterations = number of tasks + a few buffer)
   - Whether a PRD was found in the feature directory

   The summary should look like this:

   ```
   Ralph loop is ready! Here's your plan:

   📁 Feature: docs/features/my-feature/
   📋 Plan: plan.json (N tasks)
   📄 PRD: prd.md

   Recommended first run (HITL — watch and refine):

     ./scripts/ralph.sh --hitl --yolo --feature=my-feature

   Once you're confident, go AFK:

     ./scripts/ralph.sh <N+2> --afk --feature=my-feature

   --afk mode will:
   • Skip all permission prompts (implies --yolo)
   • Make architectural decisions autonomously
   • Document each decision as an ADR in docs/adr/
   • Add review TODOs to docs/features/my-feature/TODO.md for uncertain decisions

   Bootstrap a new session with full feature context:

     /feature my-feature

   Want me to kick off the first HITL iteration now?
   ```

   Adapt the commands to the actual feature name and task count. Always suggest starting with `--hitl` first. Always ask whether to start the first run — don't start it automatically.

   Additional tips to include:
   - `--sandbox` flag for untrusted or overnight runs
   - When returning from AFK, check the feature's `TODO.md` for ADRs that need review
   - Delete `progress.md` when the sprint is done — it's session-specific
   - Use `/feature <name>` to bootstrap a new Claude session with full feature context
