import { OpenTool } from '../../src/models/opentool';
import { Info } from '../../src/models/info';
import { FunctionModel } from '../../src/models/function-model';
import { Parameter } from '../../src/models/parameter';
import { Return } from '../../src/models/return';
import { Schema, SchemaType } from '../../src/models/schema';

describe('OpenTool', () => {
  describe('constructor', () => {
    it('should create OpenTool with required fields', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = [
        new FunctionModel('test_func', 'Test function', [])
      ];
      const openTool = new OpenTool('1.0.0', info, undefined, functions);

      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info).toBe(info);
      expect(openTool.functions).toBe(functions);
      expect(openTool.schemas).toBeUndefined();
    });

    it('should create OpenTool with all fields', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = [
        new FunctionModel('test_func', 'Test function', [])
      ];
      const schemas = {
        'User': new Schema(SchemaType.OBJECT)
      };
      const openTool = new OpenTool('1.0.0', info, undefined, functions, schemas);

      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info).toBe(info);
      expect(openTool.functions).toBe(functions);
      expect(openTool.schemas).toBe(schemas);
    });

    it('should create OpenTool with empty functions array', () => {
      const info = new Info('Test Tool', '1.0.0');
      const openTool = new OpenTool('1.0.0', info);

      expect(openTool.functions).toEqual([]);
    });
  });

  describe('fromJson', () => {
    it('should create OpenTool from JSON with required fields', () => {
      const json = {
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'test_func',
            description: 'Test function',
            parameters: []
          }
        ]
      };

      const openTool = OpenTool.fromJson(json);

      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info.title).toBe('Test Tool');
      expect(openTool.info.version).toBe('1.0.0');
      expect(openTool.functions).toHaveLength(1);
      expect(openTool.functions[0].name).toBe('test_func');
      expect(openTool.schemas).toBeUndefined();
    });

    it('should create OpenTool from JSON with all fields', () => {
      const json = {
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0',
          description: 'A test tool'
        },
        functions: [
          {
            name: 'test_func',
            description: 'Test function',
            parameters: [
              {
                name: 'input',
                schema: { type: 'string' },
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
              age: { type: 'integer' }
            }
          }
        }
      };

      const openTool = OpenTool.fromJson(json);

      expect(openTool.opentool).toBe('1.0.0');
      expect(openTool.info.description).toBe('A test tool');
      expect(openTool.functions[0].parameters).toHaveLength(1);
      expect(openTool.schemas).toBeDefined();
      expect(openTool.schemas!['User'].type).toBe('object');
    });

    it('should handle empty functions array', () => {
      const json = {
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: []
      };

      const openTool = OpenTool.fromJson(json);

      expect(openTool.functions).toEqual([]);
    });

    it('should handle null/undefined functions', () => {
      const json = {
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: null
      };

      const openTool = OpenTool.fromJson(json);

      expect(openTool.functions).toEqual([]);
    });

    it('should create complex OpenTool with multiple functions and schemas', () => {
      const json = {
        opentool: '2.0.0',
        info: {
          title: 'Complex Tool',
          version: '2.0.0',
          description: 'A complex tool',
          host: 'localhost',
          port: 9627
        },
        functions: [
          {
            name: 'create_user',
            description: 'Create a new user',
            parameters: [
              {
                name: 'user_data',
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' }
                  },
                  required: ['name', 'email']
                },
                required: true
              }
            ],
            return: {
              name: 'user_id',
              schema: { type: 'integer' }
            }
          },
          {
            name: 'get_user',
            description: 'Get user by ID',
            parameters: [
              {
                name: 'id',
                schema: { type: 'integer' },
                required: true
              }
            ]
          }
        ],
        schemas: {
          'User': {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          'Response': {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      };

      const openTool = OpenTool.fromJson(json);

      expect(openTool.opentool).toBe('2.0.0');
      expect(openTool.functions).toHaveLength(2);
      expect(openTool.functions[0].name).toBe('create_user');
      expect(openTool.functions[1].name).toBe('get_user');
      expect(Object.keys(openTool.schemas!)).toHaveLength(2);
      expect(openTool.schemas!['User'].type).toBe('object');
      expect(openTool.schemas!['Response'].type).toBe('object');
    });
  });

  describe('toJson', () => {
    it('should serialize OpenTool with required fields only', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = [
        new FunctionModel('test_func', 'Test function', [])
      ];
      const openTool = new OpenTool('1.0.0', info, undefined, functions);

      const json = openTool.toJson();

      expect(json).toEqual({
        opentool: '1.0.0',
        info: {
          title: 'Test Tool',
          version: '1.0.0'
        },
        functions: [
          {
            name: 'test_func',
            description: 'Test function',
            parameters: []
          }
        ]
      });
    });

    it('should serialize OpenTool with all fields', () => {
      const info = new Info('Test Tool', '1.0.0', 'A test tool');
      const parameter = new Parameter('input', new Schema(SchemaType.STRING), true);
      const functions = [
        new FunctionModel('test_func', 'Test function', [parameter])
      ];
      const schemas = {
        'User': new Schema(SchemaType.OBJECT, 'User schema')
      };
      const openTool = new OpenTool('1.0.0', info, undefined, functions, schemas);

      const json = openTool.toJson();

      expect(json.opentool).toBe('1.0.0');
      expect(json.info.description).toBe('A test tool');
      expect(json.functions[0].parameters).toHaveLength(1);
      expect(json.schemas).toBeDefined();
      expect(json.schemas['User'].type).toBe('object');
      expect(json.schemas['User'].description).toBe('User schema');
    });

    it('should exclude undefined schemas', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = [new FunctionModel('test_func', 'Test function', [])];
      const openTool = new OpenTool('1.0.0', info, undefined, functions);

      const json = openTool.toJson();

      expect(json).not.toHaveProperty('schemas');
    });

    it('should serialize empty functions array', () => {
      const info = new Info('Test Tool', '1.0.0');
      const openTool = new OpenTool('1.0.0', info);

      const json = openTool.toJson();

      expect(json.functions).toEqual([]);
    });

    it('should serialize complex OpenTool correctly', () => {
      const info = new Info('Complex Tool', '2.0.0', 'A complex tool');
      
      const userParam = new Parameter(
        'user_data',
        new Schema(
          SchemaType.OBJECT,
          'User data',
          {
            name: new Schema(SchemaType.STRING),
            email: new Schema(SchemaType.STRING)
          },
          undefined,
          undefined,
          ['name', 'email']
        ),
        true
      );
      
      const returnModel = new Return('user_id', new Schema(SchemaType.INTEGER));
      
      const functions = [
        new FunctionModel('create_user', 'Create a new user', [userParam], returnModel)
      ];
      
      const schemas = {
        'User': new Schema(
          SchemaType.OBJECT,
          'User object',
          {
            id: new Schema(SchemaType.INTEGER),
            name: new Schema(SchemaType.STRING),
            email: new Schema(SchemaType.STRING)
          }
        )
      };
      
      const openTool = new OpenTool('2.0.0', info, undefined, functions, schemas);

      const json = openTool.toJson();

      expect(json.opentool).toBe('2.0.0');
      expect(json.functions[0].parameters[0].schema.properties.name.type).toBe('string');
      expect(json.functions[0].return.name).toBe('user_id');
      expect(json.schemas['User'].properties.id.type).toBe('integer');
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        opentool: '2.1.0',
        info: {
          title: 'Advanced Tool',
          version: '2.1.0',
          description: 'An advanced tool with comprehensive features',
          host: 'api.example.com',
          port: 8080
        },
        functions: [
          {
            name: 'process_data',
            description: 'Process input data with various options',
            parameters: [
              {
                name: 'data',
                description: 'Input data array',
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      value: { type: 'string' }
                    }
                  }
                },
                required: true
              },
              {
                name: 'options',
                description: 'Processing options',
                schema: {
                  type: 'object',
                  properties: {
                    sort: { type: 'boolean' },
                    filter: { type: 'string' },
                    limit: { type: 'integer' }
                  }
                },
                required: false
              }
            ],
            return: {
              name: 'result',
              description: 'Processing result',
              schema: {
                type: 'object',
                properties: {
                  processed_count: { type: 'integer' },
                  data: {
                    type: 'array',
                    items: { type: 'object' }
                  }
                }
              }
            }
          }
        ],
        schemas: {
          'DataItem': {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              value: { type: 'string' },
              timestamp: { type: 'string' }
            },
            required: ['id', 'value']
          },
          'ProcessingOptions': {
            type: 'object',
            properties: {
              sort: { type: 'boolean' },
              filter: { type: 'string' },
              limit: { type: 'integer' }
            }
          }
        }
      };

      const openTool1 = OpenTool.fromJson(originalJson);
      const serialized = openTool1.toJson();
      const openTool2 = OpenTool.fromJson(serialized);

      expect(openTool2.opentool).toBe(originalJson.opentool);
      expect(openTool2.info.title).toBe(originalJson.info.title);
      expect(openTool2.functions).toHaveLength(1);
      expect(openTool2.functions[0].name).toBe('process_data');
      expect(openTool2.functions[0].parameters).toHaveLength(2);
      expect(openTool2.functions[0].return_).toBeDefined();
      expect(Object.keys(openTool2.schemas!)).toHaveLength(2);
      expect(openTool2.schemas!['DataItem'].required).toEqual(['id', 'value']);
    });

    it('should handle minimal OpenTool configuration', () => {
      const originalJson = {
        opentool: '1.0.0',
        info: {
          title: 'Minimal Tool',
          version: '1.0.0'
        },
        functions: []
      };

      const openTool1 = OpenTool.fromJson(originalJson);
      const serialized = openTool1.toJson();
      const openTool2 = OpenTool.fromJson(serialized);

      expect(openTool2.opentool).toBe(originalJson.opentool);
      expect(openTool2.info.title).toBe(originalJson.info.title);
      expect(openTool2.functions).toEqual([]);
      expect(openTool2.schemas).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty version string', () => {
      const info = new Info('Test Tool', '1.0.0');
      const openTool = new OpenTool('', info);

      expect(openTool.opentool).toBe('');
      
      const json = openTool.toJson();
      expect(json.opentool).toBe('');
    });

    it('should handle large number of functions', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = Array.from({ length: 50 }, (_, i) => 
        new FunctionModel(`function_${i}`, `Function ${i}`, [])
      );
      const openTool = new OpenTool('1.0.0', info, undefined, functions);

      const json = openTool.toJson();
      expect(json.functions).toHaveLength(50);
    });

    it('should handle large number of schemas', () => {
      const info = new Info('Test Tool', '1.0.0');
      const schemas: { [key: string]: Schema } = {};
      for (let i = 0; i < 20; i++) {
        schemas[`Schema${i}`] = new Schema(SchemaType.OBJECT);
      }
      const openTool = new OpenTool('1.0.0', info, undefined, [], schemas);

      const json = openTool.toJson();
      expect(Object.keys(json.schemas)).toHaveLength(20);
    });

    it('should preserve function order', () => {
      const info = new Info('Test Tool', '1.0.0');
      const functions = [
        new FunctionModel('first', 'First function', []),
        new FunctionModel('second', 'Second function', []),
        new FunctionModel('third', 'Third function', [])
      ];
      const openTool = new OpenTool('1.0.0', info, undefined, functions);

      const json = openTool.toJson();
      expect(json.functions[0].name).toBe('first');
      expect(json.functions[1].name).toBe('second');
      expect(json.functions[2].name).toBe('third');
    });
  });
});