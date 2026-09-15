const DEFAULT_ORDER = ['research', 'data', 'verification'];
const DOMAIN_MAP = [
  [/business|market|sales|customer|revenue|export|import|price/i, ['business', 'research', 'data']],
  [/earth|satellite|land|crop|agriculture|map|geospatial|location/i, ['earth', 'research', 'data']],
  [/build|code|deploy|software|app|github|netlify/i, ['engineering', 'security', 'verification']]
];

export function routeSpecialists(objective, available = []) {
  const text = String(objective || '').trim();
  if (!text) return [];
  const allowed = new Set(available);
  const match = DOMAIN_MAP.find(([pattern]) => pattern.test(text));
  const candidates = match ? match[1] : DEFAULT_ORDER;
  return [...new Set(candidates.filter(name => allowed.has(name)))];
}

export async function delegateSpecialists(registry, objective, mission, input = {}) {
  const selected = routeSpecialists(objective, registry?.list?.() || []);
  const results = [];
  for (const name of selected) results.push({ name, result: await registry.delegate(name, mission, input) });
  return { selected, results };
}
