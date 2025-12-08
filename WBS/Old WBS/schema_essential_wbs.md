# 📘 Project Data Manifest — Essential_WBS.csv

## **File purpose**
This file defines the core task list for the Portfolio Web App project.  
Each row represents one actionable task or deliverable, written in chronological order.  
There are no computed fields (like dates, durations, or priorities); tasks are executed sequentially when commanded.

---

## **File location**

../WBS/Essential_WBS.csv

---

## **File format**
| Column | Type | Description | Example |
|---------|------|-------------|----------|
| **ID** | string / float | Unique identifier used for ordering and referencing tasks. Dotted hierarchy permitted (e.g., `1`, `1.1`, `2.0`). | `2.1` |
| **Epic** | string | Thematic or functional grouping of related tasks. | `Design System` |
| **Task** | string | Short, descriptive title of the task. | `Core components` |
| **Description** | string | Brief summary of what the task accomplishes. | `Build UI components with accessibility-first patterns.` |
| **Deliverables** | string | Tangible outputs, files, or assets expected when the task is complete. | `packages/ui/*` |
| **Acceptance Criteria** | string | What must be true for this task to be considered done. | `All components render in Storybook with no axe violations.` |

---

## **Interpretation rules**
- The file is read **top to bottom** — chronological order.  
- Each task may be **referenced by its `ID`** (e.g. “Execute task 3.2”).  
- Tasks do **not depend** on timeframes or predecessors unless explicitly stated.  
- Blank `Deliverables` or `Acceptance Criteria` cells indicate flexible or exploratory items.  
- ChatGPT should assume **default context continuity**: each task builds on the previous unless contradicted.

---

## **How ChatGPT should use this file**
- Treat it as the **authoritative index of tasks**.  
- When asked about project progress, scope, or next steps:
  - Reference rows directly by `ID` or `Task`.
  - Assume higher-level **Epics** (e.g. “Design System”) group their subtasks.
- When asked to “run,” “expand,” or “detail” a task:
  - Use the `Description` and `Deliverables` fields to generate the working instructions or code.
- When asked to **summarize progress**:
  - Display tasks grouped by `Epic` and ordered by `ID`.
- When creating new tasks:
  - Continue `ID` numbering sequentially (e.g. after `26.3`, next is `27.0`).

---

## **Versioning note**
If you later extend this sheet to include more fields (e.g., `Owner`, `Status`, or `Phase`), ensure:
- New columns are added **after existing ones**.
- Header names remain unchanged for backward compatibility.

---

## ✅ **Example interpretation query**
> “List all deliverables for Epic ‘Architecture’.”  
> → ChatGPT filters all rows where `Epic == Architecture` and returns the `Deliverables` column.


