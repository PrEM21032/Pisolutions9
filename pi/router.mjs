const routes = Object.freeze({
  business: ['research', 'business', 'data'],
  earth: ['earth', 'research', 'data'],
  build: ['engineering', 'security', 'verification'],
  default: ['research', 'data', 'verification']
});

export function routeObjective(objective) {
  const text = String(objective || '').toLowerCase();
  if (/satellite|land|farm|crop|geospatial|map|earth/.test(text)) return routes.earth;
  if (/build|code|app|website|deploy|software|feature/.test(text)) return routes.build;
  if (/business|market|company|product|import|export|money|investment/.test(text)) return routes.business;
  return routes.default;
}
