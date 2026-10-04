name: Architecture Proposal (ADR Draft)
description: Propose an architectural change or new technology selection
title: "[ARCH]: "
labels: ["architecture", "adr-needed"]
body:
  - type: markdown
    attributes:
      value: |
        Major architectural proposals must adhere to the ADR process documented in `docs/adr/README.md`.
  - type: textarea
    id: context
    attributes:
      label: Context & Problem
      description: What is the architectural challenge, constraint, or opportunity?
    validations:
      required: true
  - type: textarea
    id: decision
    attributes:
      label: Proposed Decision / Technology
      description: What technology or pattern do you propose adopting?
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Evaluated
      description: List the alternatives considered and why they were rejected.
    validations:
      required: true
  - type: textarea
    id: consequences
    attributes:
      label: Consequences & Trade-offs
      description: Positive and negative impacts on operational complexity, cost, security, and developer experience.
    validations:
      required: true
