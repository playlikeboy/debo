name: Bug Report
description: Report an issue or bug in Debo specifications or code
title: "[BUG]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug. Please ensure you have checked `AGENTS.md` and current specifications.
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Go to '...'
        2. Execute '...'
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen per current specifications.
    validations:
      required: true
  - type: dropdown
    id: component
    attributes:
      label: Component Affected
      options:
        - web (apps/web)
        - mcp (apps/mcp)
        - worker (apps/worker)
        - document-worker (apps/document-worker)
        - memory (packages/memory)
        - agent (packages/agent)
        - connectors (packages/connectors)
        - workflows (packages/workflows)
        - db (packages/db)
        - docs / specs
    validations:
      required: true
