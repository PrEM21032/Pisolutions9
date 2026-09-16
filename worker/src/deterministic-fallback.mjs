function normalize(message) {
  return message.trim().toLowerCase().replace(/\s+/g, ' ');
}

function arithmetic(message) {
  const expression = message
    .replace(/\b(what is|calculate|compute|solve)\b/gi, '')
    .replace(/\b(plus|add)\b/gi, '+')
    .replace(/\b(minus|subtract)\b/gi, '-')
    .replace(/\b(times|multiplied by)\b/gi, '*')
    .replace(/\b(divided by|over)\b/gi, '/')
    .replace(/\b(to the power of|power)\b/gi, '**')
    .replace(/\?/g, '')
    .trim();
  if (!/^[0-9+\-*/().%\s]+$/.test(expression) || !/[0-9]/.test(expression)) return null;
  try {
    const value = Function(`"use strict"; return (${expression})`)();
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
  } catch {
    return null;
  }
}

export function deterministicFallback(message) {
  const text = normalize(message);
  const math = arithmetic(message);
  if (math !== null) return `The answer is ${math}.`;

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(text) || text.includes('say hello')) {
    return 'Hello — I’m PI. What would you like to work on?';
  }

  if (text.includes('why is the sky blue')) {
    return 'The sky looks blue because Earth’s atmosphere scatters shorter blue wavelengths of sunlight more strongly than longer red wavelengths.';
  }

  if (text.includes('what can you do') || text.includes('what do you do')) {
    return 'I can help turn an objective into a plan, research information, reason through options, and coordinate PI’s available tools and specialists.';
  }

  return null;
}
