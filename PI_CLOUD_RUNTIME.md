# PI Cloud Runtime

PI uses a zero-cost-first architecture.

## Cloud surface

- Netlify Function: `/api/pi`
- `GET` provides a health/capability response.
- `POST` accepts an `objective` and returns a deterministic bounded plan.
- Unsupported methods and malformed or empty requests are rejected.
- The deterministic engine does not claim external execution, deployment, testing, or factual discovery without verified tools.

## Autonomous execution

GitHub Actions runs the PI autonomous cycle every 15 minutes and also supports manual `workflow_dispatch` with an owner-supplied objective.

The workflow uses read-only repository permissions and a concurrency guard so overlapping cycles are not started.

## Security boundary

The Netlify project currently requires team SSO for project access. Do not expose an unauthenticated public customer-control surface. Adding a separate bearer/API credential requires an actual secret to be provisioned through the hosting provider; PI must stop at that credential gate rather than invent one.

## Cost boundary

No paid model provider is required for the core planning path. External model providers remain optional upgrades.
