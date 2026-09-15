# PI Cloud Runtime

PI uses a zero-cost-first architecture.

## Cloud surface

- Netlify Function: `/api/pi`
- `GET` provides a public health/capability response.
- `POST` accepts an `objective` only when the `PI_OWNER_TOKEN` environment secret is configured and the request supplies `Authorization: Bearer <token>`.
- Invalid methods, malformed JSON, empty objectives, and objectives over 4,000 characters are rejected.
- The deterministic engine does not claim external execution, deployment, testing, or factual discovery without verified tools.

## Owner console

The web console sends owner objectives to `/api/pi` and keeps the entered token in browser memory only for the active page. It never displays or commits a secret. Without a provisioned token, the console remains a plan-preview surface.

## Autonomous execution

GitHub Actions runs the PI autonomous cycle every 15 minutes and supports manual `workflow_dispatch` with an owner-supplied objective.

The workflow uses read-only repository permissions and a concurrency guard so overlapping cycles are not started.

## Security boundary

The Netlify project currently requires team SSO for project access. The cloud POST surface is additionally bearer-protected. Provisioning or rotating `PI_OWNER_TOKEN` is an external credential action and must be performed through the hosting provider; PI must never invent, expose, or commit that secret.

## Cost boundary

No paid model provider is required for the core planning path. External model providers remain optional upgrades.
