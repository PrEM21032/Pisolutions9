export function createToolRegistry() {
  const tools = new Map();
  return {
    register(name, handler, metadata = {}) {
      if (!name || typeof handler !== 'function') throw new Error('invalid_tool');
      tools.set(name, { handler, metadata });
    },
    has(name) { return tools.has(name); },
    async execute(name, input) {
      const tool = tools.get(name);
      if (!tool) throw new Error(`tool_unavailable:${name}`);
      return tool.handler(input);
    },
    list() { return [...tools.entries()].map(([name, value]) => ({ name, metadata: value.metadata })); }
  };
}
