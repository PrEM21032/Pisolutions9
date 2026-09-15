export function createObserver({ sink = console.log } = {}) {
  return {
    emit(event = {}) {
      const record = Object.freeze({
        time: new Date().toISOString(),
        missionId: event.missionId ?? null,
        step: event.step ?? null,
        status: event.status ?? null,
        truth: event.truth ?? null,
        durationMs: Number.isFinite(event.durationMs) ? event.durationMs : null,
        message: event.message ?? null
      });
      sink(JSON.stringify(record));
      return record;
    }
  };
}
