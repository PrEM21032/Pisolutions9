const command = document.querySelector('#command');
const mission = document.querySelector('#mission');
const missionTitle = document.querySelector('#missionTitle');
const steps = document.querySelector('#steps');
const confidence = document.querySelector('#confidence');
const run = document.querySelector('#run');
const ownerToken = document.querySelector('#ownerToken');
const systemStatus = document.querySelector('#systemStatus');

const templates = [
  ['Interpret objective', 'Krishna extracts the goal, constraints, success criteria and missing variables.'],
  ['Select intelligence', 'PI routes only the specialist capabilities relevant to the objective.'],
  ['Execute', 'PI performs available actions and records evidence; planning is never presented as execution.'],
  ['Verify independently', 'The verifier checks evidence, contradictions, assumptions and failure modes.'],
  ['Return the outcome', 'PI separates completed work from recommendations, uncertainty and blocked actions.']
];

const specialists = {
  business: ['Business Strategy', 'Research', 'Data & Finance'],
  earth: ['Earth Intelligence', 'Research', 'Data'],
  build: ['Engineering', 'Security & Reliability', 'Verification'],
  default: ['Research', 'Data', 'Verification']
};

function routeObjective(text) {
  const t = text.toLowerCase();
  if (/satellite|land|farm|crop|geospatial|map|earth/.test(t)) return specialists.earth;
  if (/build|code|app|website|deploy|software|feature/.test(t)) return specialists.build;
  if (/business|market|company|product|import|export|money|investment/.test(t)) return specialists.business;
  return specialists.default;
}

function renderLocalMission(text, note = 'Local orchestration · not yet executed') {
  const assigned = routeObjective(text);
  missionTitle.textContent = text;
  steps.innerHTML = templates.map((item, i) => `<div class="step"><i>0${i + 1}</i><div><strong>${item[0]}</strong><small>${item[1]}</small></div></div>`).join('');
  confidence.textContent = `${note} · ${assigned.join(' · ')}`;
  mission.classList.remove('hidden');
  mission.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function runCloudMission(text) {
  const token = ownerToken.value.trim();
  if (!token) {
    renderLocalMission(text, 'Owner token required · plan preview only');
    systemStatus.textContent = 'Owner token required';
    return;
  }

  run.disabled = true;
  systemStatus.textContent = 'Krishna running…';
  try {
    const response = await fetch('/api/pi', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ objective: text })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'cloud_request_failed');

    missionTitle.textContent = body.plan.objective;
    steps.innerHTML = body.plan.tasks.map((task, i) => `<div class="step"><i>0${i + 1}</i><div><strong>${task}</strong><small>Planned by deterministic PI · external execution not claimed</small></div></div>`).join('');
    confidence.textContent = `Cloud plan verified · ${body.plan.domains.join(' · ')}`;
    mission.classList.remove('hidden');
    systemStatus.textContent = 'Cloud runtime ready';
    mission.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    renderLocalMission(text, `Cloud runtime blocked · ${error.message}`);
    systemStatus.textContent = 'Cloud runtime blocked';
  } finally {
    run.disabled = false;
  }
}

document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => { command.value = button.dataset.command; command.focus(); });
});

run.addEventListener('click', () => {
  const text = command.value.trim() || 'Build the next PI capability';
  runCloudMission(text);
});
