import { OpenToolJsonLoader } from '../../src/utils/json-loader';
import { OpenTool } from '../../src/models/opentool';
import { SchemasSingleton } from '../../src/models/schema';
import * as fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('OpenToolJsonLoader', () => {
  let loader: OpenToolJsonLoader;

  beforeEach(() => {
    loader = new OpenToolJsonLoader();
    // Reset SchemasSingleton before each test
    (SchemasSingleton as any)._schemas = {};
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('should load OpenTool from JSON string', async () => {
      const jsonString = JSON.stringify({
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
      });

      const openTool = await loader.load(jsonString);

      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info.title).toBe('Test Tool');
      expect(openTool.functions).toHaveLength(1);
      expect(openTool.functions[0].name).toBe('test_function');
    });

    it('should load OpenTool with schemas and initialize SchemasSingleton', async () => {
      const jsonString = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Tool with Schemas',
          version: '1.0.0'
        },
        functions: [],
        schemas: {
          'User': {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'integer' }
            }
          },
          'Product': {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' }
            }
          }
        }
      });

      const openTool = await loader.load(jsonString);

      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.schemas).toBeDefined();
      expect(Object.keys(openTool.schemas!)).toHaveLength(2);

      // Verify SchemasSingleton was initialized
      const schemas = SchemasSingleton.getInstance();
      expect(schemas['User']).toBeDefined();
      expect(schemas['User'].type).toBe('object');
      expect(schemas['Product']).toBeDefined();
      expect(schemas['Product'].type).toBe('object');
    });

    it('should handle OpenTool without schemas', async () => {
      const jsonString = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Simple Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'simple_function',
            description: 'A simple function',
            parameters: [
              {
                name: 'input',
                schema: { type: 'string' },
                required: true
              }
            ]
          }
        ]
      });

      const openTool = await loader.load(jsonString);

      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.schemas).toBeUndefined();
      expect(openTool.functions).toHaveLength(1);
      expect(openTool.functions[0].parameters).toHaveLength(1);
    });

    it('should handle complex OpenTool with nested structures', async () => {
      const jsonString = JSON.stringify({
        opentool: '2.0.0',
        info: {
          title: 'Complex Tool',
          version: '2.0.0',
          description: 'A complex tool with many features',
          host: 'localhost',
          port: 8080
        },
        functions: [
          {
            name: 'process_user',
            description: 'Process user data',
            parameters: [
              {
                name: 'user_data',
                schema: {
                  type: 'object',
                  properties: {
                    personal: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                      }
                    },
                    preferences: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                },
                required: true
              }
            ],
            return: {
              name: 'result',
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  user_id: { type: 'string' }
                }
              }
            }
          }
        ],
        schemas: {
          'ErrorResponse': {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'integer' }
            }
          }
        }
      });

      const openTool = await loader.load(jsonString);

      expect(openTool.opentool).toBe('2.0.0');
      expect(openTool.functions[0].parameters[0].schema.type).toBe('object');
      expect(openTool.functions[0].return_).toBeDefined();
      expect(openTool.schemas!['ErrorResponse']).toBeDefined();

      // Verify nested schema structures
      const userDataSchema = openTool.functions[0].parameters[0].schema;
      expect(userDataSchema.properties!['personal'].type).toBe('object');
      expect(userDataSchema.properties!['preferences'].type).toBe('array');
    });

    it('should throw error for invalid JSON', async () => {
      const invalidJson = '{ "opentool": "1.0.0", invalid json }';

      await expect(loader.load(invalidJson)).rejects.toThrow();
    });

    it('should handle null schemas gracefully', async () => {
      const jsonString = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Tool with Null Schemas',
          version: '1.0.0'
        },
        functions: [],
        schemas: null
      });

      const openTool = await loader.load(jsonString);

      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.schemas).toBeUndefined();
    });

    it('should handle empty schemas object', async () => {
      const jsonString = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Tool with Empty Schemas',
          version: '1.0.0'
        },
        functions: [],
        schemas: {}
      });

      const openTool = await loader.load(jsonString);

      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.schemas).toEqual({});

      // SchemasSingleton should be initialized but empty
      const schemas = SchemasSingleton.getInstance();
      expect(Object.keys(schemas)).toHaveLength(0);
    });
  });

  describe('loadFromFile', () => {
    it('should load OpenTool from file', async () => {
      const jsonContent = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'File Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'file_function',
            description: 'A function loaded from file',
            parameters: []
          }
        ]
      });

      mockFs.readFile.mockResolvedValue(jsonContent);

      const openTool = await loader.loadFromFile('/path/to/tool.json');

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/tool.json', 'utf-8');
      expect(openTool).toBeInstanceOf(OpenTool);
      expect(openTool.info.title).toBe('File Tool');
      expect(openTool.functions[0].name).toBe('file_function');
    });

    it('should load OpenTool from file with schemas', async () => {
      const jsonContent = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'File Tool with Schemas',
          version: '1.0.0'
        },
        functions: [],
        schemas: {
          'FileSchema': {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              size: { type: 'integer' }
            }
          }
        }
      });

      mockFs.readFile.mockResolvedValue(jsonContent);

      const openTool = await loader.loadFromFile('/path/to/complex-tool.json');

      expect(openTool.schemas!['FileSchema']).toBeDefined();

      // Verify SchemasSingleton was initialized
      const schemas = SchemasSingleton.getInstance();
      expect(schemas['FileSchema']).toBeDefined();
      expect(schemas['FileSchema'].type).toBe('object');
    });

    it('should throw error when file does not exist', async () => {
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(loader.loadFromFile('/nonexistent/tool.json')).rejects.toThrow('ENOENT');
    });

    it('should throw error when file contains invalid JSON', async () => {
      const invalidJson = '{ "opentool": "1.0.0", broken json }';
      mockFs.readFile.mockResolvedValue(invalidJson);

      await expect(loader.loadFromFile('/path/to/invalid.json')).rejects.toThrow();
    });

    it('should handle file with different encoding', async () => {
      const jsonContent = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Unicode Tool 🚀',
          version: '1.0.0'
        },
        functions: []
      });

      mockFs.readFile.mockResolvedValue(jsonContent);

      const openTool = await loader.loadFromFile('/path/to/unicode-tool.json');

      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/unicode-tool.json', 'utf-8');
      expect(openTool.info.title).toBe('Unicode Tool 🚀');
    });

    it('should handle empty file', async () => {
      mockFs.readFile.mockResolvedValue('');

      await expect(loader.loadFromFile('/path/to/empty.json')).rejects.toThrow();
    });

    it('should handle large JSON file', async () => {
      // Create a large JSON structure
      const largeFunctions = Array.from({ length: 100 }, (_, i) => ({
        name: `function_${i}`,
        description: `Function number ${i}`,
        parameters: [
          {
            name: `param_${i}`,
            schema: { type: 'string' },
            required: true
          }
        ]
      }));

      const largeSchemas: { [key: string]: any } = {};
      for (let i = 0; i < 50; i++) {
        largeSchemas[`Schema${i}`] = {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            data: { type: 'array', items: { type: 'string' } }
          }
        };
      }

      const largeJsonContent = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Large Tool',
          version: '1.0.0'
        },
        functions: largeFunctions,
        schemas: largeSchemas
      });

      mockFs.readFile.mockResolvedValue(largeJsonContent);

      const openTool = await loader.loadFromFile('/path/to/large-tool.json');

      expect(openTool.functions).toHaveLength(100);
      expect(Object.keys(openTool.schemas!)).toHaveLength(50);

      // Verify SchemasSingleton has all schemas
      const schemas = SchemasSingleton.getInstance();
      expect(Object.keys(schemas)).toHaveLength(50);
    });
  });

  describe('error handling', () => {
    it('should preserve error details for JSON parsing failures', async () => {
      const invalidJson = '{ "opentool": "1.0.0", "info": { "title": }';

      try {
        await loader.load(invalidJson);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should handle malformed OpenTool structure gracefully', async () => {
      // Missing required fields
      const malformedJson = JSON.stringify({
        opentool: '1.0.0'
        // Missing info and functions
      });

      try {
        await loader.load(malformedJson);
        fail('Expected error to be thrown');
      } catch (error) {
        // Should throw an error due to missing required fields
        expect(error).toBeDefined();
      }
    });
  });

  describe('integration', () => {
    it('should work with schema references after loading', async () => {
      const jsonString = JSON.stringify({
        opentool: '1.0.0',
        info: {
          title: 'Tool with Schema References',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'create_user',
            description: 'Create a user',
            parameters: [
              {
                name: 'user_data',
                schema: {
                  '$ref': '#/schemas/User'
                },
                required: true
              }
            ]
          }
        ],
        schemas: {
          'User': {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            },
            required: ['name', 'email']
          }
        }
      });

      const openTool = await loader.load(jsonString);

      expect(openTool.functions[0].parameters[0].schema.type).toBe('object');
      expect(openTool.functions[0].parameters[0].schema.properties!['name'].type).toBe('string');
      expect(openTool.functions[0].parameters[0].schema.required).toEqual(['name', 'email']);
    });
  });
});