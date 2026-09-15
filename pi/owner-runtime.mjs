import { createOwnerRequest, renderOwnerOutcome } from './owner-bridge.mjs';

export function createOwnerRuntimeBridge(runtime) {
  if (!runtime || typeof runtime.submit !== 'function' || typeof runtime.cycle !== 'function') {
    throw new Error('invalid_runtime');
  }

  return Object.freeze({
    async submit(request = {}) {
      const normalized = createOwnerRequest(request);
      const context = {
        ...(normalized.context || {}),
        idempotencyKey: normalized.idempotencyKey || undefined
      };
      const mission = await runtime.submit(normalized.objective, context);
      return {
        missionId: mission.id,
        status: mission.status || 'planned',
        objective: mission.objective
      };
    },
    async cycle() {
      return renderOwnerOutcome(await runtime.cycle());
    }
  });
}
