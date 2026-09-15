const PROTECTED_ACTIONS = new Set([
  'financial_transfer',
  'legal_commitment',
  'secret_rotation',
  'production_destructive_change',
  'irreversible_external_action'
]);

function clean(value) {
  return String(value ?? '').trim();
}

function now() {
  return new Date().toISOString();
}

export function createPersonalAIV2({ ownerId = 'owner', maxMemory = 500 } = {}) {
  const memories = [];
  const preferences = new Map();
  const goals = new Map();
  const tasks = new Map();
  const team = new Map();
  const opportunities = [];
  const skills = new Set();
  const graph = new Map();
  const audit = [];

  function remember(input = {}) {
    const content = clean(input.content);
    if (!content) throw new Error('memory_content_required');
    const item = Object.freeze({
      id: `mem_${memories.length + 1}`,
      ownerId,
      content,
      tags: Array.isArray(input.tags) ? input.tags.map(clean).filter(Boolean) : [],
      createdAt: now()
    });
    memories.push(item);
    while (memories.length > maxMemory) memories.shift();
    return item;
  }

  function recall(query = '', limit = 5) {
    const q = clean(query).toLowerCase();
    if (!q) return [];
    return memories
      .map(item => ({ item, score: item.content.toLowerCase().includes(q) ? 2 : item.tags.some(t => t.toLowerCase().includes(q)) ? 1 : 0 }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, limit))
      .map(x => x.item);
  }

  function setPreference(key, value) {
    const k = clean(key);
    if (!k) throw new Error('preference_key_required');
    preferences.set(k, value);
    return { key: k, value, updatedAt: now() };
  }

  function getPreferences() {
    return Object.fromEntries(preferences);
  }

  function createGoal(input = {}) {
    const title = clean(input.title);
    if (!title) throw new Error('goal_title_required');
    const goal = { id: `goal_${goals.size + 1}`, title, horizon: clean(input.horizon) || 'long', status: 'active', milestones: [], createdAt: now() };
    goals.set(goal.id, goal);
    return goal;
  }

  function addMilestone(goalId, title) {
    const goal = goals.get(clean(goalId));
    if (!goal) throw new Error('goal_not_found');
    const milestone = { id: `milestone_${goal.milestones.length + 1}`, title: clean(title), status: 'pending' };
    goal.milestones.push(milestone);
    return milestone;
  }

  function createTask(input = {}) {
    const title = clean(input.title);
    if (!title) throw new Error('task_title_required');
    const task = { id: `task_${tasks.size + 1}`, title, goalId: clean(input.goalId) || null, status: 'ready', createdAt: now() };
    tasks.set(task.id, task);
    return task;
  }

  function assignAgent(input = {}) {
    const id = clean(input.id || `agent_${team.size + 1}`);
    const role = clean(input.role);
    if (!role) throw new Error('agent_role_required');
    const agent = { id, role, capabilities: Array.isArray(input.capabilities) ? input.capabilities.map(clean).filter(Boolean) : [], status: 'available' };
    team.set(id, agent);
    return agent;
  }

  function addOpportunity(input = {}) {
    const title = clean(input.title);
    if (!title) throw new Error('opportunity_title_required');
    const item = { id: `opp_${opportunities.length + 1}`, title, evidence: Array.isArray(input.evidence) ? input.evidence : [], status: 'detected', detectedAt: now() };
    opportunities.push(item);
    return item;
  }

  function learnSkill(name) {
    const skill = clean(name);
    if (!skill) throw new Error('skill_name_required');
    skills.add(skill);
    return { skill, learned: true };
  }

  function link(a, relation, b) {
    const from = clean(a), edge = clean(relation), to = clean(b);
    if (!from || !edge || !to) throw new Error('graph_link_required');
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push({ relation: edge, to });
    return { from, relation: edge, to };
  }

  function authorize(action = {}) {
    const type = clean(action.type);
    const allowed = !PROTECTED_ACTIONS.has(type);
    const result = { action: type, allowed, nextAction: allowed ? 'execute_or_verify' : 'owner_required', truth: 'verified' };
    audit.push({ ...result, at: now() });
    return result;
  }

  function snapshot() {
    return {
      phaseRange: '47-57',
      ownerId,
      memoryCount: memories.length,
      preferenceCount: preferences.size,
      goalCount: goals.size,
      taskCount: tasks.size,
      agentCount: team.size,
      opportunityCount: opportunities.length,
      skillCount: skills.size,
      graphNodeCount: graph.size,
      protectedActionGate: true,
      auditEvents: audit.length
    };
  }

  return Object.freeze({
    remember, recall, setPreference, getPreferences, createGoal, addMilestone,
    createTask, assignAgent, addOpportunity, learnSkill, link, authorize, snapshot
  });
}
