import { FunctionModel } from '../../src/models/function-model';
import { Parameter } from '../../src/models/parameter';
import { Return } from '../../src/models/return';
import { Schema, SchemaType } from '../../src/models/schema';

describe('FunctionModel', () => {
  describe('constructor', () => {
    it('should create FunctionModel with required fields', () => {
      const parameters = [
        new Parameter('param1', new Schema(SchemaType.STRING), true)
      ];
      const functionModel = new FunctionModel('test_function', 'Test function', parameters);

      expect(functionModel.name).toBe('test_function');
      expect(functionModel.description).toBe('Test function');
      expect(functionModel.parameters).toBe(parameters);
      expect(functionModel.return_).toBeUndefined();
    });

    it('should create FunctionModel with all fields', () => {
      const parameters = [
        new Parameter('param1', new Schema(SchemaType.STRING), true)
      ];
      const returnModel = new Return('result', new Schema(SchemaType.OBJECT));
      const functionModel = new FunctionModel('test_function', 'Test function', parameters, returnModel);

      expect(functionModel.name).toBe('test_function');
      expect(functionModel.description).toBe('Test function');
      expect(functionModel.parameters).toBe(parameters);
      expect(functionModel.return_).toBe(returnModel);
    });

    it('should create FunctionModel with empty parameters', () => {
      const functionModel = new FunctionModel('no_param_function', 'Function without parameters', []);

      expect(functionModel.name).toBe('no_param_function');
      expect(functionModel.description).toBe('Function without parameters');
      expect(functionModel.parameters).toEqual([]);
      expect(functionModel.return_).toBeUndefined();
    });
  });

  describe('fromJson', () => {
    it('should create FunctionModel from JSON with required fields', () => {
      const json = {
        name: 'test_function',
        description: 'Test function',
        parameters: [
          {
            name: 'input',
            schema: { type: 'string' },
            required: true
          }
        ]
      };

      const functionModel = FunctionModel.fromJson(json);

      expect(functionModel.name).toBe('test_function');
      expect(functionModel.description).toBe('Test function');
      expect(functionModel.parameters).toHaveLength(1);
      expect(functionModel.parameters[0].name).toBe('input');
      expect(functionModel.parameters[0].schema.type).toBe('string');
      expect(functionModel.parameters[0].required).toBe(true);
      expect(functionModel.return_).toBeUndefined();
    });

    it('should create FunctionModel from JSON with all fields', () => {
      const json = {
        name: 'test_function',
        description: 'Test function',
        parameters: [
          {
            name: 'input',
            schema: { type: 'string' },
            required: true,
            description: 'Input parameter'
          }
        ],
        return: {
          name: 'output',
          schema: { type: 'object' },
          description: 'Output result'
        }
      };

      const functionModel = FunctionModel.fromJson(json);

      expect(functionModel.name).toBe('test_function');
      expect(functionModel.description).toBe('Test function');
      expect(functionModel.parameters).toHaveLength(1);
      expect(functionModel.parameters[0].description).toBe('Input parameter');
      expect(functionModel.return_).toBeDefined();
      expect(functionModel.return_!.name).toBe('output');
      expect(functionModel.return_!.description).toBe('Output result');
    });

    it('should create FunctionModel with empty parameters array', () => {
      const json = {
        name: 'no_params',
        description: 'Function without parameters',
        parameters: []
      };

      const functionModel = FunctionModel.fromJson(json);

      expect(functionModel.name).toBe('no_params');
      expect(functionModel.parameters).toEqual([]);
    });

    it('should create FunctionModel with null/undefined parameters', () => {
      const json = {
        name: 'null_params',
        description: 'Function with null parameters',
        parameters: null
      };

      const functionModel = FunctionModel.fromJson(json);

      expect(functionModel.name).toBe('null_params');
      expect(functionModel.parameters).toEqual([]);
    });

    it('should create FunctionModel with multiple complex parameters', () => {
      const json = {
        name: 'complex_function',
        description: 'Function with complex parameters',
        parameters: [
          {
            name: 'user',
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'integer' }
              },
              required: ['name']
            },
            required: true
          },
          {
            name: 'options',
            schema: {
              type: 'array',
              items: { type: 'string' }
            },
            required: false
          }
        ]
      };

      const functionModel = FunctionModel.fromJson(json);

      expect(functionModel.parameters).toHaveLength(2);
      expect(functionModel.parameters[0].name).toBe('user');
      expect(functionModel.parameters[0].schema.type).toBe('object');
      expect(functionModel.parameters[1].name).toBe('options');
      expect(functionModel.parameters[1].schema.type).toBe('array');
    });
  });

  describe('toJson', () => {
    it('should serialize FunctionModel with required fields only', () => {
      const parameters = [
        new Parameter('input', new Schema(SchemaType.STRING), true)
      ];
      const functionModel = new FunctionModel('test_function', 'Test function', parameters);

      const json = functionModel.toJson();

      expect(json).toEqual({
        name: 'test_function',
        description: 'Test function',
        parameters: [
          {
            name: 'input',
            schema: { type: 'string' },
            required: true
          }
        ]
      });
    });

    it('should serialize FunctionModel with all fields', () => {
      const parameters = [
        new Parameter('input', new Schema(SchemaType.STRING), true, 'Input parameter')
      ];
      const returnModel = new Return('output', new Schema(SchemaType.OBJECT), 'Output result');
      const functionModel = new FunctionModel('test_function', 'Test function', parameters, returnModel);

      const json = functionModel.toJson();

      expect(json).toEqual({
        name: 'test_function',
        description: 'Test function',
        parameters: [
          {
            name: 'input',
            description: 'Input parameter',
            schema: { type: 'string' },
            required: true
          }
        ],
        return: {
          name: 'output',
          description: 'Output result',
          schema: { type: 'object' }
        }
      });
    });

    it('should serialize FunctionModel with empty parameters', () => {
      const functionModel = new FunctionModel('no_params', 'Function without parameters', []);

      const json = functionModel.toJson();

      expect(json).toEqual({
        name: 'no_params',
        description: 'Function without parameters',
        parameters: []
      });
    });

    it('should exclude undefined return field', () => {
      const parameters = [new Parameter('input', new Schema(SchemaType.STRING), true)];
      const functionModel = new FunctionModel('test_function', 'Test function', parameters);

      const json = functionModel.toJson();

      expect(json).not.toHaveProperty('return');
    });

    it('should serialize complex parameters correctly', () => {
      const userSchema = new Schema(
        SchemaType.OBJECT,
        'User object',
        {
          name: new Schema(SchemaType.STRING),
          age: new Schema(SchemaType.INTEGER)
        },
        undefined,
        undefined,
        ['name']
      );
      const parameters = [
        new Parameter('user', userSchema, true, 'User information')
      ];
      const functionModel = new FunctionModel('update_user', 'Update user information', parameters);

      const json = functionModel.toJson();

      expect(json.parameters[0].name).toBe('user');
      expect(json.parameters[0].schema.type).toBe('object');
      expect(json.parameters[0].schema.properties.name.type).toBe('string');
      expect(json.parameters[0].schema.properties.age.type).toBe('integer');
      expect(json.parameters[0].schema.required).toEqual(['name']);
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        name: 'complex_function',
        description: 'A complex function with multiple parameters',
        parameters: [
          {
            name: 'data',
            description: 'Input data',
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              }
            },
            required: true
          },
          {
            name: 'options',
            schema: {
              type: 'object',
              properties: {
                sort: { type: 'boolean' },
                limit: { type: 'integer' }
              }
            },
            required: false
          }
        ],
        return: {
          name: 'result',
          schema: {
            type: 'object',
            properties: {
              processed: { type: 'integer' },
              errors: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      };

      const functionModel1 = FunctionModel.fromJson(originalJson);
      const serialized = functionModel1.toJson();
      const functionModel2 = FunctionModel.fromJson(serialized);

      expect(functionModel2.name).toBe(originalJson.name);
      expect(functionModel2.description).toBe(originalJson.description);
      expect(functionModel2.parameters).toHaveLength(2);
      expect(functionModel2.parameters[0].name).toBe('data');
      expect(functionModel2.parameters[0].schema.type).toBe('array');
      expect(functionModel2.parameters[1].name).toBe('options');
      expect(functionModel2.parameters[1].required).toBe(false);
      expect(functionModel2.return_).toBeDefined();
      expect(functionModel2.return_!.name).toBe('result');
    });

    it('should handle function without return value', () => {
      const originalJson = {
        name: 'void_function',
        description: 'Function that returns nothing',
        parameters: [
          {
            name: 'message',
            schema: { type: 'string' },
            required: true
          }
        ]
      };

      const functionModel1 = FunctionModel.fromJson(originalJson);
      const serialized = functionModel1.toJson();
      const functionModel2 = FunctionModel.fromJson(serialized);

      expect(functionModel2.name).toBe(originalJson.name);
      expect(functionModel2.description).toBe(originalJson.description);
      expect(functionModel2.parameters).toHaveLength(1);
      expect(functionModel2.return_).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string name and description', () => {
      const functionModel = new FunctionModel('', '', []);

      expect(functionModel.name).toBe('');
      expect(functionModel.description).toBe('');
      
      const json = functionModel.toJson();
      expect(json.name).toBe('');
      expect(json.description).toBe('');
    });

    it('should handle function with many parameters', () => {
      const parameters = Array.from({ length: 10 }, (_, i) => 
        new Parameter(`param${i}`, new Schema(SchemaType.STRING), true)
      );
      const functionModel = new FunctionModel('many_params', 'Function with many parameters', parameters);

      const json = functionModel.toJson();
      expect(json.parameters).toHaveLength(10);
      json.parameters.forEach((param: any, i: number) => {
        expect(param.name).toBe(`param${i}`);
      });
    });

    it('should preserve parameter order', () => {
      const parameters = [
        new Parameter('first', new Schema(SchemaType.STRING), true),
        new Parameter('second', new Schema(SchemaType.INTEGER), true),
        new Parameter('third', new Schema(SchemaType.BOOLEAN), false)
      ];
      const functionModel = new FunctionModel('ordered_function', 'Function with ordered parameters', parameters);

      const json = functionModel.toJson();
      expect(json.parameters[0].name).toBe('first');
      expect(json.parameters[1].name).toBe('second');
      expect(json.parameters[2].name).toBe('third');
    });
  });
});