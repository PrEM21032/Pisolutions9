export function createModelProvider({ name, run, capabilities = [] } = {}) {
  if (!name || typeof run !== 'function') throw new Error('invalid_model_provider');
  return Object.freeze({ name, capabilities: [...capabilities], async run(input, options = {}) { return run(input, options); } });
}

export function createModelProviderRegistry(providers = []) {
  const map = new Map(providers.map(provider => [provider.name, provider]));
  return {
    list() { return [...map.values()].map(({ name, capabilities }) => ({ name, capabilities })); },
    has(name) { return map.has(name); },
    async run(name, input, options = {}) {
      const provider = map.get(name);
      if (!provider) return { ok: false, status: 'unknown', reason: 'model_provider_not_configured', provider: name || null };
      return { ok: true, provider: name, value: await provider.run(input, options) };
    }
  };
}
