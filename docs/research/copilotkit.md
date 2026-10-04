# CopilotKit

## Problem solved
Full-stack framework for integrating AI copilot sidebars, in-app text completion, and action agents into React applications.

## Why considered
Evaluated in early prototypes for quick AI chat sidebar generation and frontend-to-backend tool propagation.

## Official repository
`https://github.com/CopilotKit/CopilotKit`

## Official documentation
`https://docs.copilotkit.ai`

## Current version/date checked
v1.x / Checked October 2026

## License
MIT.

## Deployment models
React client library communicating with Next.js API endpoints or external Copilot Cloud / LangGraph instances.

## TypeScript support
Full TypeScript support across client hooks and server packages.

## Python support
Python SDK available for backend integration.

## MCP support
Third-party wrappers; evolving protocol integration.

## Agent framework support
Provides adapters for LangGraph, LangChain, and custom endpoints.

## Workflow support
Client-side integration only; relies on backend endpoints for execution.

## Self-hosting
Self-hostable; client connects to custom server endpoints.

## Docker
N/A (Frontend component library and server route handlers).

## Authentication
Relies on host Next.js application session.

## Multi-tenancy
Inherits application tenant scoping.

## Security
Client state injection can inadvertently expose application state to untrusted model prompts.

## Observability
Basic tracing via Copilot Cloud; custom telemetry requires manual interception.

## Strengths
- Fast prototype velocity for standard floating chat sidebars.
- Pre-built UI components for text suggestion and action triggers.

## Weaknesses
- **Heavy architectural coupling**: Tight coupling between presentation components, streaming transport, and agent state creates fragility.
- **Styling lock-in**: Rigid default component hierarchies conflict with Debo's calm, editorial design system.
- **Breaking changes**: Rapid historical API churn across minor versions.
- Violates clean separation of concerns by intertwining protocol streaming with UI layout.

## Alternatives considered
AG-UI Protocol + custom Radix/Tailwind components, assistant-ui.

## Benchmark evidence
Bundle size adds ~120KB+ to client bundles; higher re-render churn during streaming tool invocations.

## Cost considerations
Open source is free; Copilot Cloud charges for hosted infrastructure.

## Exit strategy
Removing CopilotKit previously required significant frontend refactoring due to deep hook coupling.

## Recommendation
**REJECTED & DEPRECATED**. Do NOT use CopilotKit in Debo clean-room architecture. Debo adopts the decoupled AG-UI protocol with custom editorial UI components.

## Confidence
Definitive (1.0 / 5.0 for adoption; 5.0 / 5.0 on deprecation)

## Sources
- Official repository: https://github.com/CopilotKit/CopilotKit
- Documentation: https://docs.copilotkit.ai
