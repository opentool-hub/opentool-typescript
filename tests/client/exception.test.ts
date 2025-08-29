import {
  ResponseNullException,
  ErrorNullException,
  OpenToolServerUnauthorizedException,
  OpenToolServerNoAccessException,
  OpenToolServerCallException
} from '../../src/client/exception';

describe('ResponseNullException', () => {
  describe('constructor', () => {
    it('should create exception with code', () => {
      const exception = new ResponseNullException(404);

      expect(exception.code).toBe(404);
      expect(exception.message).toBe('Response is null');
      expect(exception.name).toBe('ResponseNullException');
    });

    it('should extend Error', () => {
      const exception = new ResponseNullException(500);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(ResponseNullException);
    });

    it('should handle different error codes', () => {
      const codes = [200, 400, 401, 403, 404, 500, 502, 503];

      codes.forEach(code => {
        const exception = new ResponseNullException(code);
        expect(exception.code).toBe(code);
        expect(exception.message).toBe('Response is null');
      });
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new ResponseNullException(404);

      const json = exception.toJson();

      expect(json).toEqual({
        code: 404,
        message: 'Response is null'
      });
    });

    it('should maintain consistent serialization', () => {
      const exception = new ResponseNullException(500);

      const json1 = exception.toJson();
      const json2 = exception.toJson();

      expect(json1).toEqual(json2);
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new ResponseNullException(404);

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new ResponseNullException(404);

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });
});

describe('ErrorNullException', () => {
  describe('constructor', () => {
    it('should create exception with code', () => {
      const exception = new ErrorNullException(500);

      expect(exception.code).toBe(500);
      expect(exception.message).toBe('Error is null');
      expect(exception.name).toBe('ErrorNullException');
    });

    it('should extend Error', () => {
      const exception = new ErrorNullException(400);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(ErrorNullException);
    });

    it('should handle zero and negative codes', () => {
      const exception1 = new ErrorNullException(0);
      const exception2 = new ErrorNullException(-1);

      expect(exception1.code).toBe(0);
      expect(exception2.code).toBe(-1);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new ErrorNullException(400);

      const json = exception.toJson();

      expect(json).toEqual({
        code: 400,
        message: 'Error is null'
      });
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new ErrorNullException(400);

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new ErrorNullException(400);

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });
});

describe('OpenToolServerUnauthorizedException', () => {
  describe('constructor', () => {
    it('should create exception with default values', () => {
      const exception = new OpenToolServerUnauthorizedException();

      expect(exception.code).toBe(401);
      expect(exception.message).toBe('Please check API Key is VALID or NOT');
      expect(exception.name).toBe('OpenToolServerUnauthorizedException');
    });

    it('should extend Error', () => {
      const exception = new OpenToolServerUnauthorizedException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(OpenToolServerUnauthorizedException);
    });

    it('should have consistent properties across instances', () => {
      const exception1 = new OpenToolServerUnauthorizedException();
      const exception2 = new OpenToolServerUnauthorizedException();

      expect(exception1.code).toBe(exception2.code);
      expect(exception1.message).toBe(exception2.message);
      expect(exception1.name).toBe(exception2.name);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new OpenToolServerUnauthorizedException();

      const json = exception.toJson();

      expect(json).toEqual({
        code: 401,
        message: 'Please check API Key is VALID or NOT'
      });
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new OpenToolServerUnauthorizedException();

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new OpenToolServerUnauthorizedException();

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });

  describe('error handling', () => {
    it('should be catchable as Error', () => {
      try {
        throw new OpenToolServerUnauthorizedException();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OpenToolServerUnauthorizedException);
        expect((error as OpenToolServerUnauthorizedException).code).toBe(401);
      }
    });

    it('should have proper stack trace', () => {
      const exception = new OpenToolServerUnauthorizedException();

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain('OpenToolServerUnauthorizedException');
    });
  });
});

describe('OpenToolServerNoAccessException', () => {
  describe('constructor', () => {
    it('should create exception with default values', () => {
      const exception = new OpenToolServerNoAccessException();

      expect(exception.code).toBe(404);
      expect(exception.message).toBe('Please check OpenTool Server is RUNNING or NOT');
      expect(exception.name).toBe('OpenToolServerNoAccessException');
    });

    it('should extend Error', () => {
      const exception = new OpenToolServerNoAccessException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(OpenToolServerNoAccessException);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new OpenToolServerNoAccessException();

      const json = exception.toJson();

      expect(json).toEqual({
        code: 404,
        message: 'Please check OpenTool Server is RUNNING or NOT'
      });
    });
  });

  describe('properties', () => {
    it('should have readonly code property', () => {
      const exception = new OpenToolServerNoAccessException();

      expect(() => {
        (exception as any).code = 500;
      }).toThrow();
    });

    it('should have readonly message property', () => {
      const exception = new OpenToolServerNoAccessException();

      expect(() => {
        (exception as any).message = 'Different message';
      }).toThrow();
    });
  });

  describe('usage scenarios', () => {
    it('should be thrown when server is unreachable', () => {
      const throwException = () => {
        throw new OpenToolServerNoAccessException();
      };

      expect(throwException).toThrow(OpenToolServerNoAccessException);
      expect(throwException).toThrow('Please check OpenTool Server is RUNNING or NOT');
    });
  });
});

describe('OpenToolServerCallException', () => {
  describe('constructor', () => {
    it('should create exception with custom message', () => {
      const customMessage = 'Function not found';
      const exception = new OpenToolServerCallException(customMessage);

      expect(exception.message).toBe(customMessage);
      expect(exception.name).toBe('OpenToolServerCallException');
    });

    it('should extend Error', () => {
      const exception = new OpenToolServerCallException('Test error');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(OpenToolServerCallException);
    });

    it('should handle empty string message', () => {
      const exception = new OpenToolServerCallException('');

      expect(exception.message).toBe('');
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long error message '.repeat(10);
      const exception = new OpenToolServerCallException(longMessage);

      expect(exception.message).toBe(longMessage);
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: 💥 Function failed with status 🔥 (code: -32602)';
      const exception = new OpenToolServerCallException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });
  });

  describe('toJson', () => {
    it('should serialize exception to JSON', () => {
      const exception = new OpenToolServerCallException('Invalid parameters provided');

      const json = exception.toJson();

      expect(json).toEqual({
        message: 'Invalid parameters provided'
      });
    });

    it('should serialize empty message', () => {
      const exception = new OpenToolServerCallException('');

      const json = exception.toJson();

      expect(json).toEqual({
        message: ''
      });
    });

    it('should handle null/undefined message gracefully', () => {
      const exception1 = new OpenToolServerCallException(null as any);
      const exception2 = new OpenToolServerCallException(undefined as any);

      expect(exception1.toJson().message).toBeNull();
      expect(exception2.toJson().message).toBeUndefined();
    });
  });

  describe('properties', () => {
    it('should have readonly message property', () => {
      const exception = new OpenToolServerCallException('Original message');

      expect(() => {
        (exception as any).message = 'Modified message';
      }).toThrow();
    });

    it('should not have code property unlike other exceptions', () => {
      const exception = new OpenToolServerCallException('Test error');

      expect(exception).not.toHaveProperty('code');
      expect((exception as any).code).toBeUndefined();
    });
  });

  describe('different message types', () => {
    it('should handle JSON error messages', () => {
      const jsonError = JSON.stringify({ error: 'Invalid request', code: -32602 });
      const exception = new OpenToolServerCallException(jsonError);

      expect(exception.message).toBe(jsonError);
      expect(() => JSON.parse(exception.message)).not.toThrow();
    });

    it('should handle multiline messages', () => {
      const multilineMessage = `Error occurred:
      Line 1: Invalid parameter
      Line 2: Missing required field
      Line 3: Validation failed`;
      
      const exception = new OpenToolServerCallException(multilineMessage);

      expect(exception.message).toBe(multilineMessage);
      expect(exception.message.split('\n')).toHaveLength(4);
    });

    it('should preserve original message formatting', () => {
      const formattedMessage = '  Indented error message  ';
      const exception = new OpenToolServerCallException(formattedMessage);

      expect(exception.message).toBe(formattedMessage);
    });
  });
});

describe('Exception hierarchy', () => {
  it('should all extend Error', () => {
    const exceptions = [
      new ResponseNullException(404),
      new ErrorNullException(500),
      new OpenToolServerUnauthorizedException(),
      new OpenToolServerNoAccessException(),
      new OpenToolServerCallException('Test')
    ];

    exceptions.forEach(exception => {
      expect(exception).toBeInstanceOf(Error);
    });
  });

  it('should have unique names', () => {
    const exceptions = [
      new ResponseNullException(404),
      new ErrorNullException(500),
      new OpenToolServerUnauthorizedException(),
      new OpenToolServerNoAccessException(),
      new OpenToolServerCallException('Test')
    ];

    const names = exceptions.map(e => e.name);
    const uniqueNames = [...new Set(names)];

    expect(names).toHaveLength(uniqueNames.length);
  });

  it('should be distinguishable by instanceof', () => {
    const response = new ResponseNullException(404);
    const error = new ErrorNullException(500);
    const unauth = new OpenToolServerUnauthorizedException();
    const noAccess = new OpenToolServerNoAccessException();
    const call = new OpenToolServerCallException('Test');

    expect(response instanceof ResponseNullException).toBe(true);
    expect(response instanceof ErrorNullException).toBe(false);
    
    expect(error instanceof ErrorNullException).toBe(true);
    expect(error instanceof ResponseNullException).toBe(false);
    
    expect(unauth instanceof OpenToolServerUnauthorizedException).toBe(true);
    expect(unauth instanceof OpenToolServerNoAccessException).toBe(false);
    
    expect(noAccess instanceof OpenToolServerNoAccessException).toBe(true);
    expect(noAccess instanceof OpenToolServerUnauthorizedException).toBe(false);
    
    expect(call instanceof OpenToolServerCallException).toBe(true);
    expect(call instanceof OpenToolServerNoAccessException).toBe(false);
  });

  it('should all have toJson method', () => {
    const exceptions = [
      new ResponseNullException(404),
      new ErrorNullException(500),
      new OpenToolServerUnauthorizedException(),
      new OpenToolServerNoAccessException(),
      new OpenToolServerCallException('Test')
    ];

    exceptions.forEach(exception => {
      expect(typeof exception.toJson).toBe('function');
      expect(exception.toJson()).toBeDefined();
      expect(typeof exception.toJson()).toBe('object');
    });
  });
});