---
name: write-a-prd
description: Create a PRD (Product Requirements Document) through user interview, codebase exploration, and module design, then store in the feature directory at `docs/features/<feature-name>/prd.md`. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

1. Review any context already provided in the conversation (attached files, linked documents, prior messages, etc.) and extract the problem description, solution ideas, and any referenced URLs, documents, Slack/Teams threads, tickets, Figma files, or other sources. Then ask the user for anything still missing — a detailed description of the problem they want to solve, potential ideas for solutions, and any additional references that informed the request. Do not re-ask for information already available in context. Collect sources throughout the interview process — any URL, document, thread, or ticket mentioned by the user (or found during codebase exploration) should be captured for the Sources section.

2. Explore the repo to verify their assertions and understand the current state of the codebase. Identify the Git repositories that will be involved in the implementation (use `git remote -v` in each relevant repo to get the URLs). These will be listed in the Sources section.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Determine the **feature name** (kebab-case, e.g. `custom-dashboards`, `user-onboarding`). Derive it from the PRD topic. Ask the user to confirm or override.

6. Once you have a complete understanding of the problem and solution, use the template below to write the PRD. The PRD should be stored at `docs/features/<feature-name>/prd.md`. Create the `docs/features/<feature-name>/` directory if it doesn't exist.

All feature artifacts (PRD, plans, progress, TODOs) are colocated in `docs/features/<feature-name>/`. Downstream skills (`prd-to-plan`, `prd-to-plan-json`, `ralph-init`) will detect the feature directory from the PRD location and place their output alongside it.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

If Figma designs were referenced during the PRD process, include the full Figma URLs (with fileKey and node-id) alongside each relevant implementation decision or user story. These URLs are stable references that downstream planning skills (prd-to-plan, prd-to-plan-json) will propagate to individual tasks so that agents implementing the UI can fetch design context directly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Sources

A numbered list of all source materials that informed this PRD. Every link, document, thread, ticket, design file, or external reference mentioned by the user or discovered during the process should be listed here so the PRD can be traced back to its origins. Include:

- Jira/Linear/GitHub issue links
- Confluence/Notion/Google Doc links
- Slack/Teams thread URLs
- Figma file URLs
- API documentation links
- Meeting notes or recordings
- Git repository URLs for all repos involved in the implementation
- Any other external reference

For each source, include a brief description of what it contributed (e.g. "Original feature request", "Technical constraints discussion", "UI mockups"). Always include the Git repo links — these help agents and developers quickly navigate to the relevant codebases.

## Further Notes

Any further notes about the feature.

</prd-template>
