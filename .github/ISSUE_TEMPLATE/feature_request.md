name: Feature Request
description: Suggest an idea or feature for Debo
title: "[FEAT]: "
labels: ["enhancement", "proposal"]
body:
  - type: markdown
    attributes:
      value: |
        Please consult `docs/product/priority.md` to see existing P0/P1/P2 priorities before proposing major new product features.
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What user problem does this feature solve?
    validations:
      required: true
  - type: textarea
    id: proposed-solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like to see implemented.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Any alternative solutions or features you've considered.
