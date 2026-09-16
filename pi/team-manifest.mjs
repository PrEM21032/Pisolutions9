// PI Team Manifest — V1 foundation
// Roles are capability boundaries, not claims of personhood or autonomy.

export const PI_TEAM = Object.freeze([
  { name: 'Krishna', role: 'orchestrator', owns: ['understand', 'prioritize', 'route', 'verify', 'recover', 'continue_or_escalate'] },
  { name: 'Brahma', role: 'creation', owns: ['architectures', 'hypotheses', 'new_capabilities', 'prototypes'] },
  { name: 'Vishnu', role: 'preservation', owns: ['mission_continuity', 'state_integrity', 'stable_operation'] },
  { name: 'Shiva', role: 'transformation', owns: ['failure_removal', 'retirement', 'replacement_of_broken_paths'] },
  { name: 'Rama', role: 'governance', owns: ['permissions', 'safety_boundaries', 'owner_authority', 'irreversible_action_gates'] },
  { name: 'Hanuman', role: 'execution', owns: ['tools', 'workflows', 'approved_external_actions'] },
  { name: 'Shakti', role: 'capability_infrastructure', owns: ['models', 'apis', 'compute', 'integrations'] },
  { name: 'Saraswati', role: 'knowledge', owns: ['evidence', 'knowledge_quality', 'learning_hygiene', 'uncertainty'] },
  { name: 'Garuda', role: 'perception', owns: ['research', 'external_signals', 'data_collection'] },
  { name: 'Dhanvantari', role: 'recovery_health', owns: ['health_checks', 'diagnosis', 'repair', 'recovery'] },
  { name: 'Nandi', role: 'reliability', owns: ['tests', 'stress_checks', 'regression_detection', 'release_gates'] },
]);

export const TEAM_PRINCIPLES = Object.freeze([
  'Human understanding precedes routing.',
  'Krishna coordinates; specialists do not become competing orchestrators.',
  'No fabricated facts, actions, permissions, or success claims.',
  'Verification is mandatory for consequential outputs and executed work.',
  'Owner authority remains the final boundary for privileged or irreversible actions.',
  'Failure becomes a repair signal, not a reason to blindly repeat the same attempt.',
  'New capabilities are proposed, tested, verified, then activated within permissions.',
]);

export function getTeamRole(name) {
  return PI_TEAM.find((member) => member.name.toLowerCase() === String(name).toLowerCase()) || null;
}
