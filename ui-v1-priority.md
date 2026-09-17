# PI V1 UI Priority

## Objective
Make the customer interface release-ready: fast, clear, trustworthy, and resilient.

## Acceptance criteria
- Objective-first input; no internal planning/classification leakage.
- Clear processing state and useful error/recovery state.
- Responsive mobile and desktop layout.
- Prevent duplicate submissions and preserve the current objective while processing.
- Disable/guard submit during an active request and recover cleanly after timeout/network failure.
- Render long answers cleanly with readable spacing and accessible controls.
- Never expose provider names, internal agent details, secrets, or stack traces.
- Customer path must use the live API and handle unavailable service without a misleading success state.
- Cache-busted frontend asset loading after releases.
- Smoke-test representative simple and complex objectives before V1 release.

## Release gate
UI is V1-ready only when the browser/customer path, API path, deployment path, and regression suite all pass together.
