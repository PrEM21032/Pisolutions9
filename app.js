const command = document.querySelector('#command');
const mission = document.querySelector('#mission');
const missionTitle = document.querySelector('#missionTitle');
const steps = document.querySelector('#steps');
const confidence = document.querySelector('#confidence');
const run = document.querySelector('#run');

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

function renderLocalMission(text) {
  const assigned = routeObjective(text);
  missionTitle.textContent = text;
  steps.innerHTML = templates.map((item, i) => `<div class="step"><i>0${i + 1}</i><div><strong>${item[0]}</strong><small>${item[1]}</small></div></div>`).join('');
  confidence.textContent = `Local orchestration · ${assigned.join(' · ')} · not yet executed`;
  mission.classList.remove('hidden');
  mission.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => { command.value = button.dataset.command; command.focus(); });
});

run.addEventListener('click', () => {
  const text = command.value.trim() || 'Build the next PI capability';
  renderLocalMission(text);
});
