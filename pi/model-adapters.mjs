import { createModelProvider } from './model-contract.mjs';

export function createConfiguredModelProvider({ name, run, capabilities = [], enabled = true } = {}) {
  if (!enabled) return null;
  if (!name || typeof run !== 'function') throw new Error('invalid_model_provider');
  return createModelProvider({ name, run, capabilities });
}

export function createModelProviderAdapters(providers = []) {
  return Object.fromEntries(
    providers.filter(Boolean).map(provider => [provider.name, provider.run.bind(provider)])
  );
}
