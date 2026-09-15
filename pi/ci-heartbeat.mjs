// CI heartbeat: intentionally tiny, deterministic verification probe.
// GitHub Actions should execute this through the PI Verify workflow.
if (process.version.split('.')[0] !== 'v22') {
  throw new Error(`unsupported_node:${process.version}`);
}
console.log(JSON.stringify({ ok: true, check: 'ci-heartbeat', node: process.version, truth: 'verified-by-process' }));
