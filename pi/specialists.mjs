const ALLOWED = new Set(['business','research','data','earth','engineering','security','verification']);

export function createSpecialistRegistry(specialists = {}) {
  return {
    list() { return Object.keys(specialists).filter(name => ALLOWED.has(name)); },
    has(name) { return ALLOWED.has(name) && typeof specialists[name] === 'function'; },
    async delegate(name, mission, input = {}) {
      if (!ALLOWED.has(name)) throw new Error('specialist_not_allowed');
      const handler = specialists[name];
      if (typeof handler !== 'function') throw new Error('specialist_not_configured');
      return handler(mission, input);
    }
  };
}
