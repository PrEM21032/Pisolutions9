# PI Build Plan — 2026-09-15

## Today: Execution hardening
- Prevent overlapping autonomous cycles.
- Add per-mission action/model budgets.
- Add dead-letter handling after retry exhaustion.
- Emit lifecycle observability for submit, cycle, verification, and recovery.
- Keep the truth rule strict: unverified work is never reported as completed.
- Validate the new runtime guard path with a dedicated test.

## Tomorrow: Live intelligence bridge
1. Durable mission/state adapter (Netlify Blobs or another authorized store).
2. Real model adapter with provider selection and bounded model-call budget.
3. Specialist orchestrator and tool/capability routing.
4. Owner-console to live runtime bridge.
5. End-to-end mission test: objective → research/model → tool → verification → evidence → outcome.
6. Production gate with protected environment approval.

## Owner gate
Owner action is required only when PI reaches a real external authorization boundary: production credentials/secrets, protected production environment approval, paid external service activation, legal/financial commitment, or irreversible production change.

## Truth status
Verified: repository runtime foundation, queue, idempotency, verification gate, evidence requirement, recovery foundation, bounded executor, model-router foundation, observability, CI/self-tests.
Probable: the new hardening changes after CI completes.
Unknown: durable persistence, live model execution, real external tool execution, and production deployment until runtime evidence exists.
