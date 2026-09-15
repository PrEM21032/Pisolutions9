import { createMission, verifyClaim } from './core.mjs';
import { routeObjective } from './router.mjs';
import { verifyOutcome } from './verify.mjs';

const mission = createMission('Build and verify the next PI capability');
if (!mission.id || mission.status !== 'planned') throw new Error('mission_creation_failed');
if (!routeObjective(mission.objective).includes('engineering')) throw new Error('routing_failed');
if (verifyClaim('completed without evidence', []).level !== 'unknown') throw new Error('truth_guard_failed');
if (!verifyOutcome({ completed: [{ verified: false }], evidence: [] }).ok === false) throw new Error('verification_failed');
console.log('PI self-test: PASS');
