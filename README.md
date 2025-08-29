# OpenTool TypeScript SDK

English | [中文](README-zh_CN.md)

A TypeScript client and server SDK for OpenTool with JSON Spec Parser.

## Quick Start

### Installation

```bash
npm install opentool-ts
```

### Run Examples

1. Start OpenTool server: `npm run dev:server`
2. Start OpenTool client: `npm run dev:client`

## Development

### Environment Setup

```bash
npm install
npm run build
```

### Script Commands

- `npm run build` - Build TypeScript project
- `npm run dev:server` - Run example server
- `npm run dev:client` - Run example client
- `npm run test` - Run tests
- `npm run clean` - Clean build artifacts

## Usage

### Server Example

```typescript
import 'reflect-metadata';
import { Tool, Server, OpenToolServer } from 'opentool-ts';
import { MockTool } from './mock-tool';

const tool: Tool = new MockTool();
const server: Server = new OpenToolServer(tool, "0.0.1", {
  apiKeys: ["your-api-key"]
});

await server.start();
```

### Client Example

```typescript
import 'reflect-metadata';
import { 
  Client, 
  OpenToolClient, 
  FunctionCall, 
  ToolReturn, 
  VersionDto,
  OpenTool 
} from 'opentool-ts';

const client: Client = new OpenToolClient({ 
  apiKey: "your-api-key" 
});

try {
  // Check version
  const version: VersionDto = await client.version();
  console.log(version.toJson());

  // Call function
  const functionCall = new FunctionCall("callId-0", "count", {});
  const result: ToolReturn = await client.call(functionCall);
  console.log(result.toJson());

  // Load OpenTool specification
  const openTool: OpenTool | null = await client.load();
  console.log(openTool?.toJson());
} catch (error) {
  console.error('Client error:', error);
}
```

## Configuration

- Default port: `9627`
- Both client and server support custom ports
- Tools must implement `call` method, optionally implement `load` method
- Recommended to use OpenTool specification JSON format to describe tools

## API Reference

### Core Models

- `OpenTool`: Main OpenTool specification model
- `FunctionModel`: Function definition model
- `Parameter`: Function parameter model
- `Return`: Return value model
- `Schema`: JSON schema model with type validation
- `Info`: Tool information model

### Client and Server

- `OpenToolClient`: HTTP client for OpenTool server
- `OpenToolServer`: HTTP server implementation
- `Controller`: Server request controller
- `Tool`: Abstract tool interface

### LLM Integration

- `FunctionCall`: Function call request model
- `ToolReturn`: Tool execution result model

### Utilities

- `OpenToolJsonLoader`: Load OpenTool specification from JSON
- `uniqueId()`: Generate unique ID for requests

### Exception Classes

- `FunctionNotSupportedException`: Unsupported function
- `ToolBreakException`: Tool execution error
- `JsonParserException`: JSON parsing error
- `ResponseNullException`: Null response error
- `ErrorNullException`: Null error response
- `OpenToolServerUnauthorizedException`: Authentication failed
- `OpenToolServerNoAccessException`: Access denied

### Data Transfer Objects

- `VersionDto`: Version information
- `JsonRPCHttpRequestBody`: JSON-RPC request format
- `JsonRPCHttpResponseBody`: JSON-RPC response format

## System Requirements

- Node.js >= 16.0.0
- TypeScript 5.0+

## Testing

- Test coverage: **96.17%** overall statement coverage
- 495 tests passing across 20 test suites
- Run tests with: `npm run test`

## Dependencies

- `axios`: HTTP client
- `express`: Web server framework
- `uuid`, `nanoid`: ID generation
- `class-transformer`, `class-validator`: Object validation
- `reflect-metadata`: Metadata reflection support