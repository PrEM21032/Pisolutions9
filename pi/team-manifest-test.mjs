import assert from 'node:assert/strict';
import { PI_TEAM, TEAM_PRINCIPLES, getTeamRole } from './team-manifest.mjs';

assert.equal(PI_TEAM.length, 11);
assert.equal(getTeamRole('Krishna').role, 'orchestrator');
assert.equal(getTeamRole('Saraswati').role, 'knowledge');
assert.equal(getTeamRole('Nandi').role, 'reliability');
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Human understanding')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('No fabricated')), true);

console.log('team-manifest-test: ok');
