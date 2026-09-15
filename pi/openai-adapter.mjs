const DEFAULT_MODEL = 'gpt-5.6-luna';
const ENDPOINT = 'https://api.openai.com/v1/responses';

export function createOpenAIAdapter({ apiKey = process.env.OPENAI_API_KEY, model = process.env.PI_OPENAI_MODEL || DEFAULT_MODEL, endpoint = ENDPOINT } = {}) {
  return async function run(input = {}, options = {}) {
    if (!apiKey) throw new Error('openai_credentials_required');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: options.model || model,
        input: input.input ?? input.prompt ?? input,
        max_output_tokens: options.maxOutputTokens || 4096
      })
    });
    if (!response.ok) throw new Error(`openai_http_${response.status}`);
    const data = await response.json();
    const text = data.output_text ?? data.output?.flatMap(item => item.content || []).map(part => part.text || '').filter(Boolean).join('') ?? '';
    return {
      truth: 'probable',
      completed: [],
      evidence: [{ source: 'openai:responses', claim: text, confidence: 'probable' }],
      output: text,
      responseId: data.id || null
    };
  };
}
