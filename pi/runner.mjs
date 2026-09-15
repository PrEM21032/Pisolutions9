const enabled = process.env.PI_AUTONOMOUS_ENABLED === 'true';

const now = new Date().toISOString();
const state = {
  timestamp: now,
  status: enabled ? 'ready' : 'paused',
  mode: 'safe-autonomous-cycle',
  truth: 'verified',
  message: enabled
    ? 'PI cycle trigger reached the execution runtime.'
    : 'PI runtime is installed but execution is disabled until explicitly enabled.'
};

console.log(JSON.stringify(state, null, 2));
