import { FunctionCall, ToolReturn } from '../../src/llm/model';

describe('FunctionCall', () => {
  describe('constructor', () => {
    it('should create FunctionCall with all parameters', () => {
      const args = { input: 'test', count: 5 };
      const functionCall = new FunctionCall('call-123', 'test_function', args);

      expect(functionCall.id).toBe('call-123');
      expect(functionCall.name).toBe('test_function');
      expect(functionCall.arguments).toBe(args);
    });

    it('should handle empty arguments object', () => {
      const functionCall = new FunctionCall('call-456', 'no_params_function', {});

      expect(functionCall.id).toBe('call-456');
      expect(functionCall.name).toBe('no_params_function');
      expect(functionCall.arguments).toEqual({});
    });

    it('should handle complex arguments', () => {
      const complexArgs = {
        user: {
          name: 'John Doe',
          age: 30,
          preferences: ['option1', 'option2']
        },
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        },
        flags: {
          debug: true,
          verbose: false
        }
      };

      const functionCall = new FunctionCall('complex-call', 'process_data', complexArgs);

      expect(functionCall.arguments).toBe(complexArgs);
      expect(functionCall.arguments.user.name).toBe('John Doe');
      expect(functionCall.arguments.metadata.version).toBe('1.0.0');
      expect(functionCall.arguments.flags.debug).toBe(true);
    });

    it('should handle null and undefined values in arguments', () => {
      const argsWithNulls = {
        validValue: 'test',
        nullValue: null,
        undefinedValue: undefined,
        zeroValue: 0,
        emptyString: '',
        falseValue: false
      };

      const functionCall = new FunctionCall('null-test', 'test_function', argsWithNulls);

      expect(functionCall.arguments.validValue).toBe('test');
      expect(functionCall.arguments.nullValue).toBeNull();
      expect(functionCall.arguments.undefinedValue).toBeUndefined();
      expect(functionCall.arguments.zeroValue).toBe(0);
      expect(functionCall.arguments.emptyString).toBe('');
      expect(functionCall.arguments.falseValue).toBe(false);
    });
  });

  describe('fromJson', () => {
    it('should create FunctionCall from JSON', () => {
      const json = {
        id: 'json-call-123',
        name: 'json_function',
        arguments: { input: 'json_test', count: 10 }
      };

      const functionCall = FunctionCall.fromJson(json);

      expect(functionCall.id).toBe('json-call-123');
      expect(functionCall.name).toBe('json_function');
      expect(functionCall.arguments).toEqual({ input: 'json_test', count: 10 });
    });

    it('should handle JSON with empty arguments', () => {
      const json = {
        id: 'empty-args',
        name: 'no_params_function',
        arguments: {}
      };

      const functionCall = FunctionCall.fromJson(json);

      expect(functionCall.arguments).toEqual({});
    });

    it('should handle JSON with complex arguments', () => {
      const json = {
        id: 'complex-json',
        name: 'complex_function',
        arguments: {
          data: [1, 2, 3],
          options: {
            sort: true,
            filter: 'active'
          },
          callback: null
        }
      };

      const functionCall = FunctionCall.fromJson(json);

      expect(functionCall.arguments.data).toEqual([1, 2, 3]);
      expect(functionCall.arguments.options.sort).toBe(true);
      expect(functionCall.arguments.callback).toBeNull();
    });

    it('should handle JSON with missing arguments field', () => {
      const json = {
        id: 'missing-args',
        name: 'function_without_args'
      };

      const functionCall = FunctionCall.fromJson(json);

      expect(functionCall.arguments).toBeUndefined();
    });

    it('should preserve argument types from JSON', () => {
      const json = {
        id: 'type-test',
        name: 'type_function',
        arguments: {
          stringValue: 'test',
          numberValue: 42,
          booleanValue: true,
          arrayValue: [1, 'two', true],
          objectValue: { nested: 'value' },
          nullValue: null
        }
      };

      const functionCall = FunctionCall.fromJson(json);

      expect(typeof functionCall.arguments.stringValue).toBe('string');
      expect(typeof functionCall.arguments.numberValue).toBe('number');
      expect(typeof functionCall.arguments.booleanValue).toBe('boolean');
      expect(Array.isArray(functionCall.arguments.arrayValue)).toBe(true);
      expect(typeof functionCall.arguments.objectValue).toBe('object');
      expect(functionCall.arguments.nullValue).toBeNull();
    });
  });

  describe('toJson', () => {
    it('should serialize FunctionCall to JSON', () => {
      const args = { input: 'serialize_test', count: 7 };
      const functionCall = new FunctionCall('serialize-123', 'serialize_function', args);

      const json = functionCall.toJson();

      expect(json).toEqual({
        id: 'serialize-123',
        name: 'serialize_function',
        arguments: { input: 'serialize_test', count: 7 }
      });
    });

    it('should serialize empty arguments', () => {
      const functionCall = new FunctionCall('empty-serialize', 'empty_function', {});

      const json = functionCall.toJson();

      expect(json.arguments).toEqual({});
    });

    it('should serialize complex arguments', () => {
      const complexArgs = {
        nested: {
          level1: {
            level2: {
              value: 'deep'
            }
          }
        },
        array: [{ item: 1 }, { item: 2 }]
      };

      const functionCall = new FunctionCall('complex-serialize', 'complex_function', complexArgs);

      const json = functionCall.toJson();

      expect(json.arguments.nested.level1.level2.value).toBe('deep');
      expect(json.arguments.array[0].item).toBe(1);
    });

    it('should preserve null and undefined values', () => {
      const argsWithNulls = {
        nullValue: null,
        undefinedValue: undefined
      };

      const functionCall = new FunctionCall('null-serialize', 'null_function', argsWithNulls);

      const json = functionCall.toJson();

      expect(json.arguments.nullValue).toBeNull();
      expect(json.arguments.undefinedValue).toBeUndefined();
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        id: 'roundtrip-test',
        name: 'roundtrip_function',
        arguments: {
          complex: {
            data: [1, 2, 3],
            metadata: {
              version: '1.0.0',
              timestamp: 1234567890
            }
          },
          flags: {
            enabled: true,
            debug: false
          }
        }
      };

      const functionCall1 = FunctionCall.fromJson(originalJson);
      const serialized = functionCall1.toJson();
      const functionCall2 = FunctionCall.fromJson(serialized);

      expect(functionCall2.id).toBe(originalJson.id);
      expect(functionCall2.name).toBe(originalJson.name);
      expect(functionCall2.arguments.complex.data).toEqual([1, 2, 3]);
      expect(functionCall2.arguments.complex.metadata.version).toBe('1.0.0');
      expect(functionCall2.arguments.flags.enabled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very long function names', () => {
      const longName = 'very_long_function_name_' + 'a'.repeat(100);
      const functionCall = new FunctionCall('long-name', longName, {});

      expect(functionCall.name).toBe(longName);
      expect(functionCall.toJson().name).toBe(longName);
    });

    it('should handle special characters in function names', () => {
      const specialName = 'function-with-special_chars.and.dots';
      const functionCall = new FunctionCall('special-chars', specialName, {});

      expect(functionCall.name).toBe(specialName);
    });

    it('should handle Unicode characters in arguments', () => {
      const unicodeArgs = {
        emoji: '🚀🔧🎉',
        chinese: '你好世界',
        symbols: '∑∆∏'
      };

      const functionCall = new FunctionCall('unicode-test', 'unicode_function', unicodeArgs);

      const json = functionCall.toJson();
      expect(json.arguments.emoji).toBe('🚀🔧🎉');
      expect(json.arguments.chinese).toBe('你好世界');
      expect(json.arguments.symbols).toBe('∑∆∏');
    });

    it('should handle circular references gracefully', () => {
      const circularArgs: any = { test: 'value' };
      circularArgs.self = circularArgs;

      const functionCall = new FunctionCall('circular-test', 'circular_function', circularArgs);

      // The object is stored as-is, but JSON serialization would fail
      expect(functionCall.arguments.test).toBe('value');
      expect(functionCall.arguments.self).toBe(circularArgs);
    });
  });
});

describe('ToolReturn', () => {
  describe('constructor', () => {
    it('should create ToolReturn with id and result', () => {
      const result = { output: 'success', count: 5 };
      const toolReturn = new ToolReturn('return-123', result);

      expect(toolReturn.id).toBe('return-123');
      expect(toolReturn.result).toBe(result);
    });

    it('should handle empty result object', () => {
      const toolReturn = new ToolReturn('empty-result', {});

      expect(toolReturn.id).toBe('empty-result');
      expect(toolReturn.result).toEqual({});
    });

    it('should handle complex result objects', () => {
      const complexResult = {
        status: 'success',
        data: {
          users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ],
          metadata: {
            total: 2,
            page: 1,
            hasMore: false
          }
        },
        timestamp: Date.now()
      };

      const toolReturn = new ToolReturn('complex-result', complexResult);

      expect(toolReturn.result).toBe(complexResult);
      expect(toolReturn.result.data.users).toHaveLength(2);
      expect(toolReturn.result.data.metadata.total).toBe(2);
    });

    it('should handle result with null and undefined values', () => {
      const resultWithNulls = {
        validValue: 'test',
        nullValue: null,
        undefinedValue: undefined,
        zeroValue: 0,
        emptyArray: [],
        emptyObject: {}
      };

      const toolReturn = new ToolReturn('null-result', resultWithNulls);

      expect(toolReturn.result.validValue).toBe('test');
      expect(toolReturn.result.nullValue).toBeNull();
      expect(toolReturn.result.undefinedValue).toBeUndefined();
      expect(toolReturn.result.zeroValue).toBe(0);
      expect(toolReturn.result.emptyArray).toEqual([]);
      expect(toolReturn.result.emptyObject).toEqual({});
    });
  });

  describe('fromJson', () => {
    it('should create ToolReturn from JSON', () => {
      const json = {
        id: 'json-return-123',
        result: { output: 'json_success', items: [1, 2, 3] }
      };

      const toolReturn = ToolReturn.fromJson(json);

      expect(toolReturn.id).toBe('json-return-123');
      expect(toolReturn.result).toEqual({ output: 'json_success', items: [1, 2, 3] });
    });

    it('should handle JSON with empty result', () => {
      const json = {
        id: 'empty-json',
        result: {}
      };

      const toolReturn = ToolReturn.fromJson(json);

      expect(toolReturn.result).toEqual({});
    });

    it('should handle JSON with complex nested result', () => {
      const json = {
        id: 'nested-json',
        result: {
          level1: {
            level2: {
              level3: {
                value: 'deeply nested'
              }
            }
          },
          arrays: {
            numbers: [1, 2, 3],
            strings: ['a', 'b', 'c'],
            mixed: [1, 'two', { three: 3 }]
          }
        }
      };

      const toolReturn = ToolReturn.fromJson(json);

      expect(toolReturn.result.level1.level2.level3.value).toBe('deeply nested');
      expect(toolReturn.result.arrays.numbers).toEqual([1, 2, 3]);
      expect(toolReturn.result.arrays.mixed[2].three).toBe(3);
    });

    it('should preserve result types from JSON', () => {
      const json = {
        id: 'type-preservation',
        result: {
          string: 'text',
          number: 42,
          boolean: true,
          array: [1, 2, 3],
          object: { key: 'value' },
          null: null
        }
      };

      const toolReturn = ToolReturn.fromJson(json);

      expect(typeof toolReturn.result.string).toBe('string');
      expect(typeof toolReturn.result.number).toBe('number');
      expect(typeof toolReturn.result.boolean).toBe('boolean');
      expect(Array.isArray(toolReturn.result.array)).toBe(true);
      expect(typeof toolReturn.result.object).toBe('object');
      expect(toolReturn.result.null).toBeNull();
    });
  });

  describe('toJson', () => {
    it('should serialize ToolReturn to JSON', () => {
      const result = { status: 'completed', data: 'test_data' };
      const toolReturn = new ToolReturn('serialize-456', result);

      const json = toolReturn.toJson();

      expect(json).toEqual({
        id: 'serialize-456',
        result: { status: 'completed', data: 'test_data' }
      });
    });

    it('should serialize empty result', () => {
      const toolReturn = new ToolReturn('empty-serialize', {});

      const json = toolReturn.toJson();

      expect(json.result).toEqual({});
    });

    it('should serialize complex nested results', () => {
      const complexResult = {
        response: {
          success: true,
          data: {
            processed: [
              { id: 1, status: 'done' },
              { id: 2, status: 'pending' }
            ]
          }
        },
        metadata: {
          executionTime: 150,
          warnings: []
        }
      };

      const toolReturn = new ToolReturn('complex-serialize', complexResult);

      const json = toolReturn.toJson();

      expect(json.result.response.success).toBe(true);
      expect(json.result.response.data.processed[0].status).toBe('done');
      expect(json.result.metadata.executionTime).toBe(150);
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        id: 'roundtrip-return',
        result: {
          computation: {
            input: [1, 2, 3, 4, 5],
            output: 15,
            algorithm: 'sum',
            performance: {
              executionTimeMs: 0.5,
              memoryUsageMB: 1.2
            }
          },
          metadata: {
            version: '2.0.0',
            timestamp: '2023-01-01T00:00:00Z',
            requestId: 'req-12345'
          }
        }
      };

      const toolReturn1 = ToolReturn.fromJson(originalJson);
      const serialized = toolReturn1.toJson();
      const toolReturn2 = ToolReturn.fromJson(serialized);

      expect(toolReturn2.id).toBe(originalJson.id);
      expect(toolReturn2.result.computation.output).toBe(15);
      expect(toolReturn2.result.computation.performance.executionTimeMs).toBe(0.5);
      expect(toolReturn2.result.metadata.requestId).toBe('req-12345');
    });
  });

  describe('edge cases', () => {
    it('should handle very large result objects', () => {
      const largeResult = {
        data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item_${i}` }))
      };

      const toolReturn = new ToolReturn('large-result', largeResult);

      expect(toolReturn.result.data).toHaveLength(1000);
      expect(toolReturn.result.data[999].value).toBe('item_999');
    });

    it('should handle Unicode characters in results', () => {
      const unicodeResult = {
        message: 'Operation completed successfully! 🎉',
        details: {
          chinese: '操作成功',
          arabic: 'العملية ناجحة',
          emoji: '✅💯🚀'
        }
      };

      const toolReturn = new ToolReturn('unicode-result', unicodeResult);

      const json = toolReturn.toJson();
      expect(json.result.message).toContain('🎉');
      expect(json.result.details.chinese).toBe('操作成功');
      expect(json.result.details.emoji).toBe('✅💯🚀');
    });

    it('should handle Date objects in results', () => {
      const dateResult = {
        timestamp: new Date('2023-01-01T00:00:00Z'),
        processed: true
      };

      const toolReturn = new ToolReturn('date-result', dateResult);

      expect(toolReturn.result.timestamp).toBeInstanceOf(Date);
      expect(toolReturn.result.processed).toBe(true);
    });

    it('should handle functions in results (though not recommended)', () => {
      const functionResult = {
        callback: () => 'test',
        data: 'normal data'
      };

      const toolReturn = new ToolReturn('function-result', functionResult);

      expect(typeof toolReturn.result.callback).toBe('function');
      expect(toolReturn.result.data).toBe('normal data');
    });
  });
});

describe('FunctionCall and ToolReturn integration', () => {
  it('should work together in request-response flow', () => {
    // Create a function call
    const functionCall = new FunctionCall('flow-test', 'calculate_sum', { numbers: [1, 2, 3, 4, 5] });

    // Simulate processing and create return
    const calculatedSum = functionCall.arguments.numbers.reduce((a: number, b: number) => a + b, 0);
    const toolReturn = new ToolReturn(functionCall.id, { sum: calculatedSum });

    expect(functionCall.id).toBe(toolReturn.id);
    expect(toolReturn.result.sum).toBe(15);
  });

  it('should maintain ID consistency across serialization', () => {
    const originalCall = new FunctionCall('consistency-test', 'test_function', { input: 'test' });
    
    // Serialize and deserialize the call
    const callJson = originalCall.toJson();
    const deserializedCall = FunctionCall.fromJson(callJson);

    // Create return with same ID
    const toolReturn = new ToolReturn(deserializedCall.id, { output: 'success' });
    
    // Serialize and deserialize the return
    const returnJson = toolReturn.toJson();
    const deserializedReturn = ToolReturn.fromJson(returnJson);

    expect(deserializedCall.id).toBe(originalCall.id);
    expect(deserializedReturn.id).toBe(toolReturn.id);
    expect(deserializedCall.id).toBe(deserializedReturn.id);
  });
});