---
name: battery-portal-session-memory
description: Maintain durable Battery Data Portal session memory when important requirements, constraints, design decisions, file paths, remaining work, verification status, context reset, a new session, handoff, saving, remembering, context, or meaningful code changes affect the project.
---

# Battery Portal Session Memory

Use this project-local skill for Battery Data Portal work. It preserves only the context a new Codex session needs to continue safely.

## Read First

Before meaningful work, read:

1. `AGENTS.md`
2. `docs/SESSION_MEMORY.md`
3. The current user request
4. Relevant current code and documentation

Treat repository files as more reliable than old compressed chat context. If current code, `VERSION`, or release files conflict with an older handoff note, update the memory to remove the contradiction.

## Memory Gate

Update `docs/SESSION_MEMORY.md` only when information is durable and useful to a new session.

### Store

- Project goal
- Current task and current status
- Important user requirement
- Explicit constraint
- Design decision
- Important file or folder path
- A clear "Do not do this" instruction
- Remaining work
- Verification command or result
- Next-session handoff information
- Battery Portal deployment, versioning, packaging, or release state

### Do Not Store

- Casual conversation
- Frustration, complaints, emotional wording, or jokes
- Temporary brainstorming or ambiguous comments
- Duplicate, superseded, or outdated information
- Raw chat transcripts or original prompts
- Secrets, API keys, tokens, passwords, cookies, credentials, or private identifiers
- Personal or private information unless it is directly required for the project

If the information might matter but is uncertain, record a concise question under `Open Questions` instead of treating it as fact.

## Update Workflow

1. Read the existing memory before editing it. Preserve still-valid information and replace superseded information.
2. Compare the user request, current code, and relevant docs. Summarize meaning, not wording.
3. Update only the affected sections of `docs/SESSION_MEMORY.md` using its required headings.
4. Keep paths repository-relative where possible. Record commands and outcomes, never credentials or command output containing secrets.
5. After meaningful code, deployment, packaging, or documentation changes, update `Files Changed`, `Remaining Work`, and `Verification` when the Memory Gate passes.
6. If the task changes `VERSION`, `CHANGELOG`, release notes, upload packaging, or a version bump, use the existing personal `battery-portal-versioning` skill. Do not edit that personal skill.

## Required Memory Shape

Keep these headings in `docs/SESSION_MEMORY.md`:

```text
# Session Memory
## Project Goal
## Current Task
## Current Status
## Important User Requirements
## Design Decisions
## Files Changed
## Remaining Work
## Do Not Repeat
## Open Questions
## Verification
## Next Session Prompt
```

## Safety Boundaries

- Do not create hooks, background prompt logging, or raw conversation archives.
- Do not update memory for every message.
- Do not copy an entire chat into the repository.
- Do not expose or infer secret values from local files.
- Do not modify files outside the request scope merely to make memory look complete.
