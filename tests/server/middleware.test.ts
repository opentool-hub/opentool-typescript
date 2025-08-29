import { Request, Response, NextFunction } from 'express';
import { checkAuthorization } from '../../src/server/middleware';

// Mock Express types
const createMockRequest = (headers?: any): Partial<Request> => ({
  headers: headers || {},
});

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    statusCode: 200,
    responseData: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
      res.responseData = data;
      return res;
    }),
  };
  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('checkAuthorization', () => {
  describe('middleware creation', () => {
    it('should return a middleware function', () => {
      const middleware = checkAuthorization(['key1', 'key2']);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should handle empty API keys array', () => {
      const middleware = checkAuthorization([]);

      expect(typeof middleware).toBe('function');
    });

    it('should handle single API key', () => {
      const middleware = checkAuthorization(['single-key']);

      expect(typeof middleware).toBe('function');
    });

    it('should handle multiple API keys', () => {
      const middleware = checkAuthorization(['key1', 'key2', 'key3']);

      expect(typeof middleware).toBe('function');
    });
  });

  describe('authorization checking', () => {
    const validApiKeys = ['valid-key-1', 'valid-key-2', 'super-secret-key'];
    let middleware: ReturnType<typeof checkAuthorization>;

    beforeEach(() => {
      middleware = checkAuthorization(validApiKeys);
    });

    describe('missing authorization header', () => {
      it('should return 401 when authorization header is missing', () => {
        const req = createMockRequest({});
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is undefined', () => {
        const req = createMockRequest({ authorization: undefined });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is null', () => {
        const req = createMockRequest({ authorization: null });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is empty string', () => {
        const req = createMockRequest({ authorization: '' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('valid authorization', () => {
      it('should call next() with valid Bearer token', () => {
        const req = createMockRequest({ authorization: 'Bearer valid-key-1' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should call next() with valid API key without Bearer prefix', () => {
        const req = createMockRequest({ authorization: 'valid-key-2' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('should work with all valid API keys', () => {
        validApiKeys.forEach(key => {
          const req = createMockRequest({ authorization: `Bearer ${key}` });
          const res = createMockResponse();
          const next = createMockNext();

          middleware(req as Request, res as Response, next);

          expect(next).toHaveBeenCalled();
          expect(res.status).not.toHaveBeenCalled();
        });
      });

      it('should handle case-sensitive API keys', () => {
        const req1 = createMockRequest({ authorization: 'Bearer valid-key-1' });
        const req2 = createMockRequest({ authorization: 'Bearer VALID-KEY-1' });
        const res1 = createMockResponse();
        const res2 = createMockResponse();
        const next1 = createMockNext();
        const next2 = createMockNext();

        middleware(req1 as Request, res1 as Response, next1);
        middleware(req2 as Request, res2 as Response, next2);

        expect(next1).toHaveBeenCalled();
        expect(res2.status).toHaveBeenCalledWith(401);
        expect(res2.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next2).not.toHaveBeenCalled();
      });
    });

    describe('invalid authorization', () => {
      it('should return 401 with invalid Bearer token', () => {
        const req = createMockRequest({ authorization: 'Bearer invalid-key' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid API key without Bearer prefix', () => {
        const req = createMockRequest({ authorization: 'invalid-key' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 with empty Bearer token', () => {
        const req = createMockRequest({ authorization: 'Bearer ' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 with only Bearer prefix', () => {
        const req = createMockRequest({ authorization: 'Bearer' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 with partial API key match', () => {
        const req = createMockRequest({ authorization: 'Bearer valid-key' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('bearer token extraction', () => {
      it('should extract token correctly with Bearer prefix', () => {
        const req = createMockRequest({ authorization: 'Bearer valid-key-1' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle authorization header without Bearer prefix', () => {
        const req = createMockRequest({ authorization: 'valid-key-1' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle Bearer with different casing', () => {
        const req1 = createMockRequest({ authorization: 'bearer valid-key-1' });
        const req2 = createMockRequest({ authorization: 'BEARER valid-key-1' });
        const res1 = createMockResponse();
        const res2 = createMockResponse();
        const next1 = createMockNext();
        const next2 = createMockNext();

        middleware(req1 as Request, res1 as Response, next1);
        middleware(req2 as Request, res2 as Response, next2);

        // Should not match 'bearer' or 'BEARER' (case sensitive)
        expect(res1.status).toHaveBeenCalledWith(401);
        expect(res2.status).toHaveBeenCalledWith(401);
        expect(next1).not.toHaveBeenCalled();
        expect(next2).not.toHaveBeenCalled();
      });

      it('should handle extra spaces in Bearer token', () => {
        const req = createMockRequest({ authorization: 'Bearer  valid-key-1' });
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        // Should not match because of extra space
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should handle very long API keys', () => {
        const longKey = 'a'.repeat(1000);
        const longKeyMiddleware = checkAuthorization([longKey]);
        
        const req = createMockRequest({ authorization: `Bearer ${longKey}` });
        const res = createMockResponse();
        const next = createMockNext();

        longKeyMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle special characters in API keys', () => {
        const specialKey = 'key-with-special-chars!@#$%^&*()_+{}[]|\\:";\'<>?,./ ';
        const specialMiddleware = checkAuthorization([specialKey]);
        
        const req = createMockRequest({ authorization: `Bearer ${specialKey}` });
        const res = createMockResponse();
        const next = createMockNext();

        specialMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle numeric API keys as strings', () => {
        const numericKey = '123456789';
        const numericMiddleware = checkAuthorization([numericKey]);
        
        const req = createMockRequest({ authorization: `Bearer ${numericKey}` });
        const res = createMockResponse();
        const next = createMockNext();

        numericMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle Unicode characters in API keys', () => {
        const unicodeKey = 'key-🔑-test-🚀';
        const unicodeMiddleware = checkAuthorization([unicodeKey]);
        
        const req = createMockRequest({ authorization: `Bearer ${unicodeKey}` });
        const res = createMockResponse();
        const next = createMockNext();

        unicodeMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });

      it('should handle empty API keys in array', () => {
        const emptyKeyMiddleware = checkAuthorization(['', 'valid-key']);
        
        const req1 = createMockRequest({ authorization: 'Bearer ' });
        const req2 = createMockRequest({ authorization: 'Bearer valid-key' });
        const res1 = createMockResponse();
        const res2 = createMockResponse();
        const next1 = createMockNext();
        const next2 = createMockNext();

        emptyKeyMiddleware(req1 as Request, res1 as Response, next1);
        emptyKeyMiddleware(req2 as Request, res2 as Response, next2);

        expect(res1.status).toHaveBeenCalledWith(401); // Empty key should not be valid
        expect(next2).toHaveBeenCalled(); // Valid key should work
      });
    });

    describe('multiple API keys scenario', () => {
      const multipleKeys = ['admin-key', 'user-key', 'guest-key', 'service-key'];
      let multiKeyMiddleware: ReturnType<typeof checkAuthorization>;

      beforeEach(() => {
        multiKeyMiddleware = checkAuthorization(multipleKeys);
      });

      it('should accept any of the valid API keys', () => {
        multipleKeys.forEach(key => {
          const req = createMockRequest({ authorization: `Bearer ${key}` });
          const res = createMockResponse();
          const next = createMockNext();

          multiKeyMiddleware(req as Request, res as Response, next);

          expect(next).toHaveBeenCalled();
          expect(res.status).not.toHaveBeenCalled();
        });
      });

      it('should reject invalid keys even with multiple valid options', () => {
        const invalidKeys = ['invalid-key', 'wrong-key', 'admin-key-wrong'];

        invalidKeys.forEach(key => {
          const req = createMockRequest({ authorization: `Bearer ${key}` });
          const res = createMockResponse();
          const next = createMockNext();

          multiKeyMiddleware(req as Request, res as Response, next);

          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
          expect(next).not.toHaveBeenCalled();
        });
      });
    });

    describe('empty API keys array', () => {
      let emptyMiddleware: ReturnType<typeof checkAuthorization>;

      beforeEach(() => {
        emptyMiddleware = checkAuthorization([]);
      });

      it('should reject any API key when no valid keys are configured', () => {
        const req = createMockRequest({ authorization: 'Bearer any-key' });
        const res = createMockResponse();
        const next = createMockNext();

        emptyMiddleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should still require authorization header', () => {
        const req = createMockRequest({});
        const res = createMockResponse();
        const next = createMockNext();

        emptyMiddleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header missing' });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('header case sensitivity', () => {
    const middleware = checkAuthorization(['test-key']);

    it('should be case-insensitive for header names', () => {
      const testCases = [
        'authorization',
        'Authorization',
        'AUTHORIZATION'
      ];

      testCases.forEach(headerName => {
        const headers: any = {};
        headers[headerName] = 'Bearer test-key';
        
        const req = createMockRequest(headers);
        const res = createMockResponse();
        const next = createMockNext();

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
      });
    });
  });
});