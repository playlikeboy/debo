---
name: debo-projects
version: 1.0.0
description: Procedural knowledge for structuring initiatives, managing linked tasks, and recording formal architectural or strategic decisions.
author: Debo Contributors
license: MIT
tools_required:
  - debo_get_project_context
  - debo_create_task
  - debo_create_decision
---

# Debo Projects Skill

Use this skill when managing project context, tracking deliverables, or documenting formal architectural and business decisions.

## Procedure
1. **Retrieve Active Context**: Call `debo_get_project_context` to understand project status, current blockers, and open tasks.
2. **Task Extraction**:
   - Extract actionable commitments from meetings and notes.
   - Call `debo_create_task` with specific, testable completion criteria.
3. **Decision Logging**:
   - When a consensus or architectural pivot is reached, call `debo_create_decision`.
   - Record the context, decision, alternatives evaluated, and consequences.
