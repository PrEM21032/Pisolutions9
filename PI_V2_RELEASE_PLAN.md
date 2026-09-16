# PI V2 — Specialist Team Release Plan

## Release objective

Move PI from a reliable single-runtime foundation into a coordinated specialist team that can execute multi-step missions with shared state, explicit evidence, bounded parallelism, recovery, and independent verification.

`Human objective → Human Understanding → Krishna → mission graph → specialists → shared state → tools → verification → recovery → outcome`

## V2 scope

### 1. Mission graph
- Represent a mission as explicit steps/dependencies rather than one undifferentiated execution call.
- Support sequential and bounded parallel specialist work.
- Preserve deterministic ordering where dependencies require it.
- Stop safely on policy, evidence, or authorization failures.

### 2. Specialist contracts
- Standard input/output contract for research, engineering, business, data/finance, and Earth Intelligence specialists.
- Every specialist declares capabilities, required evidence, expected outputs, failure classes, and safe alternatives.
- Specialists cannot bypass Krishna, policy, or owner gates.

### 3. Shared mission state
- Durable mission state across autonomous invocations.
- Explicit states for queued, running, blocked, retrying, verified, completed, and dead-lettered work.
- Atomic updates and recovery after interrupted execution.
- Run identity remains distinct while retries remain idempotent.

### 4. Verification mesh
- Separate execution from verification.
- Verify important claims independently from the producing specialist.
- Detect contradictory evidence and downgrade truth level instead of guessing.
- Record verification evidence in the mission ledger.

### 5. Recovery engine
- Diagnose failures by class.
- Retry only when the failure is retryable.
- Switch provider, specialist, or strategy when a safe alternative exists.
- Bound retries and prevent retry storms.
- Dead-letter unresolved work with a precise owner-required reason.

### 6. Model/provider abstraction
- Keep deterministic execution as the zero-cost baseline.
- Allow multiple model providers through the existing adapter/router boundary.
- Route by capability, reliability, privacy, cost, and task requirements.
- Never make one provider a hard dependency for core runtime operation.

### 7. Evaluation
- Add specialist contract tests.
- Add mission-graph tests for dependency ordering and bounded parallelism.
- Add crash/restart/idempotency tests.
- Add conflicting-evidence and verification tests.
- Add recovery/fallback/dead-letter tests.
- Add adversarial owner-gate and tool-permission tests.
- Maintain the full V1 regression suite as a V2 release prerequisite.

## V2 release gates

V2 cannot be called released until all of the following are evidenced:

1. Full V1 regression remains green.
2. Mission graph executes dependency-correct workflows.
3. Parallel specialist work is bounded and recoverable.
4. Durable state survives interrupted runs without duplicate execution.
5. Verification independently challenges specialist output.
6. Recovery selects safe alternatives without blind retries.
7. Owner gates block irreversible, financial, legal, secret, and destructive production actions.
8. Truth levels are preserved: verified, probable, speculative, unknown.
9. Customer-facing responses remain human-readable.
10. Production smoke tests pass for the public interface/runtime.
11. No release claim is made without runtime/CI evidence.

## Explicitly out of scope for V2

- Unbounded autonomous authority.
- Autonomous spending or financial transfers.
- Legal commitments.
- Secret rotation without owner authorization.
- Destructive production changes without approval.
- Claims of consciousness or human-equivalent emotion.
- Using private customer conversations for training without lawful and explicit authorization.

## Build order

1. Mission graph + contracts.
2. Shared durable state integration.
3. Specialist execution bridge.
4. Verification mesh.
5. Recovery engine hardening.
6. Parallel execution controls.
7. V2 evaluation suite.
8. Release candidate gate.
9. Production smoke verification.
10. V2 release publication only after evidence is green.

## Current starting point

V1 foundation is the base. The latest main commit is the autonomous mission-identity fix, which prevents separate scheduled runs from reusing an already-completed mission while preserving retry idempotency.
