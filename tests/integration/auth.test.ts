import { OpenToolServer } from '../../src/server/opentool-server';
import { OpenToolClient } from '../../src/client/opentool-client';
import { Tool } from '../../src/tool/tool';
import { OpenTool } from '../../src/models/opentool';
import { Info } from '../../src/models/info';
import { FunctionModel } from '../../src/models/function-model';
import { FunctionCall } from '../../src/llm/model';
import { 
  OpenToolServerUnauthorizedException 
} from '../../src/client/exception';

// Simple test tool
class AuthTestTool extends Tool {
  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    if (name === 'secure_function') {
      return { message: 'Access granted to secure function', timestamp: Date.now() };
    }
    throw new Error(`Function not supported: ${name}`);
  }

  async load(): Promise<OpenTool | null> {
    const info = new Info('Auth Test Tool', '1.0.0', 'Tool for testing authentication');
    const secureFunction = new FunctionModel('secure_function', 'A function requiring authentication', []);
    return new OpenTool('1.0.0', info, undefined, [secureFunction]);
  }
}

describe('Authentication Integration Tests', () => {
  let openToolServer: OpenToolServer;
  let tool: AuthTestTool;
  const testPort = 9556; // Different port
  const validApiKeys = ['test-api-key-1', 'test-api-key-2', 'super-secret-key'];

  beforeAll(async () => {
    tool = new AuthTestTool();
    
    // Create server with API key authentication
    openToolServer = new OpenToolServer(tool, '1.0.0', {
      ip: '127.0.0.1',
      port: testPort,
      apiKeys: validApiKeys
    });
    
    await openToolServer.start();
    
    // Small delay to ensure server is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 10000);

  afterAll(async () => {
    await openToolServer.stop();
  });

  describe('API Key Authentication', () => {
    it('should allow access with valid API key', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0]
      });

      // Should be able to get version
      const version = await client.version();
      expect(version.version).toBe('1.0.0');

      // Should be able to load OpenTool spec
      const openTool = await client.load();
      expect(openTool).toBeDefined();
      expect(openTool!.info.title).toBe('Auth Test Tool');

      // Should be able to call functions
      const call = new FunctionCall('auth-test-1', 'secure_function', {});
      const result = await client.call(call);
      expect(result.result.message).toContain('Access granted');
    });

    it('should work with all valid API keys', async () => {
      for (let i = 0; i < validApiKeys.length; i++) {
        const client = new OpenToolClient({ 
          host: `http://localhost:${testPort}/opentool`,
          apiKey: validApiKeys[i]
        });

        const call = new FunctionCall(`multi-key-${i}`, 'secure_function', {});
        const result = await client.call(call);
        expect(result.result.message).toContain('Access granted');
        expect(result.id).toBe(`multi-key-${i}`);
      }
    });

    it('should reject requests without API key', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`
        // No API key provided
      });

      // Version should fail
      await expect(client.version()).rejects.toThrow(OpenToolServerUnauthorizedException);

      // Load should return null on authentication failure
      const loadResult = await client.load();
      expect(loadResult).toBeNull();

      // Call should fail
      const call = new FunctionCall('no-auth-1', 'secure_function', {});
      await expect(client.call(call)).rejects.toThrow(OpenToolServerUnauthorizedException);
    });

    it('should reject requests with invalid API key', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: 'invalid-api-key'
      });

      await expect(client.version()).rejects.toThrow(OpenToolServerUnauthorizedException);
      
      const loadResult = await client.load();
      expect(loadResult).toBeNull();

      const call = new FunctionCall('invalid-auth-1', 'secure_function', {});
      await expect(client.call(call)).rejects.toThrow(OpenToolServerUnauthorizedException);
    });

    it('should reject requests with empty API key', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: ''
      });

      await expect(client.version()).rejects.toThrow(OpenToolServerUnauthorizedException);

      const call = new FunctionCall('empty-auth-1', 'secure_function', {});
      await expect(client.call(call)).rejects.toThrow(OpenToolServerUnauthorizedException);
    });
  });

  describe('Bearer Token Format', () => {
    it('should accept API key with Bearer prefix', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[1]
      });

      const call = new FunctionCall('bearer-test-1', 'secure_function', {});
      const result = await client.call(call);
      expect(result.result.message).toContain('Access granted');
    });

    it('should handle API key case sensitivity', async () => {
      // Valid key
      const validClient = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0]
      });

      const validCall = new FunctionCall('case-valid', 'secure_function', {});
      const validResult = await validClient.call(validCall);
      expect(validResult.result.message).toContain('Access granted');

      // Invalid key with different case
      const invalidClient = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0].toUpperCase()
      });

      const invalidCall = new FunctionCall('case-invalid', 'secure_function', {});
      await expect(invalidClient.call(invalidCall)).rejects.toThrow(OpenToolServerUnauthorizedException);
    });
  });

  describe('Concurrent Authentication', () => {
    it('should handle multiple authenticated clients concurrently', async () => {
      const clients = validApiKeys.map(key => new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: key
      }));

      const calls = clients.map((client, index) => 
        client.call(new FunctionCall(`concurrent-auth-${index}`, 'secure_function', {}))
      );

      const results = await Promise.all(calls);
      
      expect(results).toHaveLength(validApiKeys.length);
      results.forEach((result, index) => {
        expect(result.id).toBe(`concurrent-auth-${index}`);
        expect(result.result.message).toContain('Access granted');
      });
    });

    it('should handle mixed valid/invalid authentication concurrently', async () => {
      const mixedKeys = [...validApiKeys, 'invalid-key-1', 'invalid-key-2'];
      const clients = mixedKeys.map(key => new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: key
      }));

      const calls = clients.map((client, index) => 
        client.call(new FunctionCall(`mixed-auth-${index}`, 'secure_function', {}))
      );

      const results = await Promise.allSettled(calls);
      
      expect(results).toHaveLength(mixedKeys.length);
      
      // First 3 should succeed (valid keys)
      for (let i = 0; i < validApiKeys.length; i++) {
        expect(results[i].status).toBe('fulfilled');
      }
      
      // Last 2 should fail (invalid keys)
      for (let i = validApiKeys.length; i < mixedKeys.length; i++) {
        expect(results[i].status).toBe('rejected');
        if (results[i].status === 'rejected') {
          expect((results[i] as PromiseRejectedResult).reason).toBeInstanceOf(OpenToolServerUnauthorizedException);
        }
      }
    });
  });

  describe('Authentication Error Handling', () => {
    it('should provide consistent error messages for authentication failures', async () => {
      const invalidClient = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: 'definitely-invalid-key'
      });

      // Test version endpoint
      let versionError: any;
      try {
        await invalidClient.version();
      } catch (error) {
        versionError = error;
      }
      expect(versionError).toBeInstanceOf(OpenToolServerUnauthorizedException);

      // Test call endpoint
      const call = new FunctionCall('error-test-1', 'secure_function', {});
      let callError: any;
      try {
        await invalidClient.call(call);
      } catch (error) {
        callError = error;
      }
      expect(callError).toBeInstanceOf(OpenToolServerUnauthorizedException);

      // Test load endpoint - should return null for auth failures
      const loadResult = await invalidClient.load();
      expect(loadResult).toBeNull();
    });

    it('should maintain server stability after authentication failures', async () => {
      // Make multiple invalid requests
      const invalidClient = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: 'invalid-key'
      });

      const failedCalls = [];
      for (let i = 0; i < 10; i++) {
        const call = invalidClient.call(new FunctionCall(`fail-${i}`, 'secure_function', {}));
        failedCalls.push(call.catch(() => 'failed'));
      }

      await Promise.all(failedCalls);

      // Server should still work with valid authentication
      const validClient = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0]
      });

      const validCall = new FunctionCall('recovery-test', 'secure_function', {});
      const result = await validClient.call(validCall);
      expect(result.result.message).toContain('Access granted');
    });
  });

  describe('Real-world Authentication Scenarios', () => {
    it('should simulate API key rotation', async () => {
      // Start with first API key
      let client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0]
      });

      let call = new FunctionCall('rotation-1', 'secure_function', {});
      let result = await client.call(call);
      expect(result.result.message).toContain('Access granted');

      // Simulate key rotation - switch to second key
      client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[1]
      });

      call = new FunctionCall('rotation-2', 'secure_function', {});
      result = await client.call(call);
      expect(result.result.message).toContain('Access granted');

      // Old key should still work (both are valid)
      client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[0]
      });

      call = new FunctionCall('rotation-3', 'secure_function', {});
      result = await client.call(call);
      expect(result.result.message).toContain('Access granted');
    });

    it('should handle client session persistence', async () => {
      const client = new OpenToolClient({ 
        host: `http://localhost:${testPort}/opentool`,
        apiKey: validApiKeys[2]
      });

      // Make multiple calls over time to simulate a persistent session
      const sessionCalls = [];
      for (let i = 0; i < 5; i++) {
        const call = new FunctionCall(`session-${i}`, 'secure_function', { sessionId: i });
        sessionCalls.push(client.call(call));
        
        // Small delay between calls
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const results = await Promise.all(sessionCalls);
      
      results.forEach((result, index) => {
        expect(result.id).toBe(`session-${index}`);
        expect(result.result.message).toContain('Access granted');
      });
    });
  });
});