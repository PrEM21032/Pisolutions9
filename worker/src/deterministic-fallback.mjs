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

  if (text.includes('tell me something cool') || text.includes('tell me something interesting')) {
    return 'Here’s a cool one: a day on Venus is longer than its year. Venus takes about 243 Earth days to rotate once, but only about 225 Earth days to orbit the Sun.';
  }

  if (text.includes('ram and storage') || text.includes('difference between ram and storage')) {
    return 'RAM is fast, temporary working memory used by active programs; storage such as an SSD keeps files and applications even after the device is powered off.';
  }

  if (text.includes('opportunity cost')) {
    return 'Opportunity cost is what you give up by choosing one option instead of the next-best alternative. If you spend $100 on one thing, the opportunity cost is the value of what you could have done with that $100 instead.';
  }

  if (text.includes('what can you do') || text.includes('what do you do')) {
    return 'I can help turn an objective into a plan, research information, reason through options, and coordinate PI’s available tools and specialists.';
  }

  if (/\b(build|create|make|launch)\b/.test(text) && /\b(website|web site|store|marketplace|amazon)\b/.test(text)) {
    return 'Yes. A product-launch marketplace can be built with a storefront, product catalog, search, product pages, cart, checkout, customer accounts, seller/admin dashboard, order management, payments, and analytics. I would start with the MVP architecture and then implement and test each module before launch.';
  }

  if (/\b(website|web site|app|software|code)\b/.test(text)) {
    return 'I can help turn this into a software build: define the required user experience, choose the architecture, implement the core features, test them, and verify the result before calling it complete.';
  }

  if (/\b(business|product|market|sales|customer)\b/.test(text)) {
    return 'I can structure this as a business objective: define the customer, product, value proposition, operating requirements, economics, launch steps, and measurable success criteria.';
  }

  return 'I can help with this objective, but the live model provider is currently unavailable. I will not invent facts or pretend an external action was completed.';
}
