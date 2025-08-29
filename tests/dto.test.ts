import {
  VersionDto,
  JsonRPCHttpRequestBody,
  JsonRPCHttpResponseBody,
  JsonRPCHttpResponseBodyError,
  JSONRPC_VERSION,
  DEFAULT_PORT,
  DEFAULT_PREFIX
} from '../src/dto';

describe('Constants', () => {
  it('should define correct constant values', () => {
    expect(JSONRPC_VERSION).toBe('2.0.0');
    expect(DEFAULT_PORT).toBe(9627);
    expect(DEFAULT_PREFIX).toBe('/opentool');
  });
});

describe('VersionDto', () => {
  describe('constructor', () => {
    it('should create VersionDto with version', () => {
      const versionDto = new VersionDto('1.0.0');

      expect(versionDto.version).toBe('1.0.0');
    });

    it('should handle empty version string', () => {
      const versionDto = new VersionDto('');

      expect(versionDto.version).toBe('');
    });
  });

  describe('fromJson', () => {
    it('should create VersionDto from JSON', () => {
      const json = { version: '2.1.0' };

      const versionDto = VersionDto.fromJson(json);

      expect(versionDto.version).toBe('2.1.0');
    });

    it('should handle null version', () => {
      const json = { version: null };

      const versionDto = VersionDto.fromJson(json);

      expect(versionDto.version).toBeNull();
    });

    it('should handle undefined version', () => {
      const json = { version: undefined };

      const versionDto = VersionDto.fromJson(json);

      expect(versionDto.version).toBeUndefined();
    });
  });

  describe('toJson', () => {
    it('should serialize VersionDto to JSON', () => {
      const versionDto = new VersionDto('1.5.0');

      const json = versionDto.toJson();

      expect(json).toEqual({ version: '1.5.0' });
    });

    it('should serialize empty version', () => {
      const versionDto = new VersionDto('');

      const json = versionDto.toJson();

      expect(json).toEqual({ version: '' });
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalVersion = '3.14.159';
      const originalJson = { version: originalVersion };

      const versionDto1 = VersionDto.fromJson(originalJson);
      const serialized = versionDto1.toJson();
      const versionDto2 = VersionDto.fromJson(serialized);

      expect(versionDto2.version).toBe(originalVersion);
    });
  });
});

describe('JsonRPCHttpRequestBody', () => {
  describe('constructor', () => {
    it('should create request body with required fields', () => {
      const request = new JsonRPCHttpRequestBody('test_method', 'test-id');

      expect(request.jsonrpc).toBe(JSONRPC_VERSION);
      expect(request.method).toBe('test_method');
      expect(request.id).toBe('test-id');
      expect(request.params).toBeUndefined();
    });

    it('should create request body with all fields', () => {
      const params = { key: 'value', number: 42 };
      const request = new JsonRPCHttpRequestBody('test_method', 'test-id', params);

      expect(request.jsonrpc).toBe(JSONRPC_VERSION);
      expect(request.method).toBe('test_method');
      expect(request.id).toBe('test-id');
      expect(request.params).toBe(params);
    });

    it('should handle empty params object', () => {
      const request = new JsonRPCHttpRequestBody('test_method', 'test-id', {});

      expect(request.params).toEqual({});
    });
  });

  describe('fromJson', () => {
    it('should create request from JSON with required fields', () => {
      const json = {
        jsonrpc: '2.0.0',
        method: 'get_user',
        id: 'req-123'
      };

      const request = JsonRPCHttpRequestBody.fromJson(json);

      expect(request.jsonrpc).toBe('2.0.0');
      expect(request.method).toBe('get_user');
      expect(request.id).toBe('req-123');
      expect(request.params).toBeUndefined();
    });

    it('should create request from JSON with all fields', () => {
      const json = {
        jsonrpc: '2.0.0',
        method: 'create_user',
        params: { name: 'John', age: 30 },
        id: 'req-456'
      };

      const request = JsonRPCHttpRequestBody.fromJson(json);

      expect(request.jsonrpc).toBe('2.0.0');
      expect(request.method).toBe('create_user');
      expect(request.params).toEqual({ name: 'John', age: 30 });
      expect(request.id).toBe('req-456');
    });

    it('should handle complex params object', () => {
      const json = {
        jsonrpc: '2.0.0',
        method: 'process_data',
        params: {
          data: [1, 2, 3],
          options: {
            sort: true,
            filter: 'active'
          },
          callback: null
        },
        id: 'req-complex'
      };

      const request = JsonRPCHttpRequestBody.fromJson(json);

      expect(request.params).toEqual({
        data: [1, 2, 3],
        options: {
          sort: true,
          filter: 'active'
        },
        callback: null
      });
    });
  });

  describe('toJson', () => {
    it('should serialize request with required fields only', () => {
      const request = new JsonRPCHttpRequestBody('test_method', 'test-id');

      const json = request.toJson();

      expect(json).toEqual({
        jsonrpc: JSONRPC_VERSION,
        method: 'test_method',
        id: 'test-id'
      });
      expect(json).not.toHaveProperty('params');
    });

    it('should serialize request with all fields', () => {
      const params = { input: 'test', count: 5 };
      const request = new JsonRPCHttpRequestBody('process', 'req-789', params);

      const json = request.toJson();

      expect(json).toEqual({
        jsonrpc: JSONRPC_VERSION,
        method: 'process',
        params: { input: 'test', count: 5 },
        id: 'req-789'
      });
    });

    it('should include empty params object', () => {
      const request = new JsonRPCHttpRequestBody('no_params', 'empty-id', {});

      const json = request.toJson();

      expect(json.params).toEqual({});
    });

    it('should exclude undefined params', () => {
      const request = new JsonRPCHttpRequestBody('test', 'id', undefined);

      const json = request.toJson();

      expect(json).not.toHaveProperty('params');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in method name', () => {
      const request = new JsonRPCHttpRequestBody('method_with-special.chars', 'id');

      expect(request.method).toBe('method_with-special.chars');
    });

    it('should handle numeric id', () => {
      const request = new JsonRPCHttpRequestBody('test', '12345');

      expect(request.id).toBe('12345');
    });

    it('should handle null values in params', () => {
      const params = { nullValue: null, undefinedValue: undefined };
      const request = new JsonRPCHttpRequestBody('test', 'id', params);

      const json = request.toJson();
      expect(json.params.nullValue).toBeNull();
      expect(json.params.undefinedValue).toBeUndefined();
    });
  });
});

describe('JsonRPCHttpResponseBodyError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new JsonRPCHttpResponseBodyError(-32602, 'Invalid params');

      expect(error.code).toBe(-32602);
      expect(error.message).toBe('Invalid params');
    });

    it('should handle custom error codes', () => {
      const error = new JsonRPCHttpResponseBodyError(1000, 'Custom error');

      expect(error.code).toBe(1000);
      expect(error.message).toBe('Custom error');
    });
  });

  describe('fromJson', () => {
    it('should create error from JSON', () => {
      const json = {
        code: -32601,
        message: 'Method not found'
      };

      const error = JsonRPCHttpResponseBodyError.fromJson(json);

      expect(error.code).toBe(-32601);
      expect(error.message).toBe('Method not found');
    });

    it('should handle zero error code', () => {
      const json = {
        code: 0,
        message: 'Success error'
      };

      const error = JsonRPCHttpResponseBodyError.fromJson(json);

      expect(error.code).toBe(0);
    });
  });

  describe('toJson', () => {
    it('should serialize error to JSON', () => {
      const error = new JsonRPCHttpResponseBodyError(-32700, 'Parse error');

      const json = error.toJson();

      expect(json).toEqual({
        code: -32700,
        message: 'Parse error'
      });
    });

    it('should handle empty message', () => {
      const error = new JsonRPCHttpResponseBodyError(500, '');

      const json = error.toJson();

      expect(json.message).toBe('');
    });
  });
});

describe('JsonRPCHttpResponseBody', () => {
  describe('constructor', () => {
    it('should create response with required fields', () => {
      const result = { success: true };
      const response = new JsonRPCHttpResponseBody(result, 'resp-id');

      expect(response.jsonrpc).toBe(JSONRPC_VERSION);
      expect(response.result).toBe(result);
      expect(response.id).toBe('resp-id');
      expect(response.error).toBeUndefined();
    });

    it('should create response with error', () => {
      const result = {};
      const error = new JsonRPCHttpResponseBodyError(-32602, 'Invalid params');
      const response = new JsonRPCHttpResponseBody(result, 'resp-id', error);

      expect(response.result).toBe(result);
      expect(response.error).toBe(error);
      expect(response.id).toBe('resp-id');
    });
  });

  describe('fromJson', () => {
    it('should create response from JSON without error', () => {
      const json = {
        jsonrpc: '2.0.0',
        result: { data: 'test', count: 42 },
        id: 'response-123'
      };

      const response = JsonRPCHttpResponseBody.fromJson(json);

      expect(response.jsonrpc).toBe('2.0.0');
      expect(response.result).toEqual({ data: 'test', count: 42 });
      expect(response.id).toBe('response-123');
      expect(response.error).toBeUndefined();
    });

    it('should create response from JSON with error', () => {
      const json = {
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: -32601,
          message: 'Method not found'
        },
        id: 'error-response'
      };

      const response = JsonRPCHttpResponseBody.fromJson(json);

      expect(response.result).toEqual({});
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toBe('Method not found');
      expect(response.id).toBe('error-response');
    });

    it('should handle complex result object', () => {
      const json = {
        jsonrpc: '2.0.0',
        result: {
          users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ],
          metadata: {
            total: 2,
            page: 1
          }
        },
        id: 'complex-result'
      };

      const response = JsonRPCHttpResponseBody.fromJson(json);

      expect(response.result.users).toHaveLength(2);
      expect(response.result.metadata.total).toBe(2);
    });
  });

  describe('toJson', () => {
    it('should serialize response without error', () => {
      const result = { message: 'Success', data: [1, 2, 3] };
      const response = new JsonRPCHttpResponseBody(result, 'success-id');

      const json = response.toJson();

      expect(json).toEqual({
        jsonrpc: JSONRPC_VERSION,
        result: { message: 'Success', data: [1, 2, 3] },
        id: 'success-id'
      });
      expect(json).not.toHaveProperty('error');
    });

    it('should serialize response with error', () => {
      const result = {};
      const error = new JsonRPCHttpResponseBodyError(404, 'Resource not found');
      const response = new JsonRPCHttpResponseBody(result, 'error-id', error);

      const json = response.toJson();

      expect(json).toEqual({
        jsonrpc: JSONRPC_VERSION,
        result: {},
        error: {
          code: 404,
          message: 'Resource not found'
        },
        id: 'error-id'
      });
    });

    it('should exclude undefined error', () => {
      const response = new JsonRPCHttpResponseBody({ test: 'data' }, 'no-error-id');

      const json = response.toJson();

      expect(json).not.toHaveProperty('error');
    });

    it('should handle empty result object', () => {
      const response = new JsonRPCHttpResponseBody({}, 'empty-result');

      const json = response.toJson();

      expect(json.result).toEqual({});
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity for success response', () => {
      const originalJson = {
        jsonrpc: '2.0.0',
        result: {
          processed: true,
          items: [
            { id: 1, status: 'active' },
            { id: 2, status: 'inactive' }
          ],
          summary: {
            total: 2,
            active: 1
          }
        },
        id: 'roundtrip-test'
      };

      const response1 = JsonRPCHttpResponseBody.fromJson(originalJson);
      const serialized = response1.toJson();
      const response2 = JsonRPCHttpResponseBody.fromJson(serialized);

      expect(response2.result.processed).toBe(true);
      expect(response2.result.items).toHaveLength(2);
      expect(response2.result.summary.active).toBe(1);
      expect(response2.id).toBe('roundtrip-test');
    });

    it('should maintain data integrity for error response', () => {
      const originalJson = {
        jsonrpc: '2.0.0',
        result: null,
        error: {
          code: -32603,
          message: 'Internal error'
        },
        id: 'error-roundtrip'
      };

      const response1 = JsonRPCHttpResponseBody.fromJson(originalJson);
      const serialized = response1.toJson();
      const response2 = JsonRPCHttpResponseBody.fromJson(serialized);

      expect(response2.error).toBeDefined();
      expect(response2.error?.code).toBe(-32603);
      expect(response2.error?.message).toBe('Internal error');
      expect(response2.id).toBe('error-roundtrip');
    });
  });

  describe('edge cases', () => {
    it('should handle null result', () => {
      // @ts-ignore - Testing with null result
      const response = new JsonRPCHttpResponseBody(null, 'null-result');

      expect(response.result).toBeNull();
      
      const json = response.toJson();
      expect(json.result).toBeNull();
    });

    it('should handle array result', () => {
      // @ts-ignore - Testing with array result
      const response = new JsonRPCHttpResponseBody([1, 2, 3, 'four'], 'array-result');

      const json = response.toJson();
      expect(json.result).toEqual([1, 2, 3, 'four']);
    });

    it('should handle primitive result types', () => {
      // @ts-ignore - Testing with primitive results
      const stringResponse = new JsonRPCHttpResponseBody('hello', 'string-id');
      // @ts-ignore - Testing with primitive results
      const numberResponse = new JsonRPCHttpResponseBody(42, 'number-id');
      // @ts-ignore - Testing with primitive results
      const boolResponse = new JsonRPCHttpResponseBody(true, 'bool-id');

      expect(stringResponse.toJson().result).toBe('hello');
      expect(numberResponse.toJson().result).toBe(42);
      expect(boolResponse.toJson().result).toBe(true);
    });
  });
});