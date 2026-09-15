import { createConfiguredModelProvider, createModelProviderAdapters } from './model-adapters.mjs';

const provider = createConfiguredModelProvider({
  name: 'test-model',
  capabilities: ['reasoning'],
  run: async input => ({ truth: 'probable', completed: [], evidence: [{ source: 'test-model', claim: String(input.objective) }] })
});

if (!provider) throw new Error('provider_not_created');
const adapters = createModelProviderAdapters([provider]);
if (typeof adapters['test-model'] !== 'function') throw new Error('adapter_not_exposed');
const result = await adapters['test-model']({ objective: 'test' });
if (result.truth !== 'probable') throw new Error('adapter_result_failed');

const disabled = createConfiguredModelProvider({ name: 'disabled', run: async () => ({}), enabled: false });
if (disabled !== null) throw new Error('disabled_provider_exposed');

console.log(JSON.stringify({ ok: true, providerBoundary: true, disabledProvidersExcluded: true }));
