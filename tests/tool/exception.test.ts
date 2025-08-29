import {
  FunctionNotSupportedException,
  InvalidArgumentsException,
  ToolBreakException,
  JsonParserException
} from '../../src/tool/exception';

describe('FunctionNotSupportedException', () => {
  describe('constructor', () => {
    it('should create exception with function name', () => {
      const exception = new FunctionNotSupportedException('test_function');

      expect(exception.code).toBe(405);
      expect(exception.message).toBe('Function Not Supported: test_function');
      expect(exception.name).toBe('FunctionNotSupportedException');
    });

    it('should extend Error', () => {
      const exception = new FunctionNotSupportedException('test_function');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(FunctionNotSupportedException);
    });

    it('should handle empty function name', () => {
      const exception = new FunctionNotSupportedException('');

      expect(exception.message).toBe('Function Not Supported: ');
    });

    it('should handle function names with special characters', () => {
      const specialName = 'function-with-special_chars.and.dots';
      const exception = new FunctionNotSupportedException(specialName);

      expect(exception.message).toBe(`Function Not Supported: ${specialName}`);
    });

    it('should handle very long function names', () => {
      const longName = 'very_long_function_name_' + 'a'.repeat(100);
      const exception = new FunctionNotSupportedException(longName);

      expect(exception.message).toBe(`Function Not Supported: ${longName}`);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new FunctionNotSupportedException('missing_function');

      const json = exception.toJson();

      expect(json).toEqual({
        code: 405,
        message: 'Function Not Supported: missing_function'
      });
    });

    it('should maintain consistent serialization', () => {
      const exception = new FunctionNotSupportedException('consistent_function');

      const json1 = exception.toJson();
      const json2 = exception.toJson();

      expect(json1).toEqual(json2);
    });
  });

  describe('toString', () => {
    it('should return JSON string representation', () => {
      const exception = new FunctionNotSupportedException('stringify_function');

      const stringified = exception.toString();
      const expected = JSON.stringify({
        code: 405,
        message: 'Function Not Supported: stringify_function'
      });

      expect(stringified).toBe(expected);
    });

    it('should be parseable JSON', () => {
      const exception = new FunctionNotSupportedException('parseable_function');

      const stringified = exception.toString();
      const parsed = JSON.parse(stringified);

      expect(parsed.code).toBe(405);
      expect(parsed.message).toBe('Function Not Supported: parseable_function');
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new FunctionNotSupportedException('test');

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new FunctionNotSupportedException('test');

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });
});

describe('InvalidArgumentsException', () => {
  describe('constructor', () => {
    it('should create exception without arguments', () => {
      const exception = new InvalidArgumentsException();

      expect(exception.code).toBe(400);
      expect(exception.message).toBe('Invalid Arguments: undefined');
      expect(exception.name).toBe('InvalidArgumentsException');
    });

    it('should create exception with empty arguments', () => {
      const exception = new InvalidArgumentsException({});

      expect(exception.message).toBe('Invalid Arguments: {}');
    });

    it('should create exception with simple arguments', () => {
      const args = { param1: 'value1', param2: 42 };
      const exception = new InvalidArgumentsException(args);

      expect(exception.message).toBe('Invalid Arguments: {"param1":"value1","param2":42}');
    });

    it('should create exception with complex arguments', () => {
      const complexArgs = {
        user: { name: 'John', age: 30 },
        options: { sort: true, limit: 10 },
        data: [1, 2, 3]
      };
      const exception = new InvalidArgumentsException(complexArgs);

      expect(exception.message).toContain('Invalid Arguments:');
      expect(exception.message).toContain('John');
      expect(exception.message).toContain('sort');
    });

    it('should extend Error', () => {
      const exception = new InvalidArgumentsException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(InvalidArgumentsException);
    });

    it('should handle null arguments', () => {
      const exception = new InvalidArgumentsException(null as any);

      expect(exception.message).toBe('Invalid Arguments: null');
    });

    it('should handle arguments with special values', () => {
      const specialArgs = {
        nullValue: null,
        undefinedValue: undefined,
        booleanValue: false,
        zeroValue: 0,
        emptyString: ''
      };
      const exception = new InvalidArgumentsException(specialArgs);

      expect(exception.message).toContain('Invalid Arguments:');
      expect(exception.message).toContain('null');
      expect(exception.message).toContain('false');
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const args = { invalid: 'param' };
      const exception = new InvalidArgumentsException(args);

      const json = exception.toJson();

      expect(json).toEqual({
        code: 400,
        message: 'Invalid Arguments: {"invalid":"param"}'
      });
    });
  });

  describe('toString', () => {
    it('should return JSON string representation', () => {
      const args = { test: 'value' };
      const exception = new InvalidArgumentsException(args);

      const stringified = exception.toString();
      const parsed = JSON.parse(stringified);

      expect(parsed.code).toBe(400);
      expect(parsed.message).toContain('Invalid Arguments:');
    });
  });

  describe('error handling scenarios', () => {
    it('should handle circular references in arguments', () => {
      const circularArgs: any = { test: 'value' };
      circularArgs.self = circularArgs;

      expect(() => {
        new InvalidArgumentsException(circularArgs);
      }).toThrow(); // JSON.stringify will throw on circular references
    });

    it('should handle very large argument objects', () => {
      const largeArgs: any = {};
      for (let i = 0; i < 1000; i++) {
        largeArgs[`key${i}`] = `value${i}`;
      }

      const exception = new InvalidArgumentsException(largeArgs);

      expect(exception.message).toContain('Invalid Arguments:');
      expect(exception.message).toContain('key0');
      expect(exception.message).toContain('key999');
    });
  });
});

describe('ToolBreakException', () => {
  describe('constructor', () => {
    it('should create exception without message', () => {
      const exception = new ToolBreakException();

      expect(exception.code).toBe(500);
      expect(exception.message).toBe('Tool break exception');
      expect(exception.name).toBe('ToolBreakException');
    });

    it('should create exception with custom message', () => {
      const customMessage = 'Custom tool break error';
      const exception = new ToolBreakException(customMessage);

      expect(exception.message).toBe(customMessage);
    });

    it('should create exception with empty string message', () => {
      const exception = new ToolBreakException('');

      expect(exception.message).toBe('');
    });

    it('should extend Error', () => {
      const exception = new ToolBreakException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(ToolBreakException);
    });

    it('should handle multiline messages', () => {
      const multilineMessage = `Error occurred:
      Line 1: Critical failure
      Line 2: System halted`;
      const exception = new ToolBreakException(multilineMessage);

      expect(exception.message).toBe(multilineMessage);
    });

    it('should handle messages with special characters', () => {
      const specialMessage = 'Error: 💥 Tool failed with status 🔥 (code: 500)';
      const exception = new ToolBreakException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new ToolBreakException('Critical tool failure');

      const json = exception.toJson();

      expect(json).toEqual({
        code: 500,
        message: 'Critical tool failure'
      });
    });

    it('should serialize default message', () => {
      const exception = new ToolBreakException();

      const json = exception.toJson();

      expect(json.message).toBe('Tool break exception');
    });
  });

  describe('toString', () => {
    it('should return JSON string representation', () => {
      const exception = new ToolBreakException('Stringify test');

      const stringified = exception.toString();
      const parsed = JSON.parse(stringified);

      expect(parsed.code).toBe(500);
      expect(parsed.message).toBe('Stringify test');
    });
  });

  describe('usage scenarios', () => {
    it('should be throwable and catchable', () => {
      const throwException = () => {
        throw new ToolBreakException('Test break');
      };

      expect(throwException).toThrow(ToolBreakException);
      expect(throwException).toThrow('Test break');
    });

    it('should maintain stack trace', () => {
      const exception = new ToolBreakException('Stack trace test');

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain('ToolBreakException');
    });
  });
});

describe('JsonParserException', () => {
  describe('constructor', () => {
    it('should create exception with default message', () => {
      const exception = new JsonParserException();

      expect(exception.code).toBe(404);
      expect(exception.message).toBe('Json Parser NOT implement');
      expect(exception.name).toBe('JsonParserException');
    });

    it('should extend Error', () => {
      const exception = new JsonParserException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(JsonParserException);
    });

    it('should have consistent properties across instances', () => {
      const exception1 = new JsonParserException();
      const exception2 = new JsonParserException();

      expect(exception1.code).toBe(exception2.code);
      expect(exception1.message).toBe(exception2.message);
      expect(exception1.name).toBe(exception2.name);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new JsonParserException();

      const json = exception.toJson();

      expect(json).toEqual({
        code: 404,
        message: 'Json Parser NOT implement'
      });
    });

    it('should maintain consistent serialization', () => {
      const exception = new JsonParserException();

      const json1 = exception.toJson();
      const json2 = exception.toJson();

      expect(json1).toEqual(json2);
    });
  });

  describe('toString', () => {
    it('should return JSON string representation', () => {
      const exception = new JsonParserException();

      const stringified = exception.toString();
      const expected = JSON.stringify({
        code: 404,
        message: 'Json Parser NOT implement'
      });

      expect(stringified).toBe(expected);
    });

    it('should be parseable JSON', () => {
      const exception = new JsonParserException();

      const stringified = exception.toString();
      const parsed = JSON.parse(stringified);

      expect(parsed.code).toBe(404);
      expect(parsed.message).toBe('Json Parser NOT implement');
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new JsonParserException();

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new JsonParserException();

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });

  describe('usage scenarios', () => {
    it('should be used to indicate unimplemented parser', () => {
      const throwException = () => {
        throw new JsonParserException();
      };

      expect(throwException).toThrow(JsonParserException);
      expect(throwException).toThrow('Json Parser NOT implement');
    });
  });
});

describe('Exception hierarchy', () => {
  it('should all extend Error', () => {
    const exceptions = [
      new FunctionNotSupportedException('test'),
      new InvalidArgumentsException(),
      new ToolBreakException(),
      new JsonParserException()
    ];

    exceptions.forEach(exception => {
      expect(exception).toBeInstanceOf(Error);
    });
  });

  it('should have unique names', () => {
    const exceptions = [
      new FunctionNotSupportedException('test'),
      new InvalidArgumentsException(),
      new ToolBreakException(),
      new JsonParserException()
    ];

    const names = exceptions.map(e => e.name);
    const uniqueNames = [...new Set(names)];

    expect(names).toHaveLength(uniqueNames.length);
  });

  it('should be distinguishable by instanceof', () => {
    const funcNotSupported = new FunctionNotSupportedException('test');
    const invalidArgs = new InvalidArgumentsException();
    const toolBreak = new ToolBreakException();
    const jsonParser = new JsonParserException();

    expect(funcNotSupported instanceof FunctionNotSupportedException).toBe(true);
    expect(funcNotSupported instanceof InvalidArgumentsException).toBe(false);
    
    expect(invalidArgs instanceof InvalidArgumentsException).toBe(true);
    expect(invalidArgs instanceof ToolBreakException).toBe(false);
    
    expect(toolBreak instanceof ToolBreakException).toBe(true);
    expect(toolBreak instanceof JsonParserException).toBe(false);
    
    expect(jsonParser instanceof JsonParserException).toBe(true);
    expect(jsonParser instanceof FunctionNotSupportedException).toBe(false);
  });

  it('should all have toJson method', () => {
    const exceptions = [
      new FunctionNotSupportedException('test'),
      new InvalidArgumentsException(),
      new ToolBreakException(),
      new JsonParserException()
    ];

    exceptions.forEach(exception => {
      expect(typeof exception.toJson).toBe('function');
      expect(exception.toJson()).toBeDefined();
      expect(typeof exception.toJson()).toBe('object');
    });
  });

  it('should all have toString method', () => {
    const exceptions = [
      new FunctionNotSupportedException('test'),
      new InvalidArgumentsException(),
      new ToolBreakException(),
      new JsonParserException()
    ];

    exceptions.forEach(exception => {
      expect(typeof exception.toString).toBe('function');
      expect(typeof exception.toString()).toBe('string');
      expect(() => JSON.parse(exception.toString())).not.toThrow();
    });
  });

  it('should have appropriate HTTP status codes', () => {
    const funcNotSupported = new FunctionNotSupportedException('test');
    const invalidArgs = new InvalidArgumentsException();
    const toolBreak = new ToolBreakException();
    const jsonParser = new JsonParserException();

    expect(funcNotSupported.code).toBe(405); // Method Not Allowed
    expect(invalidArgs.code).toBe(400); // Bad Request
    expect(toolBreak.code).toBe(500); // Internal Server Error
    expect(jsonParser.code).toBe(404); // Not Found
  });

  it('should maintain error context in stack traces', () => {
    const exceptions = [
      new FunctionNotSupportedException('test'),
      new InvalidArgumentsException(),
      new ToolBreakException(),
      new JsonParserException()
    ];

    exceptions.forEach(exception => {
      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain(exception.name);
    });
  });
});