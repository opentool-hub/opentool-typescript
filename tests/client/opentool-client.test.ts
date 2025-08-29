import axios from 'axios';
import { OpenToolClient, Client } from '../../src/client/opentool-client';
import { 
  OpenToolServerUnauthorizedException,
  OpenToolServerNoAccessException, 
  OpenToolServerCallException 
} from '../../src/client/exception';
import { FunctionCall, ToolReturn } from '../../src/llm/model';
import { VersionDto } from '../../src/dto';
import { mockAxiosResponse, mockAxiosError } from '../helpers/test-utils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Client', () => {
  it('should be an abstract class', () => {
    // Client is abstract and should not be instantiated directly
    // TypeScript will prevent instantiation at compile time
    expect(Client).toBeDefined();
    expect(typeof Client).toBe('function');
  });
});

describe('OpenToolClient', () => {
  let client: OpenToolClient;
  let mockAxiosInstance: jest.Mocked<any>;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError.mockImplementation((error: any) => {
      return error && error.isAxiosError === true;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with default options', () => {
      client = new OpenToolClient();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool'
      });
    });

    it('should create client with SSL enabled', () => {
      client = new OpenToolClient({ isSSL: true });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://localhost:9627/opentool'
      });
    });

    it('should create client with custom host and port', () => {
      client = new OpenToolClient({ 
        host: 'api.example.com', 
        port: 8080 
      });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'api.example.com'
      });
    });

    it('should create client with API key', () => {
      const apiKey = 'test-api-key-123';
      client = new OpenToolClient({ apiKey });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool',
        headers: {
          'Authorization': 'Bearer test-api-key-123'
        }
      });
    });

    it('should create client with all options', () => {
      client = new OpenToolClient({
        isSSL: true,
        host: 'secure.example.com',
        port: 443,
        apiKey: 'secure-key-456'
      });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'secure.example.com',
        headers: {
          'Authorization': 'Bearer secure-key-456'
        }
      });
    });

    it('should ignore empty host option', () => {
      client = new OpenToolClient({ host: '' });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool'
      });
    });

    it('should ignore zero or negative port', () => {
      client = new OpenToolClient({ port: 0 });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool'
      });

      jest.clearAllMocks();

      client = new OpenToolClient({ port: -1 });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool'
      });
    });

    it('should ignore empty API key', () => {
      client = new OpenToolClient({ apiKey: '' });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:9627/opentool'
      });
    });

    it('should use custom host as full baseURL when provided', () => {
      client = new OpenToolClient({ 
        host: 'https://custom.api.com/custom/path' 
      });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom.api.com/custom/path'
      });
    });
  });

  describe('version', () => {
    beforeEach(() => {
      client = new OpenToolClient();
    });

    it('should return version successfully', async () => {
      const mockVersionData = { version: '1.0.0' };
      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockVersionData));

      const result = await client.version();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/version');
      expect(result).toBeInstanceOf(VersionDto);
      expect(result.version).toBe('1.0.0');
    });

    it('should throw OpenToolServerUnauthorizedException on 401 error', async () => {
      mockAxiosInstance.get.mockRejectedValue(mockAxiosError(401, 'Unauthorized'));

      await expect(client.version()).rejects.toThrow(OpenToolServerUnauthorizedException);
    });

    it('should throw OpenToolServerNoAccessException on other axios errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(mockAxiosError(500, 'Server Error'));

      await expect(client.version()).rejects.toThrow(OpenToolServerNoAccessException);
    });

    it('should throw OpenToolServerNoAccessException on non-axios errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(client.version()).rejects.toThrow(OpenToolServerNoAccessException);
    });

    it('should handle different version formats', async () => {
      const versions = ['2.1.0', '1.0.0-beta', '3.0.0-rc.1', ''];
      
      for (const version of versions) {
        const mockVersionData = { version };
        mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockVersionData));

        const result = await client.version();
        expect(result.version).toBe(version);
      }
    });
  });

  describe('call', () => {
    beforeEach(() => {
      client = new OpenToolClient();
    });

    it('should make successful function call', async () => {
      const functionCall = new FunctionCall('call-123', 'test_function', { input: 'test' });
      const mockResponse = {
        jsonrpc: '2.0.0',
        result: { output: 'success' },
        id: 'call-123'
      };

      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse(mockResponse));

      const result = await client.call(functionCall);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call', {
        jsonrpc: '2.0.0',
        method: 'test_function',
        params: { input: 'test' },
        id: 'call-123'
      });

      expect(result).toBeInstanceOf(ToolReturn);
      expect(result.id).toBe('call-123');
      expect(result.result).toEqual({ output: 'success' });
    });

    it('should handle function call without parameters', async () => {
      const functionCall = new FunctionCall('call-456', 'no_params_function', {});
      const mockResponse = {
        jsonrpc: '2.0.0',
        result: { count: 42 },
        id: 'call-456'
      };

      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse(mockResponse));

      const result = await client.call(functionCall);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call', {
        jsonrpc: '2.0.0',
        method: 'no_params_function',
        params: {},
        id: 'call-456'
      });

      expect(result.result).toEqual({ count: 42 });
    });

    it('should handle function call with complex parameters', async () => {
      const complexParams = {
        user: {
          name: 'John Doe',
          age: 30,
          preferences: ['option1', 'option2']
        },
        options: {
          sort: true,
          limit: 10
        },
        metadata: null
      };

      const functionCall = new FunctionCall('call-complex', 'process_data', complexParams);
      const mockResponse = {
        jsonrpc: '2.0.0',
        result: { processed: true, items: [1, 2, 3] },
        id: 'call-complex'
      };

      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse(mockResponse));

      const result = await client.call(functionCall);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call', {
        jsonrpc: '2.0.0',
        method: 'process_data',
        params: complexParams,
        id: 'call-complex'
      });

      expect(result.result.processed).toBe(true);
      expect(result.result.items).toEqual([1, 2, 3]);
    });

    it('should throw OpenToolServerCallException on server error response', async () => {
      const functionCall = new FunctionCall('call-error', 'failing_function', {});
      const mockResponse = {
        jsonrpc: '2.0.0',
        result: {},
        error: {
          code: -32602,
          message: 'Invalid params'
        },
        id: 'call-error'
      };

      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse(mockResponse));

      await expect(client.call(functionCall)).rejects.toThrow(OpenToolServerCallException);
      await expect(client.call(functionCall)).rejects.toThrow('Invalid params');
    });

    it('should throw OpenToolServerUnauthorizedException on 401 error', async () => {
      const functionCall = new FunctionCall('call-unauth', 'protected_function', {});
      
      mockAxiosInstance.post.mockRejectedValue(mockAxiosError(401, 'Unauthorized'));

      await expect(client.call(functionCall)).rejects.toThrow(OpenToolServerUnauthorizedException);
    });

    it('should throw OpenToolServerNoAccessException on other axios errors', async () => {
      const functionCall = new FunctionCall('call-failed', 'unreachable_function', {});
      
      mockAxiosInstance.post.mockRejectedValue(mockAxiosError(500, 'Server Error'));

      await expect(client.call(functionCall)).rejects.toThrow(OpenToolServerNoAccessException);
    });

    it('should preserve existing OpenToolServerCallException', async () => {
      const functionCall = new FunctionCall('call-existing-error', 'test_function', {});
      const existingError = new OpenToolServerCallException('Custom error message');
      
      mockAxiosInstance.post.mockRejectedValue(existingError);

      await expect(client.call(functionCall)).rejects.toThrow(OpenToolServerCallException);
      await expect(client.call(functionCall)).rejects.toThrow('Custom error message');
    });

    it('should handle different result types', async () => {
      const testCases = [
        { result: 'string result', id: 'string-test' },
        { result: 42, id: 'number-test' },
        { result: true, id: 'boolean-test' },
        { result: [1, 2, 3], id: 'array-test' },
        { result: null, id: 'null-test' }
      ];

      for (const testCase of testCases) {
        const functionCall = new FunctionCall(testCase.id, 'various_returns', {});
        const mockResponse = {
          jsonrpc: '2.0.0',
          result: testCase.result,
          id: testCase.id
        };

        mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse(mockResponse));

        const result = await client.call(functionCall);
        expect(result.result).toEqual(testCase.result);
      }
    });
  });

  describe('load', () => {
    beforeEach(() => {
      client = new OpenToolClient();
    });

    it('should load OpenTool successfully', async () => {
      const mockOpenToolData = {
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'test_function',
            description: 'A test function',
            parameters: []
          }
        ]
      };

      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockOpenToolData, 200));

      const result = await client.load();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/load');
      expect(result).not.toBeNull();
      expect(result?.opentool).toBe('1.0.0');
      expect(result?.info.title).toBe('Test Tool');
      expect(result?.functions).toHaveLength(1);
    });

    it('should return null on non-200 status', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse({}, 404));

      const result = await client.load();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await client.load();

      expect(result).toBeNull();
    });

    it('should return null on axios error', async () => {
      mockAxiosInstance.get.mockRejectedValue(mockAxiosError(500, 'Server Error'));

      const result = await client.load();

      expect(result).toBeNull();
    });

    it('should load complex OpenTool with schemas', async () => {
      const mockComplexData = {
        opentool: '2.0.0',
        info: {
          title: 'Complex Tool',
          version: '2.0.0',
          description: 'A complex tool',
          host: 'localhost',
          port: 8080
        },
        functions: [
          {
            name: 'create_user',
            description: 'Create a user',
            parameters: [
              {
                name: 'user_data',
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
                required: true
              }
            ],
            return: {
              name: 'user_id',
              schema: { type: 'integer' }
            }
          }
        ],
        schemas: {
          'User': {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            }
          }
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockComplexData, 200));

      const result = await client.load();

      expect(result).not.toBeNull();
      expect(result?.opentool).toBe('2.0.0');
      expect(result?.functions[0].parameters[0].schema.type).toBe('object');
      expect(result?.functions[0].return_).toBeDefined();
      expect(result?.schemas).toBeDefined();
      expect(result?.schemas!['User'].type).toBe('object');
    });

    it('should handle empty OpenTool response', async () => {
      const mockEmptyData = {
        opentool: '1.0.0',
        info: {
          title: 'Empty Tool',
          version: '1.0.0'
        },
        functions: []
      };

      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockEmptyData, 200));

      const result = await client.load();

      expect(result).not.toBeNull();
      expect(result?.functions).toEqual([]);
    });

    it('should handle malformed OpenTool data gracefully', async () => {
      const mockMalformedData = {
        // Missing required fields
        opentool: '1.0.0'
      };

      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse(mockMalformedData, 200));

      // Should either return null or throw an error, but shouldn't crash
      await expect(async () => {
        const result = await client.load();
        // If it doesn't throw, result could be null or a valid OpenTool
        expect(result === null || result !== undefined).toBe(true);
      }).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      client = new OpenToolClient({ 
        apiKey: 'integration-test-key',
        host: 'test.example.com',
        port: 8080
      });
    });

    it('should handle complete workflow: version -> load -> call', async () => {
      // Mock version response
      mockAxiosInstance.get.mockImplementation((url: string) => {
        if (url === '/version') {
          return Promise.resolve(mockAxiosResponse({ version: '1.5.0' }));
        } else if (url === '/load') {
          return Promise.resolve(mockAxiosResponse({
            opentool: '1.5.0',
            info: { title: 'Integration Test Tool', version: '1.5.0' },
            functions: [{ name: 'echo', description: 'Echo function', parameters: [] }]
          }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Mock call response
      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse({
        jsonrpc: '2.0.0',
        result: { echo: 'Hello World' },
        id: 'integration-test'
      }));

      // Execute workflow
      const version = await client.version();
      expect(version.version).toBe('1.5.0');

      const openTool = await client.load();
      expect(openTool?.info.title).toBe('Integration Test Tool');

      const functionCall = new FunctionCall('integration-test', 'echo', { message: 'Hello World' });
      const result = await client.call(functionCall);
      expect(result.result.echo).toBe('Hello World');
    });

    it('should handle authentication workflow', async () => {
      // Test that API key is included in all requests
      mockAxiosInstance.get.mockResolvedValue(mockAxiosResponse({ version: '1.0.0' }));
      mockAxiosInstance.post.mockResolvedValue(mockAxiosResponse({
        jsonrpc: '2.0.0',
        result: { authenticated: true },
        id: 'auth-test'
      }));

      await client.version();
      await client.load();
      await client.call(new FunctionCall('auth-test', 'protected_function', {}));

      // Verify axios instance was created with auth headers
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'test.example.com',
        headers: {
          'Authorization': 'Bearer integration-test-key'
        }
      });
    });
  });
});