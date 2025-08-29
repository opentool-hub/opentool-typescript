import { Return } from '../../src/models/return';
import { Schema, SchemaType } from '../../src/models/schema';

describe('Return', () => {
  describe('constructor', () => {
    it('should create Return with required fields', () => {
      const schema = new Schema(SchemaType.STRING);
      const returnModel = new Return('test_return', schema);

      expect(returnModel.name).toBe('test_return');
      expect(returnModel.schema).toBe(schema);
      expect(returnModel.description).toBeUndefined();
    });

    it('should create Return with description', () => {
      const schema = new Schema(SchemaType.OBJECT);
      const returnModel = new Return('test_return', schema, 'Test description');

      expect(returnModel.name).toBe('test_return');
      expect(returnModel.schema).toBe(schema);
      expect(returnModel.description).toBe('Test description');
    });
  });

  describe('fromJson', () => {
    it('should create Return from JSON with required fields', () => {
      const json = {
        name: 'test_return',
        schema: { type: 'string' }
      };

      const returnModel = Return.fromJson(json);

      expect(returnModel.name).toBe('test_return');
      expect(returnModel.schema.type).toBe('string');
      expect(returnModel.description).toBeUndefined();
    });

    it('should create Return from JSON with all fields', () => {
      const json = {
        name: 'test_return',
        description: 'Test description',
        schema: { type: 'integer' }
      };

      const returnModel = Return.fromJson(json);

      expect(returnModel.name).toBe('test_return');
      expect(returnModel.description).toBe('Test description');
      expect(returnModel.schema.type).toBe('integer');
    });

    it('should create Return with complex schema from JSON', () => {
      const json = {
        name: 'complex_return',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            data: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['id']
        },
        description: 'Complex return object'
      };

      const returnModel = Return.fromJson(json);

      expect(returnModel.name).toBe('complex_return');
      expect(returnModel.description).toBe('Complex return object');
      expect(returnModel.schema.type).toBe('object');
      expect(returnModel.schema.properties!['id'].type).toBe('integer');
      expect(returnModel.schema.properties!['data'].type).toBe('array');
      expect(returnModel.schema.properties!['data'].items!.type).toBe('string');
      expect(returnModel.schema.required).toEqual(['id']);
    });
  });

  describe('toJson', () => {
    it('should serialize Return with required fields only', () => {
      const schema = new Schema(SchemaType.BOOLEAN);
      const returnModel = new Return('test_return', schema);

      const json = returnModel.toJson();

      expect(json).toEqual({
        name: 'test_return',
        schema: { type: 'boolean' }
      });
    });

    it('should serialize Return with all fields', () => {
      const schema = new Schema(SchemaType.NUMBER, 'A number value');
      const returnModel = new Return('test_return', schema, 'Test description');

      const json = returnModel.toJson();

      expect(json).toEqual({
        name: 'test_return',
        description: 'Test description',
        schema: {
          type: 'number',
          description: 'A number value'
        }
      });
    });

    it('should serialize Return with complex schema', () => {
      const properties = {
        success: new Schema(SchemaType.BOOLEAN),
        message: new Schema(SchemaType.STRING)
      };
      const schema = new Schema(SchemaType.OBJECT, 'Response object', properties, undefined, undefined, ['success']);
      const returnModel = new Return('api_response', schema, 'API response object');

      const json = returnModel.toJson();

      expect(json.name).toBe('api_response');
      expect(json.description).toBe('API response object');
      expect(json.schema.type).toBe('object');
      expect(json.schema.description).toBe('Response object');
      expect(json.schema.properties.success.type).toBe('boolean');
      expect(json.schema.properties.message.type).toBe('string');
      expect(json.schema.required).toEqual(['success']);
    });

    it('should exclude undefined description', () => {
      const schema = new Schema(SchemaType.STRING);
      const returnModel = new Return('test_return', schema);

      const json = returnModel.toJson();

      expect(json).not.toHaveProperty('description');
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        name: 'test_return',
        description: 'Test description',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            }
          },
          description: 'Array of objects'
        }
      };

      const returnModel1 = Return.fromJson(originalJson);
      const serialized = returnModel1.toJson();
      const returnModel2 = Return.fromJson(serialized);

      expect(returnModel2.name).toBe(originalJson.name);
      expect(returnModel2.description).toBe(originalJson.description);
      expect(returnModel2.schema.type).toBe('array');
      expect(returnModel2.schema.description).toBe('Array of objects');
      expect(returnModel2.schema.items!.type).toBe('object');
      expect(returnModel2.schema.items!.properties!['id'].type).toBe('integer');
      expect(returnModel2.schema.items!.properties!['name'].type).toBe('string');
    });

    it('should handle return without description', () => {
      const originalJson = {
        name: 'simple_return',
        schema: { type: 'boolean' }
      };

      const returnModel1 = Return.fromJson(originalJson);
      const serialized = returnModel1.toJson();
      const returnModel2 = Return.fromJson(serialized);

      expect(returnModel2.name).toBe(originalJson.name);
      expect(returnModel2.description).toBeUndefined();
      expect(returnModel2.schema.type).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string name', () => {
      const schema = new Schema(SchemaType.STRING);
      const returnModel = new Return('', schema);

      expect(returnModel.name).toBe('');
      
      const json = returnModel.toJson();
      expect(json.name).toBe('');
    });

    it('should handle null description properly', () => {
      const json = {
        name: 'test_return',
        schema: { type: 'string' },
        description: null
      };

      const returnModel = Return.fromJson(json);
      expect(returnModel.description).toBeNull();
    });

    it('should work with enum schema', () => {
      const json = {
        name: 'status_return',
        schema: {
          type: 'string',
          enum: ['success', 'error', 'pending']
        },
        description: 'Status enumeration'
      };

      const returnModel = Return.fromJson(json);

      expect(returnModel.name).toBe('status_return');
      expect(returnModel.schema.type).toBe('string');
      expect(returnModel.schema.enum_).toEqual(['success', 'error', 'pending']);
      expect(returnModel.description).toBe('Status enumeration');

      const serialized = returnModel.toJson();
      expect(serialized.schema.enum).toEqual(['success', 'error', 'pending']);
    });
  });
});