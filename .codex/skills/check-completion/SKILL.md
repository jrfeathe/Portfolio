---
name: check-completion
description: Verify whether a WBS task meets the Deliverable/DoD in `WBS/FINAL_WBS.md` and, when satisfied, add a completion entry to `COMPLETED_TASKS.md`. Use when the user asks to check or mark a task complete (e.g., "check completion F4.1", "mark F2.3 done"), or when confirming completion status of a WBS ID.
---

# Check Completion

## Overview
Confirm that a WBS task's deliverables are met, then update `COMPLETED_TASKS.md` with a dated entry and evidence-backed notes.

## Workflow

### 1) Identify the task and requirements
- Read `WBS/FINAL_WBS.md`.
- Locate the row for the requested task ID (e.g., `F4.1`) and capture:
  - Task name
  - Scope / Notes
  - Deliverable / DoD (this is the acceptance criteria)

### 2) Check current completion log
- Open `COMPLETED_TASKS.md`.
- If the task ID already exists:
  - Report it; only update if the user explicitly wants to revise the entry.

### 3) Verify evidence against DoD
- Gather evidence in-repo that the deliverables are met:
  - Check task-specific notes under `WBS/Task_<ID>*.md` when present.
  - Inspect files mentioned by the DoD.
  - Use `rg` to find relevant references or outputs.
  - Run relevant tests only if required/appropriate and if the user wants them.
- Use relevant conversation context to fill in evidence details when the change was already described in the session.
- If any DoD item cannot be confirmed, do not mark complete. Inform the user that the requirements are unmet and describe what is missing.

### 4) Update completion entry
- Add a new row to `COMPLETED_TASKS.md` using the existing table format.
- Use today's date from the `date` command, formatted to match existing entries (e.g., `2026-Jan-02`).
- Notes should cite concrete evidence (file paths, commands run, QA artifacts, etc.).
- Keep notes concise; note gaps (e.g., "tests not run") if applicable.

### 5) Report back
- Summarize the evidence checked and the exact edit made.
- If completion could not be confirmed, state that requirements are unmet and explain what is still needed.

## Notes & patterns
- Prefer explicit evidence over assumptions.
- If the DoD mentions "QA notes", "screenshots", or "tests pass", ensure those artifacts exist or explicitly record the gap before marking complete.
- When multiple locales or files are involved, list the key files touched in the notes.
- Use the task's ID and official title from `FINAL_WBS.md` in the completion row.

## Example prompt
"/check_completion Task F4.1"
