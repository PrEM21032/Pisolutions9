# PI — All-in-One AI Architecture

## Objective

Build PI as a model-agnostic AI operating layer: one owner/customer interface that accepts an objective, plans the work, routes tasks to the right specialists and tools, verifies important results, recovers from failures, and returns a clear outcome.

## V1 architecture

`User objective → Krishna orchestrator → plan → specialist/tool routing → execution → verification → correction loop → final answer`

### Core layers

1. **Interface** — simple conversational UI; never expose internal orchestration or code to normal users.
2. **Krishna / Orchestrator** — classify the objective, create a bounded plan, select specialists/tools, enforce permissions and stop conditions.
3. **Model router** — model-agnostic adapters with budget/availability checks and deterministic fallbacks.
4. **Specialists** — research, engineering, business, data/finance, Earth Intelligence, and future domain specialists.
5. **Tool layer** — web/search, files, APIs, calculators, automation, databases and other approved connectors.
6. **Evidence + verification** — capture source/evidence metadata, detect contradictions, validate tool contracts and label uncertainty.
7. **Recovery** — when a step fails, diagnose the failure, retry safely, switch strategy/provider when appropriate, and record the failure class.
8. **State/observability** — mission state, tool calls, verification results, errors and outcome evidence must be inspectable.
9. **Human boundary** — humans remain authoritative for permissions, legally required approvals and exceptional/high-impact actions.

## Technology strategy

Use technologies as replaceable components, not as the architecture itself.

- **n8n:** optional automation layer for scheduled/event-driven workflows.
- **Langflow:** optional visual prototyping tool; do not make runtime dependent on it.
- **Ollama/local models:** optional low-cost/local inference path where hardware and quality are appropriate.
- **OpenRouter/model gateways:** optional provider-routing path; enforce budget, reliability and privacy rules.
- **Composio/MCP/connectors:** add integrations through explicit tool contracts and least-privilege permissions.
- **Puter/Dyad:** optional prototyping/build accelerators; PI must remain portable if either disappears.
- **Custom PI orchestration:** source of truth for mission planning, verification, state and recovery.

## Non-negotiable engineering principles

- Do not equate "free tier" with unlimited production capacity.
- Do not add a tool unless it solves a demonstrated problem.
- Never silently fabricate tool results, citations, execution, or completion.
- Important claims require evidence or an explicit uncertainty label.
- Tool failures must be observable and recoverable.
- Provider/model failures must not corrupt mission state.
- Customer-facing responses must be human-readable, not raw JSON/code unless requested.
- Security and permissions are part of the runtime, not an afterthought.
- Every new capability must have automated tests and a release gate.

## Evolution path

### V1 — Reliable foundation

Owner console + runtime + model router + tool contracts + verification + end-to-end mission execution.

### V1.x — Capability expansion

Add web research, files, calculators, selected APIs, richer evidence capture and specialist routing.

### V2 — Specialist team

Parallel specialist execution, shared mission state, stronger recovery and evaluation suites.

### V3 — Autonomous workflows

Scheduled missions, event triggers, long-running jobs, approval checkpoints and self-diagnostics.

### V4 — Global platform

Large connector ecosystem, multimodal capabilities, localization, enterprise controls, stronger evaluation and scalable infrastructure.

## Definition of success

PI should not be judged by how many models or integrations it contains. It should be judged by whether it can reliably turn a user's objective into a verified outcome with minimal unnecessary human coordination.
