import { Router } from 'express';
import { opentoolRoutes } from '../../src/server/route';
import { Controller } from '../../src/server/controller';
import { Tool } from '../../src/tool/tool';

// Mock Express Router
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
  })),
}));

// Mock Tool class
class MockTool extends Tool {
  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    return { method: name, params: args };
  }

  async load() {
    return null;
  }
}

const MockedRouter = Router as jest.MockedFunction<typeof Router>;

describe('opentoolRoutes', () => {
  let mockRouter: any;
  let controller: Controller;
  let mockTool: MockTool;

  beforeEach(() => {
    mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn(),
    };

    MockedRouter.mockReturnValue(mockRouter);

    mockTool = new MockTool();
    controller = new Controller(mockTool, '1.0.0');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('route setup', () => {
    it('should create a router and return it', () => {
      const router = opentoolRoutes(controller);

      expect(MockedRouter).toHaveBeenCalled();
      expect(router).toBe(mockRouter);
    });

    it('should set up version route (GET /version)', () => {
      opentoolRoutes(controller);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/version',
        expect.any(Function)
      );
    });

    it('should set up call route (POST /call)', () => {
      opentoolRoutes(controller);

      expect(mockRouter.post).toHaveBeenCalledWith(
        '/call',
        expect.any(Function)
      );
    });

    it('should set up load route (GET /load)', () => {
      opentoolRoutes(controller);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/load',
        expect.any(Function)
      );
    });

    it('should set up all three routes', () => {
      opentoolRoutes(controller);

      expect(mockRouter.get).toHaveBeenCalledTimes(2); // /version and /load
      expect(mockRouter.post).toHaveBeenCalledTimes(1); // /call
    });
  });

  describe('route handlers', () => {
    it('should bind version route to controller.getVersion', () => {
      const getVersionSpy = jest.spyOn(controller, 'getVersion').mockImplementation();
      
      opentoolRoutes(controller);

      // Get the handler function that was passed to router.get for '/version'
      const versionCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/version');
      expect(versionCall).toBeDefined();

      const versionHandler = versionCall[1];
      const mockReq = {} as any;
      const mockRes = {} as any;

      versionHandler(mockReq, mockRes);

      expect(getVersionSpy).toHaveBeenCalledWith(mockReq, mockRes);
      
      getVersionSpy.mockRestore();
    });

    it('should bind call route to controller.call', () => {
      const callSpy = jest.spyOn(controller, 'call').mockImplementation();
      
      opentoolRoutes(controller);

      // Get the handler function that was passed to router.post for '/call'
      const callRoute = mockRouter.post.mock.calls.find((call: any) => call[0] === '/call');
      expect(callRoute).toBeDefined();

      const callHandler = callRoute[1];
      const mockReq = {} as any;
      const mockRes = {} as any;

      callHandler(mockReq, mockRes);

      expect(callSpy).toHaveBeenCalledWith(mockReq, mockRes);
      
      callSpy.mockRestore();
    });

    it('should bind load route to controller.load', () => {
      const loadSpy = jest.spyOn(controller, 'load').mockImplementation();
      
      opentoolRoutes(controller);

      // Get the handler function that was passed to router.get for '/load'
      const loadCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/load');
      expect(loadCall).toBeDefined();

      const loadHandler = loadCall[1];
      const mockReq = {} as any;
      const mockRes = {} as any;

      loadHandler(mockReq, mockRes);

      expect(loadSpy).toHaveBeenCalledWith(mockReq, mockRes);
      
      loadSpy.mockRestore();
    });
  });

  describe('route paths', () => {
    it('should use correct path for version endpoint', () => {
      opentoolRoutes(controller);

      const versionCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/version');
      expect(versionCall).toBeDefined();
      expect(versionCall[0]).toBe('/version');
    });

    it('should use correct path for call endpoint', () => {
      opentoolRoutes(controller);

      const callRoute = mockRouter.post.mock.calls.find((call: any) => call[0] === '/call');
      expect(callRoute).toBeDefined();
      expect(callRoute[0]).toBe('/call');
    });

    it('should use correct path for load endpoint', () => {
      opentoolRoutes(controller);

      const loadCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/load');
      expect(loadCall).toBeDefined();
      expect(loadCall[0]).toBe('/load');
    });
  });

  describe('HTTP methods', () => {
    it('should use GET method for version endpoint', () => {
      opentoolRoutes(controller);

      expect(mockRouter.get).toHaveBeenCalledWith('/version', expect.any(Function));
    });

    it('should use POST method for call endpoint', () => {
      opentoolRoutes(controller);

      expect(mockRouter.post).toHaveBeenCalledWith('/call', expect.any(Function));
    });

    it('should use GET method for load endpoint', () => {
      opentoolRoutes(controller);

      expect(mockRouter.get).toHaveBeenCalledWith('/load', expect.any(Function));
    });
  });

  describe('controller binding', () => {
    it('should work with different controller instances', () => {
      const controller1 = new Controller(mockTool, '1.0.0');
      const controller2 = new Controller(mockTool, '2.0.0');

      const router1 = opentoolRoutes(controller1);
      const router2 = opentoolRoutes(controller2);

      // Both should create new routers
      expect(router1).toBe(mockRouter);
      expect(router2).toBe(mockRouter);
      
      // Each should have set up routes
      expect(MockedRouter).toHaveBeenCalledTimes(2);
    });

    it('should preserve controller context in route handlers', () => {
      const getVersionSpy = jest.spyOn(controller, 'getVersion').mockImplementation();
      
      opentoolRoutes(controller);

      const versionCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/version');
      const versionHandler = versionCall[1];
      
      const mockReq = {} as any;
      const mockRes = {} as any;

      versionHandler(mockReq, mockRes);

      expect(getVersionSpy).toHaveBeenCalledWith(mockReq, mockRes);
      expect(getVersionSpy.mock.instances[0]).toBe(controller);
      
      getVersionSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle controller method errors gracefully', () => {
      const errorController = new Controller(mockTool, '1.0.0');
      jest.spyOn(errorController, 'getVersion').mockImplementation(() => {
        throw new Error('Controller error');
      });

      expect(() => {
        opentoolRoutes(errorController);
      }).not.toThrow();
    });

    it('should allow controller methods to be async', async () => {
      const asyncController = new Controller(mockTool, '1.0.0');
      jest.spyOn(asyncController, 'getVersion').mockResolvedValue(undefined);

      opentoolRoutes(asyncController);

      const versionCall = mockRouter.get.mock.calls.find((call: any) => call[0] === '/version');
      const versionHandler = versionCall[1];
      
      const mockReq = {} as any;
      const mockRes = {} as any;

      // Should not throw when calling async handler
      expect(() => {
        versionHandler(mockReq, mockRes);
      }).not.toThrow();
    });
  });

  describe('router configuration', () => {
    it('should create a new Router instance each time', () => {
      opentoolRoutes(controller);
      opentoolRoutes(controller);

      expect(MockedRouter).toHaveBeenCalledTimes(2);
    });

    it('should not add any middleware to the router by default', () => {
      opentoolRoutes(controller);

      expect(mockRouter.use).not.toHaveBeenCalled();
    });

    it('should only set up the three standard routes', () => {
      opentoolRoutes(controller);

      // Should have exactly 3 route calls total
      const totalRouteCalls = mockRouter.get.mock.calls.length + mockRouter.post.mock.calls.length;
      expect(totalRouteCalls).toBe(3);
    });
  });

  describe('route handler signature', () => {
    it('should pass req and res parameters to controller methods', () => {
      const callSpy = jest.spyOn(controller, 'call').mockImplementation();
      
      opentoolRoutes(controller);

      const callRoute = mockRouter.post.mock.calls.find((call: any) => call[0] === '/call');
      const callHandler = callRoute[1];
      
      const mockReq = { body: { test: 'data' } } as any;
      const mockRes = { json: jest.fn() } as any;

      callHandler(mockReq, mockRes);

      expect(callSpy).toHaveBeenCalledWith(mockReq, mockRes);
      expect(callSpy).toHaveBeenCalledTimes(1);
      
      callSpy.mockRestore();
    });

    it('should handle handlers with 2 parameters (req, res)', () => {
      opentoolRoutes(controller);

      const allRoutes = [
        ...mockRouter.get.mock.calls,
        ...mockRouter.post.mock.calls
      ];

      allRoutes.forEach(([path, handler]) => {
        expect(typeof handler).toBe('function');
        expect(handler.length).toBe(2); // req, res parameters
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with controller that has custom tool implementation', () => {
      class CustomTool extends Tool {
        async call(name: string, args?: { [key: string]: any }) {
          return { custom: true, method: name, args };
        }

        async load() {
          return null;
        }
      }

      const customTool = new CustomTool();
      const customController = new Controller(customTool, '2.0.0');

      expect(() => {
        opentoolRoutes(customController);
      }).not.toThrow();

      expect(mockRouter.get).toHaveBeenCalledTimes(2);
      expect(mockRouter.post).toHaveBeenCalledTimes(1);
    });

    it('should maintain route order', () => {
      opentoolRoutes(controller);

      const getCalls = mockRouter.get.mock.calls;
      const postCalls = mockRouter.post.mock.calls;

      // Check that routes are set up in expected order
      expect(getCalls[0][0]).toBe('/version');
      expect(postCalls[0][0]).toBe('/call');
      expect(getCalls[1][0]).toBe('/load');
    });
  });
});