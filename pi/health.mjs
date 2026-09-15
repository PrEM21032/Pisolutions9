export function health(runtime) {
  return {
    ok: Boolean(runtime && typeof runtime.submit === 'function' && typeof runtime.cycle === 'function'),
    queueSize: runtime?.queue?.size?.() ?? null,
    checkedAt: new Date().toISOString()
  };
}
