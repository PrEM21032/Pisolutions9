# PI Runtime

PI is an objective-first orchestration runtime.

## Runtime contracts

- `core.mjs` — mission creation, truth levels, recovery state, safe outcomes.
- `router.mjs` — replaceable specialist routing.
- `queue.mjs` — queue abstraction; production deployments should replace the in-memory implementation with durable storage.
- `tool-adapters.mjs` — replaceable tool registry.
- `evidence.mjs` — provenance and confidence records.
- `verify.mjs` — prevents unverified work from being reported as completed.
- `mission-state.mjs` — controlled lifecycle transitions.
- `recovery.mjs` — bounded retry/recovery wrapper.
- `runner.mjs` — scheduled runtime entry point.

The runtime must never claim execution merely because a plan exists. Secrets belong in the hosting provider's environment, never in source control.
