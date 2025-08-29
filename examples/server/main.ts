import 'reflect-metadata';
import { Tool, Server, OpenToolServer } from '../../src/index';
import { MockTool } from './mock-tool';

async function main(): Promise<void> {
  const tool: Tool = new MockTool();
  const server: Server = new OpenToolServer(tool, "0.0.1", {
    apiKeys: ["6621c8a3-2110-4e6a-9d62-70ccd467e789", "bb31b6a6-1fda-4214-8cd6-b1403842070c"]
  });
  
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});