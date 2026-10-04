# ADR-0006 — Agentic UI Layer

## Status
accepted — protocol integration pending implementation validation

## Context
Debo needs a stable boundary between agent execution and user-facing presentation so the UI can evolve without coupling application logic to one widget framework.

## Decision
1. Adopt **AG-UI 1.0** as the Agent ↔ User interaction protocol boundary.
2. Build Debo presentation components with its own Radix/Tailwind design system.
3. Use **assistant-ui** only where its headless primitives materially reduce UI implementation effort; it is not the protocol or system-of-record layer.
4. Do not require **CopilotKit** for the Debo runtime. It remains an ecosystem option/adapter, not an architectural dependency.

## Why
AG-UI provides an open event-based boundary between agent backends and user-facing applications. Debo can map protocol events into typed UI state without delegating presentation ownership to a turnkey widget layer.

## Consequences
- **Positive:** protocol/UI separation, custom visual control, and future client diversity.
- **Negative:** Debo owns more presentation integration and must track protocol compatibility as AG-UI evolves.

## Exit strategy
The UI package consumes a typed protocol adapter. Replacing AG-UI requires swapping the adapter rather than rewriting product business logic or presentation components.

## Evidence
- AG-UI 1.0 specification and release history.
- `docs/research/ag-ui.md`.
- `docs/research/assistant-ui.md`.
