import { createSpecialistRegistry } from './specialists.mjs';
import { routeSpecialists, delegateSpecialists } from './specialist-router.mjs';

const available = ['business', 'research', 'data', 'engineering', 'security', 'verification'];
const business = routeSpecialists('research export market prices', available);
if (business.join(',') !== 'business,research,data') throw new Error('business_route_failed');
const engineering = routeSpecialists('build and deploy software', available);
if (engineering.join(',') !== 'engineering,security,verification') throw new Error('engineering_route_failed');

const registry = createSpecialistRegistry({
  research: async () => ({ ok: true, source: 'research' }),
  data: async () => ({ ok: true, source: 'data' })
});
const delegated = await delegateSpecialists(registry, 'plain research task', { id: 'm1' });
if (delegated.selected.join(',') !== 'research,data') throw new Error('delegation_route_failed');
if (delegated.results.length !== 2) throw new Error('delegation_execution_failed');

console.log(JSON.stringify({ ok: true, deterministicRouting: true, delegated: delegated.results.length }));
