// PI Team Manifest — capability-general foundation
// Roles are capability boundaries, not claims of personhood or autonomy.
// The team is intentionally modular: Krishna orchestrates; specialists provide bounded capabilities.

export const PI_TEAM = Object.freeze([
  { name: 'Krishna', role: 'orchestrator', owns: ['understand', 'prioritize', 'route', 'compose_missions', 'verify', 'recover', 'continue_or_escalate'] },
  { name: 'Brahma', role: 'creation', owns: ['architectures', 'hypotheses', 'new_capabilities', 'prototypes'] },
  { name: 'Vishnu', role: 'preservation', owns: ['mission_continuity', 'state_integrity', 'stable_operation', 'lifecycle'] },
  { name: 'Shiva', role: 'transformation', owns: ['failure_removal', 'retirement', 'replacement_of_broken_paths', 'simplification', 'adversarial_challenges'] },
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

// Departments turn the 16 capability owners into coordinated teams.
// Krishna remains the cross-department orchestrator; no specialist becomes a competing orchestrator.
export const PI_DEPARTMENTS = Object.freeze([
  { name: 'Command & Integration', lead: 'Krishna', members: ['Krishna'], owns: ['objective_understanding', 'mission_composition', 'cross_team_coordination', 'final_integration'] },
  { name: 'Intelligence & Research', lead: 'Saraswati', members: ['Saraswati', 'Garuda'], owns: ['research', 'evidence', 'knowledge', 'data', 'uncertainty'] },
  { name: 'Architecture & Creation', lead: 'Brahma', members: ['Brahma', 'Vishwakarma'], owns: ['requirements', 'architecture', 'design', 'prototypes', 'new_capabilities'] },
  { name: 'Engineering & Execution', lead: 'Hanuman', members: ['Hanuman', 'Shakti'], owns: ['software', 'tools', 'models', 'infrastructure', 'bounded_execution'] },
  { name: 'Red Team & Reliability', lead: 'Shiva', members: ['Shiva', 'Nandi'], owns: ['adversarial_testing', 'chaos_testing', 'regression', 'release_quality'] },
  { name: 'Recovery & Continuity', lead: 'Dhanvantari', members: ['Dhanvantari', 'Vishnu'], owns: ['diagnosis', 'repair', 'recovery', 'state', 'runtime_continuity'] },
  { name: 'Governance, Security & Trust', lead: 'Rama', members: ['Rama', 'Durga', 'Chitragupta'], owns: ['authorization', 'security', 'privacy', 'audit', 'traceability', 'safety'] },
  { name: 'Human Expertise & Resources', lead: 'Mitra', members: ['Mitra', 'Kubera'], owns: ['domain_experts', 'human_handoffs', 'capacity', 'cost', 'resources'] },
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
  'Every department owns prevention as well as repair; no team may treat cross-team failures as someone else’s problem.',
  'Build, break, and prove are required for material changes.',
]);

export function getTeamRole(name) {
  return PI_TEAM.find((member) => member.name.toLowerCase() === String(name).toLowerCase()) || null;
}

export function getDepartment(name) {
  return PI_DEPARTMENTS.find((department) => department.name.toLowerCase() === String(name).toLowerCase()) || null;
}
