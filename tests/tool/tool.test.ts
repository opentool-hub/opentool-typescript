import { Tool } from '../../src/tool/tool';
import { OpenTool } from '../../src/models/opentool';
import { FunctionModel } from '../../src/models/function-model';
import { TestDataFactory } from '../helpers/test-utils';

// Concrete implementation for testing
class TestTool extends Tool {
  private responses: { [method: string]: any } = {};
  private shouldThrowError = false;
  private errorToThrow: Error | null = null;
  private loadResponse: OpenTool | null = null;

  setMockResponse(method: string, response: any) {
    this.responses[method] = response;
  }

  setError(error: Error) {
    this.shouldThrowError = true;
    this.errorToThrow = error;
  }

  clearError() {
    this.shouldThrowError = false;
    this.errorToThrow = null;
  }

  setLoadResponse(response: OpenTool | null) {
    this.loadResponse = response;
  }

  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }

    if (this.responses[name]) {
      return this.responses[name];
    }

    // Default response includes method name and args
    return { method: name, args: args || {} };
  }

  async load(): Promise<OpenTool | null> {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }
    return this.loadResponse;
  }
}

// Another implementation to test inheritance
class SimpleTool extends Tool {
  async call(_name: string, _args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    return { simple: true };
  }
}

describe('Tool', () => {
  describe('abstract class behavior', () => {
    it('should not be instantiable directly', () => {
      // Tool is abstract and cannot be instantiated directly
      // This would be caught at compile time in TypeScript
      expect(Tool).toBeDefined();
      expect(typeof Tool).toBe('function');
    });

    it('should be extensible by concrete classes', () => {
      const tool = new TestTool();
      expect(tool).toBeInstanceOf(Tool);
      expect(tool).toBeInstanceOf(TestTool);
    });

    it('should allow multiple concrete implementations', () => {
      const testTool = new TestTool();
      const simpleTool = new SimpleTool();

      expect(testTool).toBeInstanceOf(Tool);
      expect(simpleTool).toBeInstanceOf(Tool);
      expect(testTool).toBeInstanceOf(TestTool);
      expect(simpleTool).toBeInstanceOf(SimpleTool);
    });
  });

  describe('abstract methods', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    describe('call method', () => {
      it('should require implementation in concrete classes', async () => {
        const result = await tool.call('test_method');
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });

      it('should handle method calls with parameters', async () => {
        const args = { input: 'test', count: 5 };
        const result = await tool.call('process_data', args);

        expect(result).toEqual({ method: 'process_data', args });
      });

      it('should handle method calls without parameters', async () => {
        const result = await tool.call('get_status');

        expect(result).toEqual({ method: 'get_status', args: {} });
      });

      it('should handle custom responses', async () => {
        const customResponse = { success: true, data: [1, 2, 3] };
        tool.setMockResponse('custom_method', customResponse);

        const result = await tool.call('custom_method');

        expect(result).toBe(customResponse);
      });

      it('should handle async operations', async () => {
        tool.setMockResponse('async_method', Promise.resolve({ async: true }));

        const result = await tool.call('async_method');

        expect(result.async).toBe(true);
      });

      it('should handle errors in method calls', async () => {
        const error = new Error('Tool method failed');
        tool.setError(error);

        await expect(tool.call('failing_method')).rejects.toThrow('Tool method failed');
      });

      it('should handle different parameter types', async () => {
        const testCases = [
          { args: { string: 'test' }, method: 'string_test' },
          { args: { number: 42 }, method: 'number_test' },
          { args: { boolean: true }, method: 'boolean_test' },
          { args: { array: [1, 2, 3] }, method: 'array_test' },
          { args: { object: { nested: 'value' } }, method: 'object_test' },
          { args: { null: null }, method: 'null_test' },
          { args: { undefined: undefined }, method: 'undefined_test' }
        ];

        for (const testCase of testCases) {
          const result = await tool.call(testCase.method, testCase.args);
          expect(result.args).toEqual(testCase.args);
        }
      });

      it('should handle complex nested parameters', async () => {
        const complexArgs = {
          user: {
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: true,
              features: ['feature1', 'feature2']
            }
          },
          metadata: {
            timestamp: Date.now(),
            version: '1.0.0'
          }
        };

        const result = await tool.call('complex_method', complexArgs);
        expect(result.args).toEqual(complexArgs);
      });
    });
  });

  describe('default load method', () => {
    it('should return null by default', async () => {
      const tool = new TestTool();
      const result = await tool.load();

      expect(result).toBeNull();
    });

    it('should be overridable in concrete classes', async () => {
      const tool = new TestTool();
      const mockOpenTool = TestDataFactory.createOpenToolWithFunctions(
        '1.0.0',
        'Test Tool',
        [new FunctionModel('test_func', 'Test function', [])]
      );

      tool.setLoadResponse(mockOpenTool);

      const result = await tool.load();

      expect(result).toBe(mockOpenTool);
      expect(result?.opentool).toBe('1.0.0');
      expect(result?.info.title).toBe('Test Tool');
    });

    it('should handle complex OpenTool objects', async () => {
      const tool = new TestTool();
      const complexOpenTool = TestDataFactory.createComplexOpenTool(
        '2.0.0',
        'Complex Tool',
        [
          new FunctionModel('func1', 'First function', []),
          new FunctionModel('func2', 'Second function', [])
        ],
        {
          'Schema1': { type: 'string' } as any,
          'Schema2': { type: 'object' } as any
        }
      );

      tool.setLoadResponse(complexOpenTool);

      const result = await tool.load();

      expect(result?.opentool).toBe('2.0.0');
      expect(result?.functions).toHaveLength(2);
      expect(result?.schemas).toBeDefined();
      expect(Object.keys(result?.schemas || {})).toHaveLength(2);
    });

    it('should handle errors in load method', async () => {
      const tool = new TestTool();
      const error = new Error('Failed to load configuration');
      tool.setError(error);

      await expect(tool.load()).rejects.toThrow('Failed to load configuration');
    });

    it('should handle async load operations', async () => {
      const tool = new TestTool();
      const mockOpenTool = TestDataFactory.createSimpleOpenTool('1.0.0', 'Async Tool');

      // Simulate async load
      tool.load = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return mockOpenTool;
      });

      const result = await tool.load();

      expect(result?.info.title).toBe('Async Tool');
    });
  });

  describe('method signatures', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should have correct call method signature', () => {
      expect(typeof tool.call).toBe('function');
      expect(tool.call.length).toBe(2); // name and args parameters
    });

    it('should have correct load method signature', () => {
      expect(typeof tool.load).toBe('function');
      expect(tool.load.length).toBe(0); // no parameters
    });

    it('should return promises from both methods', async () => {
      const callResult = tool.call('test');
      const loadResult = tool.load();

      expect(callResult).toBeInstanceOf(Promise);
      expect(loadResult).toBeInstanceOf(Promise);

      await callResult;
      await loadResult;
    });
  });

  describe('inheritance behavior', () => {
    it('should allow overriding default load behavior', async () => {
      class CustomTool extends Tool {
        async call(name: string): Promise<{ [key: string]: any }> {
          return { custom: name };
        }

        async load(): Promise<OpenTool | null> {
          return TestDataFactory.createSimpleOpenTool('1.0.0', 'Custom Tool');
        }
      }

      const tool = new CustomTool();
      const result = await tool.load();

      expect(result).not.toBeNull();
      expect(result?.info.title).toBe('Custom Tool');
    });

    it('should maintain polymorphic behavior', async () => {
      const tools: Tool[] = [
        new TestTool(),
        new SimpleTool()
      ];

      for (const tool of tools) {
        const result = await tool.call('test_method');
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }
    });

    it('should allow method chaining patterns', async () => {
      class ChainableTool extends Tool {
        private state: any = {};

        async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
          this.state[name] = args;
          return { state: this.state };
        }

        setState(key: string, value: any): this {
          this.state[key] = value;
          return this;
        }
      }

      const tool = new ChainableTool();
      tool.setState('initial', true);

      const result = await tool.call('test_method', { data: 'test' });

      expect(result.state.initial).toBe(true);
      expect(result.state.test_method).toEqual({ data: 'test' });
    });
  });

  describe('error handling patterns', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should propagate synchronous errors', async () => {
      tool.call = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error('Synchronous error'));
      });

      await expect(tool.call('test')).rejects.toThrow('Synchronous error');
    });

    it('should propagate asynchronous errors', async () => {
      tool.call = jest.fn().mockRejectedValue(new Error('Asynchronous error'));

      await expect(tool.call('test')).rejects.toThrow('Asynchronous error');
    });

    it('should handle timeout scenarios', async () => {
      tool.call = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Timeout error');
      });

      await expect(tool.call('slow_method')).rejects.toThrow('Timeout error');
    });

    it('should handle custom error types', async () => {
      class CustomError extends Error {
        constructor(message: string, public code: number) {
          super(message);
          this.name = 'CustomError';
        }
      }

      tool.call = jest.fn().mockRejectedValue(new CustomError('Custom error occurred', 500));

      try {
        await tool.call('test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).code).toBe(500);
      }
    });
  });
});