const DOMAIN_RULES = Object.freeze([
  { name: 'business', pattern: /business|market|sales|customer|revenue|export|import|price|profit|investment/i, tasks: ['define_business_goal', 'identify_constraints', 'build_decision_matrix'] },
  { name: 'earth', pattern: /earth|satellite|land|crop|agriculture|map|geospatial|location|farm/i, tasks: ['define_area_of_interest', 'identify_data_sources', 'build_evidence_checklist'] },
  { name: 'engineering', pattern: /build|code|deploy|software|app|github|netlify|feature|fix|test/i, tasks: ['inspect_system', 'change_code', 'run_tests', 'verify_change'] },
  { name: 'research', pattern: /research|compare|find|learn|analyze|study|investigate/i, tasks: ['decompose_question', 'collect_available_evidence', 'compare_findings'] }
]);

const CONVERSATIONAL_RULES = Object.freeze([
  { intent: 'greeting', pattern: /^(hi|hello|hey|good morning|good afternoon|good evening|namaste)\b[!. ]*$/i },
  { intent: 'math', pattern: /^(what is|calculate|solve)\s+[-+*/(). 0-9]+\??$/i },
  { intent: 'weather', pattern: /\b(weather|forecast|temperature|rain|snow|wind|humidity)\b/i },
  { intent: 'time', pattern: /\b(what time|current time|time is it)\b/i },
  { intent: 'conversion', pattern: /\b(convert|conversion)\b/i },
  { intent: 'explanation', pattern: /^(what is|what are|who is|why is|how does|explain|define)\b/i }
]);

function classifyConversational(text) {
  return CONVERSATIONAL_RULES.find(rule => rule.pattern.test(text))?.intent || null;
}

function mathAnswer(text) {
  const expression = text.replace(/^(what is|calculate|solve)\s+/i, '').replace(/[?=]+$/g, '').trim();
  if (!/^[0-9+*/().\s-]+$/.test(expression) || !/[0-9]/.test(expression)) return null;
  try {
    const value = Function(`"use strict"; return (${expression})`)();
    if (!Number.isFinite(value)) return null;
    return `${expression} = ${value}`;
  } catch { return null; }
}

function customerResponse(intent, text) {
  switch (intent) {
    case 'greeting': return { title: 'Hello', message: 'Hi — Krishna is ready. Give me a question or objective and I’ll route it to the right path.', dataRequired: null };
    case 'math': return { title: 'Answer', message: mathAnswer(text) || 'I can calculate that, but I need a valid arithmetic expression.', dataRequired: null };
    case 'weather': return { title: 'Weather', message: 'I recognized this as a weather request. Current weather must come from a live weather data source; PI will not invent conditions.', dataRequired: 'current weather data and location' };
    case 'time': return { title: 'Time', message: 'This is a current-time request. PI should use a live clock for the requested location rather than route it through a business mission.', dataRequired: 'current clock and timezone' };
    case 'conversion': return { title: 'Conversion', message: 'This is a unit-conversion request. PI should calculate the conversion directly instead of creating a multi-agent mission.', dataRequired: 'source unit, target unit and value' };
    case 'explanation': return { title: 'Explanation', message: 'This is an informational question. PI should answer it directly when the required knowledge is available, and use research/verification only when needed.', dataRequired: null };
    default: return null;
  }
}

export function planNoGpt(objective = '') {
  const text = String(objective).trim();
  if (!text) throw new Error('objective_required');
  const conversationalIntent = classifyConversational(text);
  if (conversationalIntent) {
    return Object.freeze({ mode: 'no-gpt', objective: text, route: 'conversation', intent: conversationalIntent, domains: [conversationalIntent], tasks: ['understand_request', 'respond_or_request_required_data'], planner: 'deterministic-intent-router', customerIntent: conversationalIntent });
  }
  const matched = DOMAIN_RULES.filter(rule => rule.pattern.test(text));
  const domains = matched.length ? matched.map(rule => rule.name) : ['general'];
  const tasks = [...new Set(matched.flatMap(rule => rule.tasks))];
  if (!tasks.length) tasks.push('define_objective', 'identify_constraints', 'verify_available_evidence');
  return Object.freeze({ mode: 'no-gpt', objective: text, route: 'mission', domains, tasks, planner: 'deterministic-rule-engine', customerIntent: null });
}

export function executeNoGptPlan(plan) {
  if (!plan || plan.mode !== 'no-gpt') throw new Error('no_gpt_plan_required');
  const response = plan.route === 'conversation' ? customerResponse(plan.intent, plan.objective) : null;
  return {
    completed: [{ verified: true, task: 'deterministic_route_generated', order: 1 }],
    planned: plan.tasks.map((task, index) => ({ task, order: index + 1 })),
    evidence: [
      { source: 'pi-no-gpt-engine', claim: 'deterministic route generated; no external action executed' },
      { source: 'pi-no-gpt-engine', claim: JSON.stringify({ route: plan.route, intent: plan.intent || null, domains: plan.domains, tasks: plan.tasks }) }
    ],
    status: 'completed',
    nextAction: plan.tasks[0] || null,
    customerResponse: response,
    uncertainty: ['No-GPT mode does not invent current external facts. Live data requests require a verified data source.']
  };
}
