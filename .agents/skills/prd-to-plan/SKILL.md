---
name: prd-to-plan
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved alongside the PRD in the feature directory. Use when user wants to break down a PRD, create an implementation plan, plan phases from a PRD, or mentions "tracer bullets".
---

# PRD to Plan

Break a PRD into a phased implementation plan using vertical slices (tracer bullets). Output is a Markdown file colocated with the PRD in the feature directory.

## Process

### 1. Confirm the PRD is in context

The PRD should already be in the conversation. If it isn't, ask the user to paste it or point you to the file. Check `docs/features/*/prd.md` for existing PRDs. Also check the legacy location `docs/prds/` in case the PRD predates the feature directory convention.

### 2. Explore the codebase

If you have not already explored the codebase, do so to understand the current architecture, existing patterns, and integration layers.

### 3. Identify durable architectural decisions

Before slicing, identify high-level decisions that are unlikely to change throughout implementation:

- Route structures / URL patterns
- Database schema shape
- Key data models
- Authentication / authorization approach
- Third-party service boundaries

These go in the plan header so every phase can reference them.

### 4. Draft vertical slices

Break the PRD into **tracer bullet** phases. Each phase is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Do NOT include specific file names, function names, or implementation details that are likely to change as later phases are built
- DO include durable decisions: route paths, schema shapes, data model names
- If the PRD contains Figma URLs (design references with fileKey and node-id), propagate them to the relevant phases. Each UI-focused phase should include the specific Figma URLs for the screens/components it covers, so that agents implementing the phase can fetch design context directly via the Figma MCP server.
- If the PRD contains a Sources section (links to threads, tickets, docs, designs, etc.), propagate those source references into the plan. Include a Sources section in the plan header that lists all original source materials from the PRD, so the plan remains traceable to its origins.
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each phase show:

- **Title**: short descriptive name
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Should any phases be merged or split further?

Iterate until the user approves the breakdown.

### 6. Write the plan file

Determine the feature directory:
- If the PRD is at `docs/features/<feature-name>/prd.md`, write the plan to `docs/features/<feature-name>/plan.md`
- If the PRD is elsewhere (legacy `docs/prds/` or pasted), ask the user for the feature name and write to `docs/features/<feature-name>/plan.md`. Create the directory if needed.

Use the template below.

<plan-template>
# Plan: <Feature Name>

> Source PRD: <brief identifier or link>

## Sources

Carry over the full Sources section from the PRD. All links, threads, tickets, docs, design references, and Git repository URLs that informed the original PRD should be listed here for traceability. If the PRD is missing Git repo links, identify them (use `git remote -v`) and add them.

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...
- (add/remove sections as appropriate)

---

## Phase 1: <Title>

**User stories**: <list from PRD>

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

**User stories**: <list from PRD>

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
</plan-template>
