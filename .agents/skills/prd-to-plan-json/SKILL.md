---
name: prd-to-plan-json
description: Turn a PRD into a plan.json file for the Ralph autonomous coding loop. Breaks the PRD into prioritized tasks with acceptance criteria in JSON format. Output goes in the feature directory alongside the PRD.
allowed_tools: Read, Write, Edit, Glob, Grep, Bash
---

# PRD to plan.json

Convert a PRD into a `plan.json` file suitable for the Ralph autonomous coding loop. Output is colocated with the PRD in the feature directory.

## Process

### 1. Confirm the PRD is in context

The PRD should already be in the conversation. If it isn't, ask the user to paste it or point you to the file. Check `docs/features/*/prd.md` for existing PRDs. Also check the legacy location `docs/prds/` in case the PRD predates the feature directory convention.

### 2. Explore the codebase

If you have not already explored the codebase, do so to understand the current architecture, existing patterns, and integration layers. This informs how to break down the work.

### 3. Draft tasks

Break the PRD into concrete, implementable tasks. Each task should be a vertical slice — cutting through all layers end-to-end, not a horizontal slice of one layer.

<task-rules>
- Each task delivers a narrow but COMPLETE path through every relevant layer
- A completed task is verifiable on its own via its acceptance criteria
- Prefer many small tasks over few large ones
- Tasks should be ordered so foundational/architectural work comes first
- Later tasks can depend on earlier ones but should be as independent as possible
- Acceptance criteria must be specific and testable, not vague
- If the PRD contains Figma URLs (design references with fileKey and node-id), propagate them into the `description` field of each UI-focused task. Include the specific Figma URLs for the screens/components that task covers, so that agents implementing the task can fetch design context directly via the Figma MCP server. Non-UI tasks (backend, data access, logic) do not need Figma URLs.
- If the PRD contains a Sources section (links to threads, tickets, docs, designs, Git repos, etc.), include a top-level `sources` array in plan.json that carries over all original source references from the PRD, so the plan remains traceable to its origins. If the PRD is missing Git repo links, identify them (use `git remote -v`) and add them.
</task-rules>

### 4. Quiz the user

Present the proposed task breakdown as a numbered list. For each task show:

- **Title**: short descriptive name
- **What it covers**: brief description
- **Priority**: suggested order

Ask the user:
- Does the granularity feel right?
- Should any tasks be merged or split?
- Is the priority order correct?

Iterate until the user approves.

### 5. Write plan.json

Determine the feature directory:
- If the PRD is at `docs/features/<feature-name>/prd.md`, write the plan to `docs/features/<feature-name>/plan.json`
- If the PRD is elsewhere (legacy `docs/prds/` or pasted), ask the user for the feature name and write to `docs/features/<feature-name>/plan.json`. Create the directory if needed.

Use this structure:

```json
{
  "sources": [
    {
      "url": "https://example.com/thread/123",
      "description": "Original feature request thread"
    }
  ],
  "tasks": [
    {
      "id": "short-kebab-case-id",
      "title": "Short descriptive title",
      "description": "What needs to be done and why. Be specific enough that an AI agent can implement this without further clarification.",
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

Rules for the JSON:
- `id`: unique kebab-case identifier
- `priority`: integer, 1 is highest priority (do first)
- `passes`: always `false` — Ralph marks these `true` as it completes them
- `description`: detailed enough for an autonomous agent to act on without ambiguity
- `acceptance_criteria`: concrete and verifiable — "tests pass", "endpoint returns 200", not "works correctly"
- For tasks that wire data-fetching UI controls (dropdowns, selects, lists, tables), acceptance criteria MUST include end-to-end data verification — e.g., "open the dropdown and verify it shows options fetched from the API", "the table renders rows with data from the backend". It is not sufficient to assert that the control renders or is visible — the data flow must be proven to work.
- Tasks should be ordered by priority (architectural/foundational first)
- **NEVER edit existing tasks** — when a `plan.json` already exists, only append new tasks. Never modify tasks that already exist — not their `passes` field, not their description, not their acceptance criteria. This includes tasks marked `"passes": true` that turn out to be incomplete or broken: do NOT flip them back to `false`. Instead, create a new task that addresses the gap. Set the `priority` of new tasks to continue from the highest existing priority number.

### 6. Sync e2e.json

After writing or updating `plan.json`, check if an `e2e.json` exists in the same feature directory. If it does, determine whether the new plan tasks introduce behavior that needs e2e test coverage.

**When to add e2e tasks:**
- A new plan task adds a user-facing flow (new route, new modal, new CRUD operation)
- A new plan task adds data-fetching UI controls (dropdowns, filters, lists) that need data verification
- A new plan task adds interactive features to an existing view (global filters, sharing, scheduling)
- A new plan task fixes a bug that existing e2e tests should have caught but didn't

**When NOT to add e2e tasks:**
- The plan task is purely backend/infrastructure (no UI change)
- The plan task is a refactor with no behavior change
- The plan task adds unit-tested utility code with no UI surface
- Existing e2e.json tasks already cover the new behavior

**Rules:**
- **NEVER edit existing e2e tasks** — only append new tasks to the `tasks` array. This prevents destabilizing passing tests and losing approved task descriptions.
- Follow the conventions from the `prd-to-e2e-json` skill for task structure: journey-first, step-by-step user actions, data-test-label values from source code (grep `.dtl.ts` files), data-flow verification in acceptance criteria.
- Set `"passes": false` on new e2e tasks so the e2e runner picks them up.
- If an existing e2e task partially covers a flow but misses new behavior, add a **new** task for the gap rather than editing the existing one.

Present any proposed e2e.json additions to the user alongside the plan.json tasks in step 4 (quiz), so they can approve both together.
