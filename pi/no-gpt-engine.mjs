// Human Understanding Layer (V1)
// Purpose: understand the human's expressed objective before selecting models/tools.
// This layer intentionally reports probabilistic language signals, not claims about a person's inner state.

const INTENT_PATTERNS = [
  ['information', /\b(what|when|where|who|how many|how much|tell me|explain)\b/i],
  ['decision_support', /\b(should i|which|compare|worth it|best for me|recommend|choose)\b/i],
  ['creation', /\b(build|create|make|write|design|generate|draft)\b/i],
  ['troubleshooting', /\b(error|broken|not working|fails?|fix|issue|problem|why (is|does|did))\b/i],
  ['research', /\b(research|find|look up|investigate|analy[sz]e|sources?|evidence)\b/i],
  ['planning', /\b(plan|planning|roadmap|steps|schedule|strategy)\b/i],
];

const SIGNAL_PATTERNS = [
  ['frustration', /\b(frustrated|annoyed|angry|sick of|tired of|keeps failing|wtf|damn)\b/i],
  ['uncertainty', /\b(i don't know|not sure|confused|uncertain|maybe|probably|what do i do)\b/i],
  ['urgency', /\b(urgent|asap|right now|immediately|today|deadline|emergency)\b/i],
  ['positive_engagement', /\b(excited|love|great|awesome|thank you|thanks|let's go)\b/i],
];

export function understandHumanInput(input = '') {
  const text = String(input).trim();
  const intents = INTENT_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const signals = SIGNAL_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => ({
    type: name,
    confidence: 'moderate',
    basis: 'language_signal',
  }));

  const hasExplicitObjective = /\b(i want|i need|my goal|help me|i'm trying to|we need to)\b/i.test(text);
  const needsClarification = text.length < 8 || (!hasExplicitObjective && intents.length === 0);

  return {
    text,
    intents: intents.length ? intents : ['general'],
    explicitObjective: hasExplicitObjective,
    needsClarification,
    emotionalSignals: signals,
    constraints: extractConstraints(text),
  };
}

function extractConstraints(text) {
  const constraints = [];
  const budget = text.match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*[$€£]?\s*([\d,]+(?:\.\d+)?)/i);
  if (budget) constraints.push({ type: 'budget', value: budget[1] });
  if (/\b(cheap|low cost|low-cost|free)\b/i.test(text)) constraints.push({ type: 'cost_preference', value: 'low' });
  if (/\b(fast|quick|asap|today|immediately)\b/i.test(text)) constraints.push({ type: 'time_preference', value: 'fast' });
  return constraints;
}
