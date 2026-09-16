const command = document.querySelector('#command');
const mission = document.querySelector('#mission');
const missionTitle = document.querySelector('#missionTitle');
const steps = document.querySelector('#steps');
const confidence = document.querySelector('#confidence');
const run = document.querySelector('#run');
const ownerToken = document.querySelector('#ownerToken');
const systemStatus = document.querySelector('#systemStatus');

const DOMAIN_RULES = [
  { name: 'business', pattern: /business|market|sales|customer|revenue|export|import|price|profit|investment/i, tasks: ['define_business_goal', 'identify_constraints', 'build_decision_matrix'] },
  { name: 'earth', pattern: /earth|satellite|land|crop|agriculture|map|geospatial|location|farm/i, tasks: ['define_area_of_interest', 'identify_data_sources', 'build_evidence_checklist'] },
  { name: 'engineering', pattern: /build|code|deploy|software|app|github|netlify|feature|fix|test/i, tasks: ['inspect_system', 'change_code', 'run_tests', 'verify_change'] },
  { name: 'research', pattern: /research|compare|find|learn|analyze|study|investigate/i, tasks: ['decompose_question', 'collect_available_evidence', 'compare_findings'] }
];

const CONVERSATIONAL_RULES = [
  { name: 'greeting', pattern: /^(hi|hello|hey|good morning|good afternoon|good evening|namaste)\b[!. ]*$/i },
  { name: 'math', pattern: /^(what is|calculate|solve)\s+[-+*/(). 0-9]+\??$/i },
  { name: 'weather', pattern: /\b(weather|forecast|temperature|rain|snow|wind|humidity)\b/i },
  { name: 'time', pattern: /\b(what time|current time|time is it)\b/i },
  { name: 'conversion', pattern: /\b(convert|conversion)\b/i },
  { name: 'explanation', pattern: /^(what is|what are|who is|why is|how does|explain|define)\b/i }
];

const TASK_LABELS = {
  understand_request: ['Understand the request', 'Identify the conversational intent before choosing a workflow.'],
  respond_or_request_required_data: ['Respond or request data', 'Answer directly when possible; request or retrieve verified data when required.'],
  define_business_goal: ['Define the business goal', 'Clarify the outcome, target user and measurable success condition.'],
  identify_constraints: ['Identify constraints', 'Capture budget, timing, location, resources and other limits.'],
  build_decision_matrix: ['Build a decision matrix', 'Structure the options, trade-offs and evidence needed before a decision.'],
  define_area_of_interest: ['Define the area of interest', 'Pin down the exact land, location or geographic scope.'],
  identify_data_sources: ['Identify evidence sources', 'List the maps, satellite data or other sources required.'],
  build_evidence_checklist: ['Build an evidence checklist', 'Define what must be verified before drawing conclusions.'],
  inspect_system: ['Inspect the system', 'Identify the relevant files, components and current behavior.'],
  change_code: ['Implement the change', 'Apply the smallest safe change that satisfies the objective.'],
  run_tests: ['Run tests', 'Exercise the affected behavior and check for regressions.'],
  verify_change: ['Verify the result', 'Separate confirmed behavior from anything not directly tested.'],
  decompose_question: ['Break down the question', 'Turn the objective into answerable sub-questions.'],
  collect_available_evidence: ['Collect available evidence', 'Gather the evidence needed to support each conclusion.'],
  compare_findings: ['Compare findings', 'Identify agreements, conflicts, gaps and remaining uncertainty.'],
  define_objective: ['Define the objective', 'Turn the request into a concrete outcome.'],
  verify_available_evidence: ['Verify available evidence', 'Identify what can and cannot be established from available evidence.']
};

function localIntent(text) {
  return CONVERSATIONAL_RULES.find(rule => rule.pattern.test(text))?.name || null;
}

function localMath(text) {
  const expression = text.replace(/^(what is|calculate|solve)\s+/i, '').replace(/[?=]+$/g, '').trim();
  if (!/^[0-9+*/().\s-]+$/.test(expression) || !/[0-9]/.test(expression)) return null;
  try {
    const value = Function(`"use strict"; return (${expression})`)();
    return Number.isFinite(value) ? `${expression} = ${value}` : null;
  } catch { return null; }
}

function localResponse(text, intent) {
  if (intent === 'greeting') return { title: 'Hello', message: 'Hi — Krishna is ready. Give me a question or objective and I’ll route it to the right path.' };
  if (intent === 'math') return { title: 'Answer', message: localMath(text) || 'I can calculate that, but I need a valid arithmetic expression.' };
  return null;
}

function planLocal(text) {
  const intent = localIntent(text);
  if (intent) return { route: 'conversation', intent, domains: [intent], tasks: ['understand_request', 'respond_or_request_required_data'] };
  const matched = DOMAIN_RULES.filter(rule => rule.pattern.test(text));
  const domains = matched.length ? matched.map(rule => rule.name) : ['general'];
  const tasks = [...new Set(matched.flatMap(rule => rule.tasks))];
  if (!tasks.length) tasks.push('define_objective', 'identify_constraints', 'verify_available_evidence');
  return { route: 'mission', domains, tasks };
}

function showCustomerResponse(text, response, plan, source) {
  missionTitle.textContent = response.title;
  steps.replaceChildren();
  const step = document.createElement('div');
  step.className = 'step';
  const number = document.createElement('i');
  number.textContent = '01';
  const content = document.createElement('div');
  const answer = document.createElement('strong');
  answer.textContent = response.message;
  const meta = document.createElement('small');
  meta.textContent = source;
  content.append(answer, meta);
  step.append(number, content);
  steps.append(step);
  confidence.textContent = source;
  mission.classList.remove('hidden');
  mission.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showMission(text, plan, status, source) {
  missionTitle.textContent = text;
  steps.innerHTML = plan.tasks.map((task, i) => {
    const [label, detail] = TASK_LABELS[task] || [task.replaceAll('_', ' '), 'Planned step.'];
    return `<div class="step"><i>${String(i + 1).padStart(2, '0')}</i><div><strong>${label}</strong><small>${detail}</small></div></div>`;
  }).join('');
  confidence.textContent = `${status} · ${source}`;
  mission.classList.remove('hidden');
  mission.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function runLocalMission(text, note = 'Local zero-cost mode') {
  const plan = planLocal(text);
  const response = plan.route === 'conversation' ? localResponse(text, plan.intent) : null;
  if (response) {
    showCustomerResponse(text, response, plan, 'PI local');
  } else {
    showCustomerResponse(text, { title: 'PI', message: 'PI’s live answer service is temporarily unavailable. Please try again in a moment.' }, plan, 'PI');
  }
  systemStatus.textContent = 'PI ready';
}

function chatApiUrl() {
  const configuredBase = window.PI_CHAT_API_BASE || document.documentElement.dataset.piChatApiBase || 'https://pi-chat.premchandyadlapati.workers.dev';
  const base = configuredBase.replace(/\/$/, '');
  return `${base}/api/chat`;
}

async function runCustomerChat(text) {
  run.disabled = true;
  systemStatus.textContent = 'Krishna thinking…';
  try {
    const response = await fetch(chatApiUrl(), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: text }) });
    const body = await response.json();
    if (!response.ok || !body.answer) throw new Error(body.error || 'chat_unavailable');
    showCustomerResponse(text, { title: 'PI', message: body.answer }, { intent: 'direct-answer' }, 'PI');
    systemStatus.textContent = 'PI ready';
    return true;
  } catch {
    runLocalMission(text);
    return false;
  } finally { run.disabled = false; }
}

async function runCloudMission(text) {
  const token = ownerToken.value.trim();
  if (!token) {
    await runCustomerChat(text);
    return;
  }
  run.disabled = true;
  systemStatus.textContent = 'Krishna running…';
  try {
    const response = await fetch('/api/pi', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ objective: text }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'cloud_request_failed');
    if (body.result?.customerResponse) showCustomerResponse(body.plan.objective, body.result.customerResponse, body.plan, 'Cloud PI');
    else showMission(body.plan.objective, body.plan, 'Cloud plan verified', 'Deterministic PI runtime');
    systemStatus.textContent = 'Cloud runtime ready';
  } catch (error) {
    runLocalMission(text, 'Cloud unavailable — automatic fallback');
  } finally { run.disabled = false; }
}

document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => { command.value = button.dataset.command; command.focus(); }));
run.addEventListener('click', () => { runCloudMission(command.value.trim() || 'Build the next PI capability'); });
