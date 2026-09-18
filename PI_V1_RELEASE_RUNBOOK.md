# PI V1 Release Runbook

This runbook prevents repeated release mistakes and wasted provider quota.

## Before any live probe

1. Confirm the exact release-candidate commit and deployed URL.
2. Check the Cloudflare Workers AI usage page and account plan.
3. If the account is over quota, or the last response is a provider rate limit, **do not send more customer probes**.
4. An API token authenticates deployment; it does not add AI inference capacity.

## One evidence loop per candidate

After capacity is available, run this sequence once for the same commit:

1. One live-model smoke probe.
2. The model-only customer reliability suite.
3. Full V1 regression and security checks.
4. Customer end-to-end verification.
5. Launch gate.

Record the commit, provider, `source`, `truth`, response status, and workflow run for every result. Do not rerun a failed live gate unless capacity or configuration has materially changed.

## Truth rule

`pi-chat-deterministic-recovery` is safe recovery, not live-model success. A release is not ready until the customer path returns `truth: model-response` and the answer is substantive.

## Stop conditions

Stop and notify the owner when the next step requires billing, credentials, permissions, an external approval, or an irreversible production action. Never weaken a gate to obtain a green result.
