import { Express } from 'express';
import { Server } from 'http';
import { OpenToolServer } from '../../src/server/opentool-server';
import { OpenToolClient } from '../../src/client/opentool-client';
import { Tool } from '../../src/tool/tool';
import { OpenTool } from '../../src/models/opentool';
import { Info } from '../../src/models/info';
import { FunctionModel } from '../../src/models/function-model';
import { Parameter } from '../../src/models/parameter';
import { Return } from '../../src/models/return';
import { Schema } from '../../src/models/schema';
import { FunctionCall } from '../../src/llm/model';

// Test Tool implementation
class CalculatorTool extends Tool {
  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    switch (name) {
      case 'add':
        return { result: args!.a + args!.b };
      case 'multiply':
        return { result: args!.x * args!.y };
      case 'greet':
        return { message: `Hello, ${args!.name}!` };
      case 'error_test':
        throw new Error('Test error for integration testing');
      case 'complex_calc':
        const numbers = args!.numbers as number[];
        const operation = args!.operation as string;
        let result: number;
        
        switch (operation) {
          case 'sum':
            result = numbers.reduce((a, b) => a + b, 0);
            break;
          case 'product':
            result = numbers.reduce((a, b) => a * b, 1);
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
        return { result, count: numbers.length };
      default:
        throw new Error(`Function not supported: ${name}`);
    }
  }

  async load(): Promise<OpenTool | null> {
    const info = new Info('Calculator Tool', '1.0.0', 'A simple calculator tool');
    
    const numberSchema = new Schema('number', 'A numeric value');
    const stringSchema = new Schema('string', 'A string value');
    const arraySchema = new Schema('array', 'An array of numbers');
    
    const addFunction = new FunctionModel(
      'add',
      'Adds two numbers',
      [
        new Parameter('a', numberSchema, true, 'First number'),
        new Parameter('b', numberSchema, true, 'Second number')
      ],
      new Return('result', numberSchema, 'Sum of a and b')
    );

    const multiplyFunction = new FunctionModel(
      'multiply',
      'Multiplies two numbers',
      [
        new Parameter('x', numberSchema, true, 'First number'),
        new Parameter('y', numberSchema, true, 'Second number')
      ],
      new Return('result', numberSchema, 'Product of x and y')
    );

    const greetFunction = new FunctionModel(
      'greet',
      'Greets a person',
      [
        new Parameter('name', stringSchema, true, 'Name to greet')
      ],
      new Return('message', stringSchema, 'Greeting message')
    );

    const errorFunction = new FunctionModel(
      'error_test',
      'Function that throws an error for testing',
      [],
      new Return('result', stringSchema, 'Never returns')
    );

    const complexFunction = new FunctionModel(
      'complex_calc',
      'Performs operations on array of numbers',
      [
        new Parameter('numbers', arraySchema, true, 'Array of numbers'),
        new Parameter('operation', stringSchema, true, 'Operation to perform (sum/product)')
      ],
      new Return('result', numberSchema, 'Calculation result')
    );

    const functions = [addFunction, multiplyFunction, greetFunction, errorFunction, complexFunction];
    
    const schemas = {
      'Number': numberSchema,
      'String': stringSchema,
      'NumberArray': arraySchema
    };

    return new OpenTool('1.0.0', info, undefined, functions, schemas);
  }
}

describe('End-to-End Integration Tests', () => {
  let openToolServer: OpenToolServer;
  let client: OpenToolClient;
  let tool: CalculatorTool;
  const testPort = 9555; // Use different port to avoid conflicts

  beforeAll(async () => {
    // Create tool instance
    tool = new CalculatorTool();
    
    // Create server
    openToolServer = new OpenToolServer(tool, '1.0.0', { 
      ip: '127.0.0.1', 
      port: testPort 
    });
    
    // Start server
    await openToolServer.start();
    
    // Small delay to ensure server is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create client
    client = new OpenToolClient({ 
      host: `http://127.0.0.1:${testPort}/opentool`
    });
  }, 10000);

  afterAll(async () => {
    // Close server
    await openToolServer.stop();
  });

  describe('Complete Workflow Integration', () => {
    it('should perform full workflow: version -> load -> multiple calls', async () => {
      // Step 1: Get version
      const version = await client.version();
      expect(version.version).toBe('1.0.0');

      // Step 2: Load OpenTool specification
      const openTool = await client.load();
      expect(openTool).not.toBeNull();
      expect(openTool).toBeDefined();
      
      if (openTool === null) {
        throw new Error('OpenTool should not be null');
      }
      
      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info.title).toBe('Calculator Tool');
      expect(openTool.functions).toHaveLength(5);
      expect(openTool.schemas).toBeDefined();

      // Verify function details
      const addFunc = openTool!.functions.find(f => f.name === 'add');
      expect(addFunc).toBeDefined();
      expect(addFunc!.parameters).toHaveLength(2);
      expect(addFunc!.return_).toBeDefined();

      // Step 3: Make function calls
      const addCall = new FunctionCall('add-1', 'add', { a: 5, b: 3 });
      const addResult = await client.call(addCall);
      expect(addResult.id).toBe('add-1');
      expect(addResult.result).toEqual({ result: 8 });

      const multiplyCall = new FunctionCall('mul-1', 'multiply', { x: 4, y: 6 });
      const multiplyResult = await client.call(multiplyCall);
      expect(multiplyResult.id).toBe('mul-1');
      expect(multiplyResult.result).toEqual({ result: 24 });

      const greetCall = new FunctionCall('greet-1', 'greet', { name: 'Integration Test' });
      const greetResult = await client.call(greetCall);
      expect(greetResult.id).toBe('greet-1');
      expect(greetResult.result).toEqual({ message: 'Hello, Integration Test!' });
    });

    it('should handle complex function calls with arrays and objects', async () => {
      const complexCall = new FunctionCall('complex-1', 'complex_calc', {
        numbers: [1, 2, 3, 4, 5],
        operation: 'sum'
      });
      
      const result = await client.call(complexCall);
      expect(result.id).toBe('complex-1');
      expect(result.result).toEqual({ result: 15, count: 5 });

      const productCall = new FunctionCall('complex-2', 'complex_calc', {
        numbers: [2, 3, 4],
        operation: 'product'
      });
      
      const productResult = await client.call(productCall);
      expect(productResult.id).toBe('complex-2');
      expect(productResult.result).toEqual({ result: 24, count: 3 });
    });

    it('should handle error scenarios properly', async () => {
      // Test function that throws error
      const errorCall = new FunctionCall('error-1', 'error_test', {});
      
      await expect(client.call(errorCall)).rejects.toThrow();

      // Test unsupported function
      const unsupportedCall = new FunctionCall('unsupported-1', 'non_existent', {});
      
      await expect(client.call(unsupportedCall)).rejects.toThrow();

      // Test invalid operation
      const invalidOpCall = new FunctionCall('invalid-1', 'complex_calc', {
        numbers: [1, 2, 3],
        operation: 'invalid_op'
      });
      
      await expect(client.call(invalidOpCall)).rejects.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent calls', async () => {
      const calls = [
        client.call(new FunctionCall('concurrent-1', 'add', { a: 1, b: 2 })),
        client.call(new FunctionCall('concurrent-2', 'multiply', { x: 3, y: 4 })),
        client.call(new FunctionCall('concurrent-3', 'greet', { name: 'Concurrent' })),
        client.call(new FunctionCall('concurrent-4', 'add', { a: 10, b: 20 })),
        client.call(new FunctionCall('concurrent-5', 'multiply', { x: 5, y: 6 }))
      ];

      const results = await Promise.all(calls);

      expect(results).toHaveLength(5);
      expect(results[0].result).toEqual({ result: 3 });
      expect(results[1].result).toEqual({ result: 12 });
      expect(results[2].result).toEqual({ message: 'Hello, Concurrent!' });
      expect(results[3].result).toEqual({ result: 30 });
      expect(results[4].result).toEqual({ result: 30 });

      // Verify all calls completed with correct IDs
      expect(results.map(r => r.id)).toEqual([
        'concurrent-1', 'concurrent-2', 'concurrent-3', 'concurrent-4', 'concurrent-5'
      ]);
    });

    it('should handle mixed success/failure concurrent calls', async () => {
      const calls = [
        client.call(new FunctionCall('mixed-1', 'add', { a: 1, b: 2 })),
        client.call(new FunctionCall('mixed-2', 'error_test', {})),
        client.call(new FunctionCall('mixed-3', 'greet', { name: 'Mixed' })),
        client.call(new FunctionCall('mixed-4', 'non_existent', {})),
        client.call(new FunctionCall('mixed-5', 'multiply', { x: 7, y: 8 }))
      ];

      const results = await Promise.allSettled(calls);

      expect(results).toHaveLength(5);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
      expect(results[3].status).toBe('rejected');
      expect(results[4].status).toBe('fulfilled');

      // Check successful results
      if (results[0].status === 'fulfilled') {
        expect(results[0].value.result).toEqual({ result: 3 });
      }
      if (results[2].status === 'fulfilled') {
        expect(results[2].value.result).toEqual({ message: 'Hello, Mixed!' });
      }
      if (results[4].status === 'fulfilled') {
        expect(results[4].value.result).toEqual({ result: 56 });
      }
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate schema consistency between load and call', async () => {
      const openTool = await client.load();
      expect(openTool).toBeDefined();

      // Find the complex_calc function
      const complexFunc = openTool!.functions.find(f => f.name === 'complex_calc');
      expect(complexFunc).toBeDefined();
      expect(complexFunc!.parameters).toHaveLength(2);

      // Verify parameter schemas
      const numbersParam = complexFunc!.parameters.find(p => p.name === 'numbers');
      expect(numbersParam).toBeDefined();
      expect(numbersParam!.schema.type).toBe('array');

      const operationParam = complexFunc!.parameters.find(p => p.name === 'operation');
      expect(operationParam).toBeDefined();
      expect(operationParam!.schema.type).toBe('string');

      // Use the function with data matching the schema
      const call = new FunctionCall('validation-1', 'complex_calc', {
        numbers: [1, 2, 3, 4],
        operation: 'sum'
      });

      const result = await client.call(call);
      expect(result.result).toEqual({ result: 10, count: 4 });
    });

    it('should handle edge cases in parameter validation', async () => {
      // Test with empty array
      const emptyArrayCall = new FunctionCall('edge-1', 'complex_calc', {
        numbers: [],
        operation: 'sum'
      });
      
      const emptyResult = await client.call(emptyArrayCall);
      expect(emptyResult.result).toEqual({ result: 0, count: 0 });

      // Test with single number
      const singleCall = new FunctionCall('edge-2', 'complex_calc', {
        numbers: [42],
        operation: 'product'
      });
      
      const singleResult = await client.call(singleCall);
      expect(singleResult.result).toEqual({ result: 42, count: 1 });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle sequential calls efficiently', async () => {
      const startTime = Date.now();
      
      // Make 20 sequential calls
      for (let i = 0; i < 20; i++) {
        const call = new FunctionCall(`perf-${i}`, 'add', { a: i, b: i + 1 });
        const result = await client.call(call);
        expect(result.result).toEqual({ result: i + (i + 1) });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 5 seconds for 20 calls)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle load specification caching', async () => {
      const startTime = Date.now();
      
      // Load specification multiple times
      const loadPromises: Promise<OpenTool | null>[] = [];
      for (let i = 0; i < 10; i++) {
        loadPromises.push(client.load());
      }
      
      const results = await Promise.all(loadPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // All should return the same OpenTool
      results.forEach(openTool => {
        expect(openTool).toBeDefined();
        expect(openTool!.info.title).toBe('Calculator Tool');
        expect(openTool!.functions).toHaveLength(5);
      });
      
      // Should complete quickly (less than 2 seconds for 10 loads)
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should simulate typical LLM integration workflow', async () => {
      // Scenario: LLM discovers and uses the calculator tool
      
      // 1. LLM discovers the tool
      const openTool = await client.load();
      expect(openTool).toBeDefined();
      
      // 2. LLM analyzes available functions
      const functionNames = openTool!.functions.map(f => f.name);
      expect(functionNames).toContain('add');
      expect(functionNames).toContain('multiply');
      expect(functionNames).toContain('complex_calc');
      
      // 3. LLM uses the tool for a calculation task: (5 + 3) * 4
      
      // Step 1: 5 + 3
      const step1 = new FunctionCall('math-step1', 'add', { a: 5, b: 3 });
      const result1 = await client.call(step1);
      const sum = result1.result.result;
      
      // Step 2: sum * 4
      const step2 = new FunctionCall('math-step2', 'multiply', { x: sum, y: 4 });
      const result2 = await client.call(step2);
      const finalResult = result2.result.result;
      
      expect(finalResult).toBe(32);
      
      // 4. LLM uses complex function
      const complexMath = new FunctionCall('math-complex', 'complex_calc', {
        numbers: [2, 4, 6, 8],
        operation: 'sum'
      });
      
      const complexResult = await client.call(complexMath);
      expect(complexResult.result).toEqual({ result: 20, count: 4 });
    });

    it('should handle chatbot conversation scenario', async () => {
      // Scenario: Chatbot using calculator for user queries
      
      const conversations = [
        { query: "What's 15 + 27?", call: new FunctionCall('chat-1', 'add', { a: 15, b: 27 }) },
        { query: "Multiply 8 by 9", call: new FunctionCall('chat-2', 'multiply', { x: 8, y: 9 }) },
        { query: "Sum up these numbers: 10, 20, 30", call: new FunctionCall('chat-3', 'complex_calc', { numbers: [10, 20, 30], operation: 'sum' }) }
      ];
      
      for (const conversation of conversations) {
        const result = await client.call(conversation.call);
        expect(result).toBeDefined();
        expect(result.result).toBeDefined();
      }
      
      // Verify specific results
      const results = await Promise.all(conversations.map(c => client.call(c.call)));
      expect(results[0].result).toEqual({ result: 42 });
      expect(results[1].result).toEqual({ result: 72 });
      expect(results[2].result).toEqual({ result: 60, count: 3 });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should continue working after error calls', async () => {
      // Make an error call
      const errorCall = new FunctionCall('resilience-error', 'error_test', {});
      await expect(client.call(errorCall)).rejects.toThrow();
      
      // Server should still work for valid calls
      const validCall = new FunctionCall('resilience-valid', 'add', { a: 1, b: 1 });
      const result = await client.call(validCall);
      expect(result.result).toEqual({ result: 2 });
      
      // Load should still work
      const openTool = await client.load();
      expect(openTool).toBeDefined();
      
      // Version should still work
      const version = await client.version();
      expect(version.version).toBe('1.0.0');
    });

    it('should handle malformed requests gracefully', async () => {
      // Valid call to ensure server is working
      const beforeCall = new FunctionCall('before-malformed', 'add', { a: 5, b: 5 });
      const beforeResult = await client.call(beforeCall);
      expect(beforeResult.result).toEqual({ result: 10 });
      
      // Try invalid function name
      const invalidCall = new FunctionCall('invalid-func', 'invalid_function_name', {});
      await expect(client.call(invalidCall)).rejects.toThrow();
      
      // Server should recover and handle valid requests
      const afterCall = new FunctionCall('after-malformed', 'multiply', { x: 3, y: 3 });
      const afterResult = await client.call(afterCall);
      expect(afterResult.result).toEqual({ result: 9 });
    });
  });
});