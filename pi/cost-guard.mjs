export function createCostGuard({ maxActions = 25, maxModelCalls = 10 } = {}) {
  if (!Number.isInteger(maxActions) || maxActions < 1) throw new Error('invalid_max_actions');
  if (!Number.isInteger(maxModelCalls) || maxModelCalls < 0) throw new Error('invalid_max_model_calls');
  let actions = 0;
  let modelCalls = 0;
  return {
    action() {
      actions += 1;
      if (actions > maxActions) throw new Error('action_budget_exceeded');
      return { actions, modelCalls };
    },
    model() {
      modelCalls += 1;
      if (modelCalls > maxModelCalls) throw new Error('model_call_budget_exceeded');
      return { actions, modelCalls };
    },
    snapshot() { return { actions, modelCalls, maxActions, maxModelCalls }; }
  };
}
