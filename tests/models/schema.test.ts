import { Schema, SchemaType, SchemasSingleton } from '../../src/models/schema';

describe('SchemaType', () => {
  it('should define correct type constants', () => {
    expect(SchemaType.BOOLEAN).toBe('boolean');
    expect(SchemaType.INTEGER).toBe('integer');
    expect(SchemaType.NUMBER).toBe('number');
    expect(SchemaType.STRING).toBe('string');
    expect(SchemaType.ARRAY).toBe('array');
    expect(SchemaType.OBJECT).toBe('object');
  });
});

describe('Schema', () => {
  describe('constructor', () => {
    it('should create Schema with type only', () => {
      const schema = new Schema(SchemaType.STRING);

      expect(schema.type).toBe(SchemaType.STRING);
      expect(schema.description).toBeUndefined();
      expect(schema.properties).toBeUndefined();
      expect(schema.items).toBeUndefined();
      expect(schema.enum_).toBeUndefined();
      expect(schema.required).toBeUndefined();
    });

    it('should create Schema with all parameters', () => {
      const itemSchema = new Schema(SchemaType.STRING);
      const properties = { name: new Schema(SchemaType.STRING) };
      const enumValues = ['option1', 'option2'];
      const required = ['name'];

      const schema = new Schema(
        SchemaType.OBJECT,
        'Test description',
        properties,
        itemSchema,
        enumValues,
        required
      );

      expect(schema.type).toBe(SchemaType.OBJECT);
      expect(schema.description).toBe('Test description');
      expect(schema.properties).toBe(properties);
      expect(schema.items).toBe(itemSchema);
      expect(schema.enum_).toBe(enumValues);
      expect(schema.required).toBe(required);
    });
  });

  describe('fromJson', () => {
    it('should create Schema from simple JSON', () => {
      const json = {
        type: 'string',
        description: 'A string field'
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('string');
      expect(schema.description).toBe('A string field');
    });

    it('should create Schema with properties from JSON', () => {
      const json = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' }
        },
        required: ['name']
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties!['name'].type).toBe('string');
      expect(schema.properties!['age'].type).toBe('integer');
      expect(schema.required).toEqual(['name']);
    });

    it('should create Schema with array items from JSON', () => {
      const json = {
        type: 'array',
        items: {
          type: 'string'
        }
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('array');
      expect(schema.items).toBeDefined();
      expect(schema.items!.type).toBe('string');
    });

    it('should create Schema with enum from JSON', () => {
      const json = {
        type: 'string',
        enum: ['option1', 'option2', 'option3']
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('string');
      expect(schema.enum_).toEqual(['option1', 'option2', 'option3']);
    });

    it('should handle nested object schemas', () => {
      const json = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('object');
      expect(schema.properties!['user'].type).toBe('object');
      expect(schema.properties!['user'].properties!['name'].type).toBe('string');
      expect(schema.properties!['user'].properties!['email'].type).toBe('string');
    });
  });

  describe('toJson', () => {
    it('should serialize simple Schema', () => {
      const schema = new Schema(SchemaType.STRING, 'A string field');

      const json = schema.toJson();

      expect(json).toEqual({
        type: 'string',
        description: 'A string field'
      });
    });

    it('should serialize Schema with properties', () => {
      const properties = {
        name: new Schema(SchemaType.STRING),
        age: new Schema(SchemaType.INTEGER)
      };
      const schema = new Schema(SchemaType.OBJECT, undefined, properties, undefined, undefined, ['name']);

      const json = schema.toJson();

      expect(json.type).toBe('object');
      expect(json.properties.name.type).toBe('string');
      expect(json.properties.age.type).toBe('integer');
      expect(json.required).toEqual(['name']);
    });

    it('should serialize Schema with array items', () => {
      const itemSchema = new Schema(SchemaType.STRING);
      const schema = new Schema(SchemaType.ARRAY, undefined, undefined, itemSchema);

      const json = schema.toJson();

      expect(json).toEqual({
        type: 'array',
        items: {
          type: 'string'
        }
      });
    });

    it('should serialize Schema with enum', () => {
      const schema = new Schema(SchemaType.STRING, undefined, undefined, undefined, ['option1', 'option2']);

      const json = schema.toJson();

      expect(json).toEqual({
        type: 'string',
        enum: ['option1', 'option2']
      });
    });

    it('should exclude undefined fields', () => {
      const schema = new Schema(SchemaType.STRING);

      const json = schema.toJson();

      expect(json).toEqual({ type: 'string' });
      expect(json).not.toHaveProperty('description');
      expect(json).not.toHaveProperty('properties');
      expect(json).not.toHaveProperty('items');
      expect(json).not.toHaveProperty('enum');
      expect(json).not.toHaveProperty('required');
    });
  });

  describe('enum validation', () => {
    it('should validate string enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'string',
          enum: ['valid1', 'valid2']
        });
      }).not.toThrow();
    });

    it('should validate integer enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'integer',
          enum: [1, 2, 3]
        });
      }).not.toThrow();
    });

    it('should validate number enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'number',
          enum: [1.5, 2.7, 3.14]
        });
      }).not.toThrow();
    });

    it('should validate boolean enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'boolean',
          enum: [true, false]
        });
      }).not.toThrow();
    });

    it('should throw error for invalid string enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'string',
          enum: ['valid', 123]
        });
      }).toThrow('Enum value at index 1 ("123") does not match schema type "string"');
    });

    it('should throw error for invalid integer enum values', () => {
      expect(() => {
        Schema.fromJson({
          type: 'integer',
          enum: [1, 2.5]
        });
      }).toThrow('Enum value at index 1 ("2.5") does not match schema type "integer"');
    });

    it('should allow null values in enum', () => {
      expect(() => {
        Schema.fromJson({
          type: 'string',
          enum: ['valid', null]
        });
      }).not.toThrow();
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        type: 'object',
        description: 'Test object',
        properties: {
          name: { type: 'string' },
          items: {
            type: 'array',
            items: { type: 'integer' }
          }
        },
        required: ['name']
      };

      const schema1 = Schema.fromJson(originalJson);
      const serialized = schema1.toJson();
      const schema2 = Schema.fromJson(serialized);

      expect(schema2.type).toBe(originalJson.type);
      expect(schema2.description).toBe(originalJson.description);
      expect(schema2.properties!['name'].type).toBe('string');
      expect(schema2.properties!['items'].type).toBe('array');
      expect(schema2.properties!['items'].items!.type).toBe('integer');
      expect(schema2.required).toEqual(['name']);
    });
  });
});

describe('SchemasSingleton', () => {
  beforeEach(() => {
    // Reset singleton state
    (SchemasSingleton as any)._schemas = {};
  });

  describe('initInstance', () => {
    it('should initialize schemas from JSON', () => {
      const schemasJson = {
        'User': {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        },
        'Item': {
          type: 'object',
          properties: {
            id: { type: 'integer' }
          }
        }
      };

      SchemasSingleton.initInstance(schemasJson);

      const instance = SchemasSingleton.getInstance();
      expect(instance['User']).toBeDefined();
      expect(instance['User'].type).toBe('object');
      expect(instance['Item']).toBeDefined();
      expect(instance['Item'].type).toBe('object');
    });

    it('should skip schemas with $ref', () => {
      const schemasJson = {
        'User': {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        },
        'RefSchema': {
          '$ref': '#/schemas/User'
        }
      };

      SchemasSingleton.initInstance(schemasJson);

      const instance = SchemasSingleton.getInstance();
      expect(instance['User']).toBeDefined();
      expect(instance['RefSchema']).toBeUndefined();
    });
  });

  describe('getInstance', () => {
    it('should return empty object initially', () => {
      const instance = SchemasSingleton.getInstance();
      expect(instance).toEqual({});
    });

    it('should return initialized schemas', () => {
      const schemasJson = {
        'TestSchema': {
          type: 'string'
        }
      };

      SchemasSingleton.initInstance(schemasJson);
      const instance = SchemasSingleton.getInstance();

      expect(instance['TestSchema']).toBeDefined();
      expect(instance['TestSchema'].type).toBe('string');
    });
  });

  describe('Schema $ref resolution', () => {
    beforeEach(() => {
      const schemasJson = {
        'User': {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      };
      SchemasSingleton.initInstance(schemasJson);
    });

    it('should resolve valid $ref', () => {
      const json = {
        '$ref': '#/schemas/User'
      };

      const schema = Schema.fromJson(json);

      expect(schema.type).toBe('object');
      expect(schema.properties!['name'].type).toBe('string');
    });

    it('should throw error for invalid $ref format', () => {
      const json = {
        '$ref': 'invalid/ref/format'
      };

      expect(() => {
        Schema.fromJson(json);
      }).toThrow('#ref format exception: invalid/ref/format');
    });

    it('should throw error for non-existent $ref', () => {
      const json = {
        '$ref': '#/schemas/NonExistent'
      };

      expect(() => {
        Schema.fromJson(json);
      }).toThrow('#ref not found: #/schemas/NonExistent');
    });
  });
});