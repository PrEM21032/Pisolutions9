import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function verifyProviderConfiguration(bindings) {
  if (!Array.isArray(bindings) || !bindings.some(binding =>
    binding?.name === 'OPENAI_API_KEY' && binding.type === 'secret_text')) {
    throw new Error('Production Worker is missing the required OPENAI_API_KEY secret binding.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    verifyProviderConfiguration(JSON.parse(readFileSync(0, 'utf8')));
    console.log('Required OpenAI secret is bound to the production Worker; live customer and web-research gates must still pass.');
  } catch {
    console.error('Production provider configuration failed: expected an OPENAI_API_KEY secret binding in the deployed Worker secret list.');
    process.exitCode = 1;
  }
}
