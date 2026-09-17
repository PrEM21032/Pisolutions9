import assert from 'node:assert/strict';
import { PI_TEAM, TEAM_PRINCIPLES, getTeamRole } from './team-manifest.mjs';

assert.equal(PI_TEAM.length, 16);
assert.equal(getTeamRole('Krishna').role, 'orchestrator');
assert.equal(getTeamRole('Saraswati').role, 'knowledge');
assert.equal(getTeamRole('Nandi').role, 'reliability');
assert.equal(getTeamRole('Vishwakarma').role, 'universal_engineering');
assert.equal(getTeamRole('Kubera').role, 'resources');
assert.equal(getTeamRole('Mitra').role, 'human_collaboration');
assert.equal(getTeamRole('Chitragupta').role, 'audit_provenance');
assert.equal(getTeamRole('Durga').role, 'security');
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Human understanding')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('No fabricated')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('objective-centric')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Least privilege')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('provider-independent')), true);

console.log('team-manifest-test: ok');
