---
name: debo-connectors
version: 1.0.0
description: Procedural knowledge for safely executing third-party actions (Gmail, Slack, Calendar, GitHub) with human-in-the-loop approval.
author: Debo Contributors
license: MIT
tools_required:
  - debo_approve_workflow
---

# Debo Connectors Skill

Use this skill when an agent proposes or executes real-world actions in connected third-party platforms via Composio.

## Safety Invariants
1. **Never Execute Tier 2 Actions Without Approval**: Creating calendar events, drafting emails to external recipients, or creating issues requires user authorization.
2. **Present Clear Parameter Diffs**: Before requesting approval, display the exact recipient, subject, and body to the user.
3. **Handle External Failures Gracefully**: If a third-party API returns an error or rate limit, record the failure and offer compensation steps.
