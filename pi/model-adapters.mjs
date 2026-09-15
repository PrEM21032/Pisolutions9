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

export function createOpenAIResponsesProvider({
  name = 'openai',
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.PI_OPENAI_MODEL || 'gpt-5.6-luna',
  baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  enabled = true
} = {}) {
  if (!enabled) return null;

  return createConfiguredModelProvider({
    name,
    capabilities: ['reasoning', 'text'],
    run: async input => {
      if (!apiKey) throw new Error('openai_api_key_missing');
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: 'system',
              content: [{ type: 'input_text', text: 'You are PI intelligence. Return only JSON with keys truth, completed, evidence, nextAction, uncertainty. Never claim an external action is completed without evidence.' }]
            },
            {
              role: 'user',
              content: [{ type: 'input_text', text: JSON.stringify(input ?? {}) }]
            }
          ]
        })
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`openai_http_${response.status}:${detail.slice(0, 500)}`);
      }
      const payload = await response.json();
      const text = payload.output_text || payload.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || '';
      if (!text) throw new Error('openai_empty_response');
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('openai_non_json_response');
      }
    }
  });
}
