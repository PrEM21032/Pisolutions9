# PI V1.02 production deployment reconciliation

This marker exists to make deployment drift explicit and auditable.

## Root cause addressed

The production answer-quality gate can exercise a Worker older than the repository's current hard-reasoning behavior when a corrective commit changes only test/gate files. `PI Chat Worker` is path-triggered by `worker/**`, so a test-only merge does not itself redeploy the Worker.

## Required evidence after this commit

1. `PI Chat Worker` deploys this exact main revision successfully.
2. Production hard-reasoning responses are either independently verified/provisional under the current contract or explicitly fail closed with `verification_failed` and `truth: unknown`.
3. Plain `model-response` must not be accepted for the hard-reasoning production quality case.
4. The production answer-quality workflow must be rerun/observed after deployment; repository-local green tests are not sufficient evidence.

This file intentionally lives under `worker/` so this corrective commit enters the production Worker deployment path without weakening any quality assertion or changing runtime semantics.
