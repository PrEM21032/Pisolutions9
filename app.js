const command = document.querySelector('#command');
const mission = document.querySelector('#mission');
const missionTitle = document.querySelector('#missionTitle');
const steps = document.querySelector('#steps');
const confidence = document.querySelector('#confidence');
const run = document.querySelector('#run');

const templates = [
  ['Interpret objective','Krishna extracts the goal, constraints, success criteria and likely missing variables.'],
  ['Select intelligence','PI chooses the smallest set of specialist capabilities needed for the mission.'],
  ['Execute in parallel','Research, engineering, business, data and Earth Intelligence work only where relevant.'],
  ['Verify independently','A verification layer looks for unsupported claims, contradictions and failure modes.'],
  ['Return the outcome','PI reports what is known, what is uncertain, what was completed and what comes next.']
];

document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => { command.value = button.dataset.command; command.focus(); });
});

run.addEventListener('click', () => {
  const text = command.value.trim() || 'Build the next PI capability';
  missionTitle.textContent = text;
  steps.innerHTML = templates.map((item, i) => `<div class="step"><i>0${i+1}</i><div><strong>${item[0]}</strong><small>${item[1]}</small></div></div>`).join('');
  confidence.textContent = 'Execution plan · verification required';
  mission.classList.remove('hidden');
  mission.scrollIntoView({behavior:'smooth',block:'center'});
});
