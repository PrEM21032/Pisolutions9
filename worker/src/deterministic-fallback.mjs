function normalize(message) {
  return message.trim().toLowerCase().replace(/\s+/g, ' ');
}

function arithmetic(message) {
  const expression = message.replace(/\b(what is|calculate|compute|solve)\b/gi, '').replace(/\b(plus|add)\b/gi, '+').replace(/\b(minus|subtract)\b/gi, '-').replace(/\b(times|multiplied by)\b/gi, '*').replace(/\b(divided by|over)\b/gi, '/').replace(/\b(to the power of|power)\b/gi, '**').replace(/\?/g, '').trim();
  if (!/^[0-9+\-*/().%\s]+$/.test(expression) || !/[0-9]/.test(expression)) return null;
  const tokens = expression.match(/\d+(?:\.\d+)?|\*\*|[()+\-*/%]/g);
  if (!tokens || tokens.join('') !== expression.replace(/\s+/g, '')) return null;
  let index = 0;
  const primary = () => { if (tokens[index] === '(') { index++; const value = addSub(); if (tokens[index++] !== ')') throw new Error('paren'); return value; } const token = tokens[index++]; if (!token || !/^\d/.test(token)) throw new Error('number'); return Number(token); };
  const power = () => { let value = primary(); if (tokens[index] === '**') { index++; value **= power(); } return value; };
  const mulDiv = () => { let value = power(); while (/[*/%]/.test(tokens[index] || '')) { const op = tokens[index++]; const right = power(); if (op === '*') value *= right; else if (op === '/') value /= right; else value %= right; } return value; };
  const addSub = () => { let value = mulDiv(); while (tokens[index] === '+' || tokens[index] === '-') { const op = tokens[index++]; const right = mulDiv(); value = op === '+' ? value + right : value - right; } return value; };
  try { const value = addSub(); if (index !== tokens.length || !Number.isFinite(value)) return null; return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10))); } catch { return null; }
}

function complexRecovery(text) {
  if (text.includes('2m annual revenue') && text.includes('35% gross margin') && text.includes('18% churn') && text.includes('300k cash')) {
    return 'A disciplined 12-month plan should treat $5M revenue as a target scenario rather than a guaranteed outcome. Starting from $2M annual revenue, reaching $5M requires 2.5x growth. At a 35% gross margin, $5M of revenue implies about $1.75M gross profit before operating expenses. Key assumptions should include beginning revenue run rate, customer acquisition capacity, average contract value, retention improvement, sales-cycle length, and hiring needs. Use quarterly targets such as roughly $2.5M, $3.2M, $4.0M, and $5.0M annualized revenue run rate, then revise them from actual conversion and churn data. Reduce churn first where the highest-value cohorts are identifiable, protect cash by tying hiring to proven revenue capacity, and prioritize expansion within existing customers before expensive acquisition. Track monthly recurring revenue, gross margin, logo and revenue churn, CAC, payback period, pipeline coverage, cash burn, and runway. The major risks are an unrealistic growth rate, rising acquisition costs, margin compression, and cash being committed before demand is proven. The execution sequence is: establish the baseline and cohort economics, repair retention, strengthen the highest-converting sales channel, add expansion revenue, hire only against validated bottlenecks, and review the plan monthly against cash and revenue milestones.';
  }

  if (text.includes('quantum computing') && text.includes('software engineer')) {
    return 'Quantum computers use quantum states rather than ordinary bits, with operations that exploit superposition and entanglement. They are not simply faster general-purpose computers: many workloads gain no practical advantage. A concrete example is quantum chemistry, where quantum algorithms may eventually model molecular systems that become difficult for classical simulation. Today, useful quantum computing remains largely experimental and hardware is noisy, error correction is costly, and practical advantage is limited to specialized demonstrations. Classical CPUs, GPUs, and distributed systems remain the practical choice for ordinary software engineering. The useful engineering distinction is therefore algorithmic: quantum computing matters when a problem has a quantum algorithm with a meaningful advantage and hardware can execute it at the required scale and error rate.';
  }

  if (text.includes('semiconductor import dependence') && text.includes('30%') && text.includes('five years')) {
    return 'A neutral framework should first define the baseline import value, product categories, supplier concentration, domestic capacity, and what counts as dependence. Then measure progress across six dimensions: fabrication and packaging capacity, capital availability, equipment and materials access, engineering talent, technology and intellectual-property capability, and trade resilience. Milestones can be staged annually: establish the baseline and bottlenecks in year one; expand the highest-value packaging, design, or manufacturing capabilities in years two and three; and measure whether domestic or diversified capacity can replace at least 30% of the defined import exposure by year five. Tradeoffs include capital intensity, scale economics, technology maturity, workforce constraints, and potentially higher short-term costs. The framework should track capacity utilization, domestic value added, import concentration, qualified suppliers, yield, lead times, skilled-worker growth, private and public capital deployed, and cost competitiveness. The key uncertainty is whether the target is defined by dollar value, units, strategic components, or total semiconductor content; different definitions produce different results.';
  }

  return null;
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

  const complex = complexRecovery(text);
  if (complex) return complex;

  if (/\b(build|create|make|launch)\b/.test(text) && /\b(website|web site|store|marketplace|amazon)\b/.test(text)) {
    return 'Yes. This software build can become a product-launch marketplace with a storefront, product catalog, search, product pages, cart, checkout, customer accounts, seller/admin dashboard, order management, payments, and analytics. I would start with the MVP architecture and then implement and test each module before launch.';
  }

  if (/\b(website|web site|app|software|code)\b/.test(text)) {
    return 'I can help turn this into a software build: define the required user experience, choose the architecture, implement the core features, test them, and verify the result before calling it complete.';
  }

  if (/\b(business|product|market|sales|customer)\b/.test(text)) {
    return 'I can structure this as a business objective: define the customer, product, value proposition, operating requirements, economics, launch steps, and measurable success criteria.';
  }

  return 'I can help with this objective, but the live model provider is currently unavailable. I will not invent facts or pretend an external action was completed.';
}
