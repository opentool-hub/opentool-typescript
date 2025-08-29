import { Parameter } from '../../src/models/parameter';
import { Schema, SchemaType } from '../../src/models/schema';

describe('Parameter', () => {
  describe('constructor', () => {
    it('should create Parameter with required fields', () => {
      const schema = new Schema(SchemaType.STRING);
      const parameter = new Parameter('test_param', schema, true);

      expect(parameter.name).toBe('test_param');
      expect(parameter.schema).toBe(schema);
      expect(parameter.required).toBe(true);
      expect(parameter.description).toBeUndefined();
    });

    it('should create Parameter with description', () => {
      const schema = new Schema(SchemaType.STRING);
      const parameter = new Parameter('test_param', schema, false, 'Test description');

      expect(parameter.name).toBe('test_param');
      expect(parameter.schema).toBe(schema);
      expect(parameter.required).toBe(false);
      expect(parameter.description).toBe('Test description');
    });
  });

  describe('fromJson', () => {
    it('should create Parameter from JSON with required fields', () => {
      const json = {
        name: 'test_param',
        schema: { type: 'string' },
        required: true
      };

      const parameter = Parameter.fromJson(json);

      expect(parameter.name).toBe('test_param');
      expect(parameter.schema.type).toBe('string');
      expect(parameter.required).toBe(true);
      expect(parameter.description).toBeUndefined();
    });

    it('should create Parameter from JSON with all fields', () => {
      const json = {
        name: 'test_param',
        description: 'Test description',
        schema: { type: 'integer' },
        required: false
      };

      const parameter = Parameter.fromJson(json);

      expect(parameter.name).toBe('test_param');
      expect(parameter.description).toBe('Test description');
      expect(parameter.schema.type).toBe('integer');
      expect(parameter.required).toBe(false);
    });

    it('should create Parameter with complex schema from JSON', () => {
      const json = {
        name: 'complex_param',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'integer' }
          },
          required: ['name']
        },
        required: true
      };

      const parameter = Parameter.fromJson(json);

      expect(parameter.name).toBe('complex_param');
      expect(parameter.schema.type).toBe('object');
      expect(parameter.schema.properties!['name'].type).toBe('string');
      expect(parameter.schema.properties!['age'].type).toBe('integer');
      expect(parameter.schema.required).toEqual(['name']);
      expect(parameter.required).toBe(true);
    });
  });

  describe('toJson', () => {
    it('should serialize Parameter with required fields only', () => {
      const schema = new Schema(SchemaType.STRING);
      const parameter = new Parameter('test_param', schema, true);

      const json = parameter.toJson();

      expect(json).toEqual({
        name: 'test_param',
        schema: { type: 'string' },
        required: true
      });
    });

    it('should serialize Parameter with all fields', () => {
      const schema = new Schema(SchemaType.INTEGER, 'An integer value');
      const parameter = new Parameter('test_param', schema, false, 'Test description');

      const json = parameter.toJson();

      expect(json).toEqual({
        name: 'test_param',
        description: 'Test description',
        schema: {
          type: 'integer',
          description: 'An integer value'
        },
        required: false
      });
    });

    it('should serialize Parameter with complex schema', () => {
      const properties = {
        name: new Schema(SchemaType.STRING),
        age: new Schema(SchemaType.INTEGER)
      };
      const schema = new Schema(SchemaType.OBJECT, undefined, properties, undefined, undefined, ['name']);
      const parameter = new Parameter('complex_param', schema, true);

      const json = parameter.toJson();

      expect(json.name).toBe('complex_param');
      expect(json.schema.type).toBe('object');
      expect(json.schema.properties.name.type).toBe('string');
      expect(json.schema.properties.age.type).toBe('integer');
      expect(json.schema.required).toEqual(['name']);
      expect(json.required).toBe(true);
    });

    it('should exclude undefined description', () => {
      const schema = new Schema(SchemaType.STRING);
      const parameter = new Parameter('test_param', schema, true);

      const json = parameter.toJson();

      expect(json).not.toHaveProperty('description');
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        name: 'test_param',
        description: 'Test description',
        schema: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of strings'
        },
        required: true
      };

      const parameter1 = Parameter.fromJson(originalJson);
      const serialized = parameter1.toJson();
      const parameter2 = Parameter.fromJson(serialized);

      expect(parameter2.name).toBe(originalJson.name);
      expect(parameter2.description).toBe(originalJson.description);
      expect(parameter2.schema.type).toBe('array');
      expect(parameter2.schema.items!.type).toBe('string');
      expect(parameter2.schema.description).toBe('Array of strings');
      expect(parameter2.required).toBe(originalJson.required);
    });

    it('should handle parameter without description', () => {
      const originalJson = {
        name: 'simple_param',
        schema: { type: 'boolean' },
        required: false
      };

      const parameter1 = Parameter.fromJson(originalJson);
      const serialized = parameter1.toJson();
      const parameter2 = Parameter.fromJson(serialized);

      expect(parameter2.name).toBe(originalJson.name);
      expect(parameter2.description).toBeUndefined();
      expect(parameter2.schema.type).toBe('boolean');
      expect(parameter2.required).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle boolean required values correctly', () => {
      const schema = new Schema(SchemaType.STRING);
      
      const requiredParam = new Parameter('required_param', schema, true);
      const optionalParam = new Parameter('optional_param', schema, false);

      expect(requiredParam.required).toBe(true);
      expect(optionalParam.required).toBe(false);
    });

    it('should handle empty string name', () => {
      const schema = new Schema(SchemaType.STRING);
      const parameter = new Parameter('', schema, true);

      expect(parameter.name).toBe('');
      
      const json = parameter.toJson();
      expect(json.name).toBe('');
    });

    it('should handle null description properly', () => {
      const json = {
        name: 'test_param',
        schema: { type: 'string' },
        required: true,
        description: null
      };

      const parameter = Parameter.fromJson(json);
      expect(parameter.description).toBeNull();
    });
  });
});