import 'reflect-metadata';
import { Client, OpenToolClient, VersionDto, FunctionCall, ToolReturn, OpenTool } from '../../src/index';

async function main(): Promise<void> {
  const client: Client = new OpenToolClient({ 
    apiKey: "bb31b6a6-1fda-4214-8cd6-b1403842070c" 
  });

  try {
    // Check Version
    const versionDto: VersionDto = await client.version();
    console.log(JSON.stringify(versionDto.toJson(), null, 2));

    // Call Tool
    const args = {};
    const functionCall = new FunctionCall("callId-0", "count", args);
    const toolReturn: ToolReturn = await client.call(functionCall);
    console.log(JSON.stringify(toolReturn.toJson(), null, 2));

    // Load OpenTool
    const openTool: OpenTool | null = await client.load();
    console.log(JSON.stringify(openTool?.toJson(), null, 2));
  } catch (error) {
    console.error('Client error:', error);
  }
}

main();