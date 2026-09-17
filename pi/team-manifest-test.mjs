import assert from 'node:assert/strict';
import { PI_TEAM, PI_DEPARTMENTS, TEAM_PRINCIPLES, getTeamRole, getDepartment } from './team-manifest.mjs';

assert.equal(PI_TEAM.length, 16);
assert.equal(PI_DEPARTMENTS.length, 8);
assert.equal(getTeamRole('Krishna').role, 'orchestrator');
assert.equal(getTeamRole('Saraswati').role, 'knowledge');
assert.equal(getTeamRole('Nandi').role, 'reliability');
assert.equal(getTeamRole('Vishwakarma').role, 'universal_engineering');
assert.equal(getTeamRole('Kubera').role, 'resources');
assert.equal(getTeamRole('Mitra').role, 'human_collaboration');
assert.equal(getTeamRole('Chitragupta').role, 'audit_provenance');
assert.equal(getTeamRole('Durga').role, 'security');
assert.equal(getDepartment('Red Team & Reliability').lead, 'Shiva');
assert.equal(getDepartment('Governance, Security & Trust').members.includes('Durga'), true);
assert.equal(getDepartment('Human Expertise & Resources').members.includes('Mitra'), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Human understanding')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('No fabricated')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('objective-centric')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Least privilege')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('provider-independent')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('prevention as well as repair')), true);
assert.equal(TEAM_PRINCIPLES.some((p) => p.includes('Build, break, and prove')), true);

console.log('team-manifest-test: ok');
