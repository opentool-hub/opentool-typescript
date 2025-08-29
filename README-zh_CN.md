# OpenTool TypeScript SDK

[English](README.md) | 中文

OpenTool 的 TypeScript 客户端和服务端 SDK，提供 JSON 规范解析器。

## 快速开始

### 安装

```bash
npm install opentool-ts
```

### 运行示例

1. 启动 OpenTool 服务端：`npm run dev:server`
2. 启动 OpenTool 客户端：`npm run dev:client`

## 开发

### 环境配置

```bash
npm install
npm run build
```

### 脚本命令

- `npm run build` - 构建 TypeScript 项目
- `npm run dev:server` - 运行示例服务端
- `npm run dev:client` - 运行示例客户端
- `npm run test` - 运行测试
- `npm run clean` - 清理构建产物

## 使用方法

### 服务端示例

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

### 客户端示例

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
  // 检查版本
  const version: VersionDto = await client.version();
  console.log(version.toJson());

  // 调用函数
  const functionCall = new FunctionCall("callId-0", "count", {});
  const result: ToolReturn = await client.call(functionCall);
  console.log(result.toJson());

  // 加载 OpenTool 规范
  const openTool: OpenTool | null = await client.load();
  console.log(openTool?.toJson());
} catch (error) {
  console.error('客户端错误:', error);
}
```

## 配置说明

- 默认端口：`9627`
- 客户端和服务端都支持自定义端口
- 工具需要实现 `call` 方法，可选实现 `load` 方法
- 建议使用 OpenTool 规范的 JSON 格式描述工具

## API 参考

### 核心模型

- `OpenTool`：主要的 OpenTool 规范模型
- `FunctionModel`：函数定义模型
- `Parameter`：函数参数模型
- `Return`：返回值模型
- `Schema`：具有类型验证的 JSON 模式模型
- `Info`：工具信息模型

### 客户端和服务端

- `OpenToolClient`：OpenTool 服务器的 HTTP 客户端
- `OpenToolServer`：HTTP 服务器实现
- `Controller`：服务器请求控制器
- `Tool`：抽象工具接口

### LLM 集成

- `FunctionCall`：函数调用请求模型
- `ToolReturn`：工具执行结果模型

### 工具类

- `OpenToolJsonLoader`：从 JSON 加载 OpenTool 规范
- `uniqueId()`：为请求生成唯一 ID

### 异常类

- `FunctionNotSupportedException`：不支持的函数
- `ToolBreakException`：工具执行错误
- `JsonParserException`：JSON 解析错误
- `ResponseNullException`：空响应错误
- `ErrorNullException`：空错误响应
- `OpenToolServerUnauthorizedException`：认证失败
- `OpenToolServerNoAccessException`：访问被拒绝

### 数据传输对象

- `VersionDto`：版本信息
- `JsonRPCHttpRequestBody`：JSON-RPC 请求格式
- `JsonRPCHttpResponseBody`：JSON-RPC 响应格式

## 系统要求

- Node.js >= 16.0.0
- TypeScript 5.0+

## 测试

- 测试覆盖率：**96.17%** 整体语句覆盖率
- 495 个测试通过，共 20 个测试套件
- 运行测试：`npm run test`

## 依赖包

- `axios`：HTTP 客户端
- `express`：Web 服务器框架
- `uuid`, `nanoid`：ID 生成
- `class-transformer`, `class-validator`：对象验证
- `reflect-metadata`：元数据反射支持