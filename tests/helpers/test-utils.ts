import { OpenTool } from '../../src/models/opentool';
import { Info } from '../../src/models/info';
import { FunctionModel } from '../../src/models/function-model';
import { Parameter } from '../../src/models/parameter';
import { Return } from '../../src/models/return';
import { Schema, SchemaType } from '../../src/models/schema';

export class TestDataFactory {
  static createMockInfo(title: string = 'Test Tool', version: string = '1.0.0', description?: string): Info {
    return new Info(title, version, description || 'A test tool for testing');
  }

  static createMockParameter(): Parameter {
    return new Parameter('test_param', new Schema(SchemaType.STRING), true, 'Test Parameter');
  }

  static createMockReturn(): Return {
    return new Return('Test Return', new Schema(SchemaType.OBJECT));
  }

  static createMockFunctionModel(): FunctionModel {
    const param = this.createMockParameter();
    const returnModel = this.createMockReturn();
    return new FunctionModel('test_function', 'Test Function', [param], returnModel);
  }

  static createMockOpenTool(): OpenTool {
    const info = this.createMockInfo();
    const functions = [this.createMockFunctionModel()];
    const schemas = {
      'test_schema': new Schema(SchemaType.STRING)
    };
    return new OpenTool('1.0.0', info, undefined, functions, schemas);
  }

  // Clean OpenTool creation helpers without undefined parameters
  static createSimpleOpenTool(version: string = '1.0.0', title: string = 'Test Tool', description?: string): OpenTool {
    return new OpenTool(
      version,
      new Info(title, version, description)
    );
  }

  static createOpenToolWithFunctions(
    version: string = '1.0.0', 
    title: string = 'Test Tool', 
    functions: FunctionModel[] = [],
    description?: string
  ): OpenTool {
    return new OpenTool(
      version,
      new Info(title, version, description),
      undefined, // no server
      functions
    );
  }

  static createComplexOpenTool(
    version: string, 
    title: string, 
    functions: FunctionModel[], 
    schemas?: { [key: string]: any },
    description?: string
  ): OpenTool {
    return new OpenTool(
      version,
      new Info(title, version, description || 'A complex tool'),
      undefined, // no server
      functions,
      schemas
    );
  }

  static createMockJsonRpcRequest() {
    return {
      jsonrpc: '2.0.0',
      method: 'test_method',
      params: { test: 'value' },
      id: 'test-id-123'
    };
  }

  static createMockJsonRpcResponse() {
    return {
      jsonrpc: '2.0.0',
      result: { success: true },
      id: 'test-id-123'
    };
  }

  static createMockJsonRpcErrorResponse() {
    return {
      jsonrpc: '2.0.0',
      error: {
        code: -32602,
        message: 'Invalid params'
      },
      id: 'test-id-123'
    };
  }
}

export const mockAxiosResponse = (data: any, status: number = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockAxiosError = (status: number, message: string = 'Error') => {
  const error: any = new Error(message);
  error.response = {
    status,
    data: { message }
  };
  error.isAxiosError = true;
  return error;
};