# PI V1 Verification Standard

V1 is considered verified only when each boundary has direct evidence.

## Gates

1. **Core** — deterministic routing, runtime, state, idempotency and recovery tests pass.
2. **Safety** — Netra blocks suspicious paths and protected actions require the owner.
3. **Truth** — verified outputs require evidence and independent verification.
4. **UI contract** — the real customer-facing source contract is checked for input, loading, response rendering, error handling, and safe text output.
5. **API contract** — request validation, CORS, success/error schemas and provider failure classes are covered.
6. **Production smoke** — public UI and API are reachable and a real answer path is verified when the provider is available.
7. **Provider health** — provider authentication, model access, quota/rate limits and upstream availability are tracked separately from PI code health.

## Status semantics

- `VERIFIED`: direct test evidence exists for the gate.
- `BLOCKED`: the gate cannot currently pass because of an external dependency or owner action.
- `NOT_VERIFIED`: the required test/evidence does not exist.

A blocked provider must never be reported as a PI code failure, and passing local tests must never be reported as proof that production is healthy.

## Release rule

V1 code may be considered internally complete only when the V1 gate is green. Production readiness additionally requires production smoke and provider health to be verified. V2 failures are tracked independently and must not obscure V1 status.
