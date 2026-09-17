// PI Team Manifest — capability-general foundation
// Roles are capability boundaries, not claims of personhood or autonomy.
// The team is intentionally modular: Krishna orchestrates; specialists provide bounded capabilities.

export const PI_TEAM = Object.freeze([
  { name: 'Krishna', role: 'orchestrator', owns: ['understand', 'prioritize', 'route', 'compose_missions', 'verify', 'recover', 'continue_or_escalate'] },
  { name: 'Brahma', role: 'creation', owns: ['architectures', 'hypotheses', 'new_capabilities', 'prototypes'] },
  { name: 'Vishnu', role: 'preservation', owns: ['mission_continuity', 'state_integrity', 'stable_operation', 'lifecycle'] },
  { name: 'Shiva', role: 'transformation', owns: ['failure_removal', 'retirement', 'replacement_of_broken_paths', 'simplification'] },
  { name: 'Rama', role: 'governance', owns: ['permissions', 'safety_boundaries', 'owner_authority', 'irreversible_action_gates'] },
  { name: 'Hanuman', role: 'execution', owns: ['tools', 'workflows', 'approved_external_actions', 'bounded_execution'] },
  { name: 'Shakti', role: 'capability_infrastructure', owns: ['models', 'apis', 'compute', 'integrations', 'provider_independence'] },
  { name: 'Saraswati', role: 'knowledge', owns: ['evidence', 'knowledge_quality', 'learning_hygiene', 'uncertainty', 'provenance'] },
  { name: 'Garuda', role: 'perception', owns: ['research', 'external_signals', 'data_collection', 'environment_observation'] },
  { name: 'Dhanvantari', role: 'recovery_health', owns: ['health_checks', 'diagnosis', 'repair', 'recovery', 'degradation_detection'] },
  { name: 'Nandi', role: 'reliability', owns: ['tests', 'stress_checks', 'chaos_checks', 'regression_detection', 'release_gates'] },
  { name: 'Vishwakarma', role: 'universal_engineering', owns: ['requirements', 'systems_engineering', 'simulation', 'design', 'manufacturing_interfaces', 'technical_verification'] },
  { name: 'Kubera', role: 'resources', owns: ['costs', 'budgets', 'capacity', 'resource_planning', 'economic_constraints'] },
  { name: 'Mitra', role: 'human_collaboration', owns: ['expert_matching', 'human_handoffs', 'team_coordination', 'stakeholder_context'] },
  { name: 'Chitragupta', role: 'audit_provenance', owns: ['audit_trails', 'decision_records', 'provenance', 'traceability', 'evidence_history'] },
  { name: 'Durga', role: 'security', owns: ['threat_modeling', 'access_control', 'sandboxing', 'abuse_resistance', 'security_incident_response'] },
]);

export const TEAM_PRINCIPLES = Object.freeze([
  'Human understanding precedes routing.',
  'Krishna coordinates; specialists provide bounded capabilities and do not become competing orchestrators.',
  'PI is objective-centric: discover required capabilities instead of hard-coding an industry-specific agent list.',
  'No fabricated facts, actions, permissions, evidence, or success claims.',
  'Truth state and provenance travel with consequential results.',
  'Verification is independent where practical and mandatory for consequential outputs and executed work.',
  'Owner authority remains the final boundary for privileged or irreversible actions.',
  'Least privilege applies to tools, data, agents, models, and external actions.',
  'Failure becomes a repair signal: diagnose root cause, change strategy, retry within bounds, or escalate.',
  'New capabilities are proposed, sandboxed, adversarially tested, verified, then activated within permissions.',
  'Models and providers are replaceable workers; PI state, policies, contracts, and objectives remain provider-independent.',
  'Every material decision, experiment, failure, fix, and release result should be traceable.',
  'Autonomy may increase only when verification, observability, recovery, and authorization controls support it.',
]);

export function getTeamRole(name) {
  return PI_TEAM.find((member) => member.name.toLowerCase() === String(name).toLowerCase()) || null;
}
