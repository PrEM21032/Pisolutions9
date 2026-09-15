const DOMAIN_RULES = Object.freeze([
  { name: 'business', pattern: /business|market|sales|customer|revenue|export|import|price|profit|investment/i, tasks: ['define_business_goal', 'identify_constraints', 'build_decision_matrix'] },
  { name: 'earth', pattern: /earth|satellite|land|crop|agriculture|map|geospatial|location|farm/i, tasks: ['define_area_of_interest', 'identify_data_sources', 'build_evidence_checklist'] },
  { name: 'engineering', pattern: /build|code|deploy|software|app|github|netlify|feature|fix|test/i, tasks: ['inspect_system', 'change_code', 'run_tests', 'verify_change'] },
  { name: 'research', pattern: /research|compare|find|learn|analyze|study|investigate/i, tasks: ['decompose_question', 'collect_available_evidence', 'compare_findings'] }
]);

export function planNoGpt(objective = '') {
  const text = String(objective).trim();
  if (!text) throw new Error('objective_required');
  const matched = DOMAIN_RULES.filter(rule => rule.pattern.test(text));
  const domains = matched.length ? matched.map(rule => rule.name) : ['general'];
  const tasks = [...new Set(matched.flatMap(rule => rule.tasks))];
  if (!tasks.length) tasks.push('define_objective', 'identify_constraints', 'verify_available_evidence');
  return Object.freeze({ mode: 'no-gpt', objective: text, domains, tasks, planner: 'deterministic-rule-engine' });
}

export function executeNoGptPlan(plan) {
  if (!plan || plan.mode !== 'no-gpt') throw new Error('no_gpt_plan_required');
  return {
    completed: [{ verified: true, task: 'deterministic_plan_generated', order: 1 }],
    planned: plan.tasks.map((task, index) => ({ task, order: index + 1 })),
    evidence: [
      { source: 'pi-no-gpt-engine', claim: 'deterministic plan generated; no external action executed' },
      { source: 'pi-no-gpt-engine', claim: JSON.stringify({ domains: plan.domains, tasks: plan.tasks }) }
    ],
    status: 'completed',
    nextAction: plan.tasks[0] || null,
    uncertainty: ['No-GPT mode generates bounded plans only. It does not claim external execution, test execution, deployment, or factual discovery. External facts and actions require verified tools.']
  };
}
