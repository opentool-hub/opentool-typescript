import { Request, Response } from 'express';
import { Controller } from '../../src/server/controller';
import { Tool } from '../../src/tool/tool';
import { OpenTool } from '../../src/models/opentool';
import { Info } from '../../src/models/info';
import { FunctionModel } from '../../src/models/function-model';
import { JsonParserException } from '../../src/tool/exception';

// Mock Tool class
class MockTool extends Tool {
  private mockResponses: { [method: string]: any } = {};
  private mockLoadResponse: OpenTool | null = null;
  private shouldThrowError = false;
  private errorToThrow: Error | null = null;

  setMockResponse(method: string, response: any) {
    this.mockResponses[method] = response;
  }

  setLoadResponse(response: OpenTool | null) {
    this.mockLoadResponse = response;
  }

  setError(error: Error) {
    this.shouldThrowError = true;
    this.errorToThrow = error;
  }

  clearError() {
    this.shouldThrowError = false;
    this.errorToThrow = null;
  }

  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }

    if (name in this.mockResponses) {
      return this.mockResponses[name];
    }

    return { method: name, params: args };
  }

  async load(): Promise<OpenTool | null> {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }

    return this.mockLoadResponse;
  }
}

// Mock Express Request and Response
const createMockRequest = (body?: any, headers?: any): Partial<Request> => ({
  body: body || {},
  headers: headers || {},
});

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    statusCode: 200,
    data: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
      res.data = data;
      return res;
    }),
    send: jest.fn().mockImplementation((data) => {
      res.data = data;
      return res;
    }),
  };
  return res;
};

describe('Controller', () => {
  let controller: Controller;
  let mockTool: MockTool;

  beforeEach(() => {
    mockTool = new MockTool();
    controller = new Controller(mockTool, '1.0.0');
  });

  describe('constructor', () => {
    it('should create controller with tool and version', () => {
      expect(controller).toBeInstanceOf(Controller);
    });

    it('should handle empty version string', () => {
      const emptyVersionController = new Controller(mockTool, '');
      expect(emptyVersionController).toBeInstanceOf(Controller);
    });
  });

  describe('getVersion', () => {
    it('should return version successfully', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await controller.getVersion(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({ version: '1.0.0' });
    });

    it('should return different version strings', async () => {
      const versions = ['2.0.0', '1.5.0-beta', '', '3.0.0-rc.1'];

      for (const version of versions) {
        const versionController = new Controller(mockTool, version);
        const req = createMockRequest();
        const res = createMockResponse();

        await versionController.getVersion(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith({ version });
      }
    });

    it('should handle request with any parameters', async () => {
      const req = createMockRequest({ unused: 'data' }, { 'user-agent': 'test' });
      const res = createMockResponse();

      await controller.getVersion(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({ version: '1.0.0' });
    });
  });

  describe('call', () => {
    it('should handle successful tool call', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'test_function',
        params: { input: 'test' },
        id: 'call-123'
      };

      mockTool.setMockResponse('test_function', { output: 'success' });

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: { output: 'success' },
        id: 'call-123'
      });
    });

    it('should handle tool call without parameters', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'no_params_function',
        id: 'call-456'
      };

      mockTool.setMockResponse('no_params_function', { count: 42 });

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: { count: 42 },
        id: 'call-456'
      });
    });

    it('should handle tool call with complex parameters', async () => {
      const complexParams = {
        user: { name: 'John', age: 30 },
        options: { sort: true, limit: 10 },
        metadata: null
      };

      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'complex_function',
        params: complexParams,
        id: 'call-complex'
      };

      mockTool.setMockResponse('complex_function', { processed: true });

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: { processed: true },
        id: 'call-complex'
      });
    });

    it('should handle tool error with Error object', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'failing_function',
        params: { test: 'data' },
        id: 'call-error'
      };

      mockTool.setError(new Error('Function execution failed'));

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 500,
          message: 'Error: Function execution failed'
        },
        id: 'call-error'
      });
    });

    it('should handle tool error with string error', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'failing_function',
        id: 'call-string-error'
      };

      // Mock a non-Error object being thrown
      mockTool.call = jest.fn().mockRejectedValue('String error message');

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 500,
          message: 'String error message'
        },
        id: 'call-string-error'
      });
    });

    it('should handle invalid request body', async () => {
      const invalidRequestBody = {
        // Missing required fields
        invalid: 'data'
      };

      const req = createMockRequest(invalidRequestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 400,
          message: 'Invalid request body'
        },
        id: ''
      });
    });

    it('should handle malformed JSON request', async () => {
      const req = createMockRequest(null); // null body

      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 400,
          message: 'Invalid request body'
        },
        id: ''
      });
    });

    it('should preserve request ID in error responses', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'test_function',
        id: 'preserve-id-test'
      };

      mockTool.setError(new Error('Test error'));

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'preserve-id-test'
        })
      );
    });

    it('should handle different result types', async () => {
      const testCases = [
        { method: 'string_result', result: 'text result', id: 'string-test' },
        { method: 'number_result', result: 42, id: 'number-test' },
        { method: 'boolean_result', result: true, id: 'boolean-test' },
        { method: 'array_result', result: [1, 2, 3], id: 'array-test' },
        { method: 'null_result', result: null, id: 'null-test' },
        { method: 'empty_object', result: {}, id: 'empty-test' }
      ];

      for (const testCase of testCases) {
        mockTool.setMockResponse(testCase.method, testCase.result);

        const requestBody = {
          jsonrpc: '2.0.0',
          method: testCase.method,
          id: testCase.id
        };

        const req = createMockRequest(requestBody);
        const res = createMockResponse();

        await controller.call(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith({
          jsonrpc: '2.0.0',
          result: testCase.result,
          id: testCase.id
        });
      }
    });
  });

  describe('load', () => {
    it('should load OpenTool successfully', async () => {
      const mockOpenTool = new OpenTool(
        '1.0.0',
        new Info('Test Tool', '1.0.0'),
        undefined,
        [new FunctionModel('test_func', 'Test function', [])]
      );

      mockTool.setLoadResponse(mockOpenTool);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'test_func',
            description: 'Test function',
            parameters: []
          }
        ]
      });
    });

    it('should handle null OpenTool response', async () => {
      mockTool.setLoadResponse(null);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      const expectedError = new JsonParserException().toJson();
      expect(res.json).toHaveBeenCalledWith(expectedError);
    });

    it('should handle tool load error with Error object', async () => {
      mockTool.setError(new Error('Failed to load tool configuration'));

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error: Failed to load tool configuration');
    });

    it('should handle tool load error with string error', async () => {
      mockTool.load = jest.fn().mockRejectedValue('Configuration file not found');

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Configuration file not found');
    });

    it('should load complex OpenTool with schemas', async () => {
      const complexOpenTool = new OpenTool(
        '2.0.0',
        new Info('Complex Tool', '2.0.0', 'A complex tool'),
        undefined,
        [new FunctionModel('complex_func', 'Complex function', [])],
        { 'User': { type: 'object' } as any }
      );

      mockTool.setLoadResponse(complexOpenTool);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          opentool: '2.0.0',
          info: expect.objectContaining({
            title: 'Complex Tool'
          }),
          schemas: expect.objectContaining({
            'User': { type: 'object' }
          })
        })
      );
    });

    it('should handle empty OpenTool', async () => {
      const emptyOpenTool = new OpenTool(
        '1.0.0',
        new Info('Empty Tool', '1.0.0')
      );

      mockTool.setLoadResponse(emptyOpenTool);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          functions: []
        })
      );
    });

    it('should handle request with any parameters', async () => {
      const mockOpenTool = new OpenTool(
        '1.0.0',
        new Info('Test Tool', '1.0.0')
      );

      mockTool.setLoadResponse(mockOpenTool);

      const req = createMockRequest({ unused: 'data' }, { 'accept': 'application/json' });
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          opentool: '1.0.0'
        })
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined error in tool call', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'undefined_error_function',
        id: 'undefined-error'
      };

      mockTool.call = jest.fn().mockRejectedValue(undefined);

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 500,
          message: 'undefined'
        },
        id: 'undefined-error'
      });
    });

    it('should handle object error in tool call', async () => {
      const requestBody = {
        jsonrpc: '2.0.0',
        method: 'object_error_function',
        id: 'object-error'
      };

      const objectError = { message: 'Custom error object', code: 123 };
      mockTool.call = jest.fn().mockRejectedValue(objectError);

      const req = createMockRequest(requestBody);
      const res = createMockResponse();

      await controller.call(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: 500,
          message: '[object Object]'
        },
        id: 'object-error'
      });
    });

    it('should handle undefined error in tool load', async () => {
      mockTool.load = jest.fn().mockRejectedValue(undefined);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('undefined');
    });

    it('should handle number error in tool load', async () => {
      mockTool.load = jest.fn().mockRejectedValue(404);

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.load(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('404');
    });
  });
});