import axios from 'axios';
import { DaemonClient, DAEMON_DEFAULT_PORT, DAEMON_DEFAULT_PREFIX } from '../../src/daemon/client';
import { RegisterInfo, RegisterResult } from '../../src/daemon/dto';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DaemonClient', () => {
  let client: DaemonClient;
  let mockAxiosInstance: jest.Mocked<any>;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constants', () => {
    it('should define correct default values', () => {
      expect(DAEMON_DEFAULT_PORT).toBe(19627);
      expect(DAEMON_DEFAULT_PREFIX).toBe('/opentool-daemon');
    });
  });

  describe('constructor', () => {
    it('should create client with default port', () => {
      client = new DaemonClient();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:19627/opentool-daemon',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    });

    it('should create client with custom port', () => {
      client = new DaemonClient(8080);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/opentool-daemon',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    });

    it('should ignore zero or negative port', () => {
      client = new DaemonClient(0);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:19627/opentool-daemon',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      jest.clearAllMocks();

      client = new DaemonClient(-1);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:19627/opentool-daemon',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
    });
  });

  describe('register', () => {
    beforeEach(() => {
      client = new DaemonClient();
    });

    it('should register successfully', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234,
        ['api-key-1']
      );

      const mockResponse = {
        data: {
          id: 'daemon-12345',
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.register(registerInfo);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/register', registerInfo);
      expect(result).toBeInstanceOf(RegisterResult);
      expect(result.id).toBe('daemon-12345');
      expect(result.error).toBeNull();
    });

    it('should handle registration with error response', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      const mockResponse = {
        data: {
          id: '-1',
          error: 'Registration failed: Port already in use'
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.register(registerInfo);

      expect(result.id).toBe('-1');
      expect(result.error).toBe('Registration failed: Port already in use');
    });

    it('should handle network errors', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      const networkError = new Error('Network Error');
      mockAxiosInstance.post.mockRejectedValue(networkError);

      const result = await client.register(registerInfo);

      expect(result.id).toBe('-1');
      expect(result.error).toBe('Network Error');
    });

    it('should handle axios errors with custom message', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      const axiosError: any = new Error('Connection refused');
      axiosError.response = { status: 500, data: { message: 'Server error' } };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const result = await client.register(registerInfo);

      expect(result.id).toBe('-1');
      expect(result.error).toBe('Connection refused');
    });

    it('should handle unknown errors', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      mockAxiosInstance.post.mockRejectedValue({});

      const result = await client.register(registerInfo);

      expect(result.id).toBe('-1');
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle registration without API keys', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      const mockResponse = {
        data: {
          id: 'daemon-no-keys',
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.register(registerInfo);

      expect(result.id).toBe('daemon-no-keys');
      expect(result.error).toBeNull();
    });

    it('should handle registration with multiple API keys', async () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234,
        ['key1', 'key2', 'key3']
      );

      const mockResponse = {
        data: {
          id: 'daemon-multi-keys',
          error: null
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.register(registerInfo);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/register', registerInfo);
      expect(result.id).toBe('daemon-multi-keys');
    });
  });

  describe('integration scenarios', () => {
    it('should work with different daemon ports', async () => {
      const customClient = new DaemonClient(8000);
      const registerInfo = new RegisterInfo(
        '/custom/tool.js',
        'localhost',
        9000,
        '/custom',
        5678
      );

      const mockResponse = {
        data: { id: 'custom-daemon', error: null }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await customClient.register(registerInfo);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8000/opentool-daemon'
        })
      );
      expect(result.id).toBe('custom-daemon');
    });

    it('should handle timeout scenarios', async () => {
      // Create a new client to avoid mock interference
      const timeoutClient = new DaemonClient();
      
      const registerInfo = new RegisterInfo(
        '/timeout/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      const timeoutError: any = new Error('timeout of 5000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      const result = await timeoutClient.register(registerInfo);

      expect(result.id).toBe('-1');
      expect(result.error).toBe('timeout of 5000ms exceeded');
    });
  });
});

describe('RegisterInfo', () => {
  describe('constructor', () => {
    it('should create RegisterInfo with required fields', () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234
      );

      expect(registerInfo.file).toBe('/path/to/tool.js');
      expect(registerInfo.host).toBe('localhost');
      expect(registerInfo.port).toBe(9627);
      expect(registerInfo.prefix).toBe('/opentool');
      expect(registerInfo.pid).toBe(1234);
      expect(registerInfo.apiKeys).toBeUndefined();
    });

    it('should create RegisterInfo with API keys', () => {
      const apiKeys = ['key1', 'key2'];
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234,
        apiKeys
      );

      expect(registerInfo.apiKeys).toBe(apiKeys);
      expect(registerInfo.apiKeys).toEqual(['key1', 'key2']);
    });

    it('should handle empty API keys array', () => {
      const registerInfo = new RegisterInfo(
        '/path/to/tool.js',
        'localhost',
        9627,
        '/opentool',
        1234,
        []
      );

      expect(registerInfo.apiKeys).toEqual([]);
    });

    it('should handle different file paths', () => {
      const testCases = [
        '/absolute/path/tool.js',
        './relative/path/tool.js',
        'C:\\Windows\\path\\tool.js',
        'tool.js'
      ];

      testCases.forEach(filePath => {
        const registerInfo = new RegisterInfo(
          filePath,
          'localhost',
          9627,
          '/opentool',
          1234
        );

        expect(registerInfo.file).toBe(filePath);
      });
    });

    it('should handle different hosts', () => {
      const testCases = [
        'localhost',
        '127.0.0.1',
        '192.168.1.100',
        'api.example.com'
      ];

      testCases.forEach(host => {
        const registerInfo = new RegisterInfo(
          '/tool.js',
          host,
          9627,
          '/opentool',
          1234
        );

        expect(registerInfo.host).toBe(host);
      });
    });

    it('should handle different ports', () => {
      const testCases = [80, 443, 3000, 8080, 9627];

      testCases.forEach(port => {
        const registerInfo = new RegisterInfo(
          '/tool.js',
          'localhost',
          port,
          '/opentool',
          1234
        );

        expect(registerInfo.port).toBe(port);
      });
    });
  });
});

describe('RegisterResult', () => {
  describe('constructor', () => {
    it('should create RegisterResult with success', () => {
      const result = new RegisterResult('success-id-123');

      expect(result.id).toBe('success-id-123');
      expect(result.error).toBeUndefined();
    });

    it('should create RegisterResult with error', () => {
      const result = new RegisterResult('-1', 'Registration failed');

      expect(result.id).toBe('-1');
      expect(result.error).toBe('Registration failed');
    });

    it('should create RegisterResult with null error', () => {
      const result = new RegisterResult('success-id', null as any);

      expect(result.id).toBe('success-id');
      expect(result.error).toBeNull();
    });

    it('should handle empty error string', () => {
      const result = new RegisterResult('id-with-empty-error', '');

      expect(result.id).toBe('id-with-empty-error');
      expect(result.error).toBe('');
    });

    it('should handle long error messages', () => {
      const longError = 'This is a very long error message that describes in detail what went wrong during the registration process. It includes technical details and suggestions for resolution.';
      const result = new RegisterResult('-1', longError);

      expect(result.error).toBe(longError);
    });
  });

  describe('success detection', () => {
    it('should indicate success when no error', () => {
      const successResult = new RegisterResult('success-123');

      expect(successResult.error).toBeUndefined();
      expect(!successResult.error).toBe(true);
    });

    it('should indicate failure when error present', () => {
      const failureResult = new RegisterResult('-1', 'Failed to register');

      expect(failureResult.error).toBeDefined();
      expect(!!failureResult.error).toBe(true);
    });
  });
});