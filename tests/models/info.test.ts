import { Info } from '../../src/models/info';

describe('Info', () => {
  describe('constructor', () => {
    it('should create Info with required fields', () => {
      const info = new Info('Test Tool', '1.0.0');

      expect(info.title).toBe('Test Tool');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBeUndefined();
    });

    it('should create Info with all fields', () => {
      const info = new Info('Test Tool', '1.0.0', 'A test description');

      expect(info.title).toBe('Test Tool');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBe('A test description');
    });
  });

  describe('fromJson', () => {
    it('should create Info from JSON with required fields', () => {
      const json = {
        title: 'Test Tool',
        version: '1.0.0'
      };

      const info = Info.fromJson(json);

      expect(info.title).toBe('Test Tool');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBeUndefined();
    });

    it('should create Info from JSON with all fields', () => {
      const json = {
        title: 'Test Tool',
        version: '1.0.0',
        description: 'A test description',
        host: 'localhost',
        port: 9627
      };

      const info = Info.fromJson(json);

      expect(info.title).toBe('Test Tool');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBe('A test description');
    });

    it('should handle null/undefined optional fields', () => {
      const json = {
        title: 'Test Tool',
        version: '1.0.0',
        description: null,
        host: undefined,
        port: null
      };

      const info = Info.fromJson(json);

      expect(info.title).toBe('Test Tool');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBeNull();
    });
  });

  describe('toJson', () => {
    it('should serialize Info with required fields only', () => {
      const info = new Info('Test Tool', '1.0.0');

      const json = info.toJson();

      expect(json).toEqual({
        title: 'Test Tool',
        version: '1.0.0'
      });
    });

    it('should serialize Info with all fields', () => {
      const info = new Info('Test Tool', '1.0.0', 'A test description');

      const json = info.toJson();

      expect(json).toEqual({
        title: 'Test Tool',
        version: '1.0.0',
        description: 'A test description'
      });
    });

    it('should exclude undefined optional fields', () => {
      const info = new Info('Test Tool', '1.0.0');

      const json = info.toJson();

      expect(json).toEqual({
        title: 'Test Tool',
        version: '1.0.0'
      });
      expect(json).not.toHaveProperty('description');
      expect(json).not.toHaveProperty('host');
      expect(json).not.toHaveProperty('port');
    });

    it('should include null optional fields', () => {
      const info = new Info('Test Tool', '1.0.0');
      info.description = null as any;

      const json = info.toJson();

      expect(json).toEqual({
        title: 'Test Tool',
        version: '1.0.0'
      });
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through fromJson -> toJson -> fromJson', () => {
      const originalJson = {
        title: 'Test Tool',
        version: '1.0.0',
        description: 'A test description',
        host: 'localhost',
        port: 9627
      };

      const info1 = Info.fromJson(originalJson);
      const serialized = info1.toJson();
      const info2 = Info.fromJson(serialized);

      expect(info2.title).toBe(originalJson.title);
      expect(info2.version).toBe(originalJson.version);
      expect(info2.description).toBe(originalJson.description);
    });
  });
});