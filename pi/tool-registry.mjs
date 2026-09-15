export function createToolRegistry() {
  const tools = new Map();
  return {
    register(name, handler, capabilities = []) {
      if (!name || typeof handler !== 'function') throw new Error('invalid_tool');
      tools.set(name, { handler, capabilities: [...capabilities] });
    },
    has(name) { return tools.has(name); },
    list() { return [...tools.entries()].map(([name, tool]) => ({ name, capabilities: tool.capabilities })); },
    async call(name, input = {}) {
      const tool = tools.get(name);
      if (!tool) throw new Error(`tool_not_registered:${name}`);
      return tool.handler(input);
    }
  };
}
