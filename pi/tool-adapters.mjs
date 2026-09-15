import { createToolContract } from './tool-contract.mjs';

export function createToolRegistry() {
  const tools = new Map();
  return {
    register(name, handler, metadata = {}) {
      const contract = createToolContract({
        name,
        handler,
        capabilities: metadata.capabilities || [],
        inputSchema: metadata.inputSchema || null,
        actionType: metadata.actionType || 'read_only'
      });
      tools.set(name, contract);
      return contract;
    },
    has(name) { return tools.has(name); },
    async execute(name, input = {}) {
      const tool = tools.get(name);
      if (!tool) throw new Error(`tool_unavailable:${name}`);
      return tool.execute(input);
    },
    get(name) { return tools.get(name) || null; },
    list() { return [...tools.entries()].map(([name, tool]) => ({ name, metadata: { capabilities: tool.capabilities, inputSchema: tool.inputSchema, actionType: tool.actionType } })); }
  };
}
