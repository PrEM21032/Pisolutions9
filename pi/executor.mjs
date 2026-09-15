function inputSize(value) {
  return Buffer.byteLength(JSON.stringify(value ?? {}), 'utf8');
}

export async function executeAction(action, { tools, timeoutMs = 15000, allowedTools = [], maxInputBytes = 32768 } = {}) {
  if (!action?.tool || !tools?.call) throw new Error('invalid_action');
  if (!Array.isArray(allowedTools) || !allowedTools.includes(action.tool)) throw new Error('tool_not_allowed');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new Error('invalid_timeout');
  if (inputSize(action.input) > maxInputBytes) throw new Error('input_too_large');

  let timer;
  try {
    const task = Promise.resolve().then(() => tools.call(action.tool, action.input || {}));
    return await Promise.race([
      task,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('tool_timeout')), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
