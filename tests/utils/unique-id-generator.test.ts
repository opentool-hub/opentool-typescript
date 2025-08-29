import { uniqueId, testUniqueId } from '../../src/utils/unique-id-generator';

describe('uniqueId', () => {
  describe('UUID generation (default)', () => {
    it('should generate UUID by default', () => {
      const id = uniqueId();
      
      // UUID v4 format: 8-4-4-4-12 characters
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
      expect(id).toHaveLength(36); // 32 hex chars + 4 hyphens
    });

    it('should generate UUID when shorter is false', () => {
      const id = uniqueId(false);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
      expect(id).toHaveLength(36);
    });

    it('should generate unique UUIDs', () => {
      const ids = new Set();
      
      // Generate 100 UUIDs and ensure they're all unique
      for (let i = 0; i < 100; i++) {
        const id = uniqueId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      
      expect(ids.size).toBe(100);
    });
  });

  describe('Short ID generation', () => {
    it('should generate short ID when shorter is true', () => {
      const id = uniqueId(true);
      
      // Short ID should be 10 characters long (UUID slice)
      expect(id).toHaveLength(10);
      expect(typeof id).toBe('string');
    });

    it('should use UUID slice for shorter IDs', () => {
      const id = uniqueId(true);
      // Should be 10 character string from UUID
      expect(id).toHaveLength(10);
      expect(typeof id).toBe('string');
    });
  });

  describe('parameter handling', () => {
    it('should handle explicit undefined', () => {
      const id = uniqueId(undefined);
      
      // Should default to UUID when undefined
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should differentiate between UUID and short ID formats', () => {
      const uuidId = uniqueId(false);
      const shortId = uniqueId(true);
      
      expect(uuidId).toHaveLength(36);
      expect(shortId).toHaveLength(10); // UUID slice length
      expect(uuidId).toContain('-');
      // Short ID might contain '-' since it's a UUID slice, but should be shorter
      expect(shortId.length).toBeLessThan(uuidId.length);
    });
  });

  describe('consistency', () => {
    it('should consistently generate same format for same parameter', () => {
      const uuidIds = [uniqueId(false), uniqueId(false), uniqueId(false)];
      const shortIds = [uniqueId(true), uniqueId(true), uniqueId(true)];
      
      // All UUIDs should have same format
      uuidIds.forEach(id => {
        expect(id).toHaveLength(36);
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
      
      // All short IDs should be 10 characters long
      shortIds.forEach(id => {
        expect(id).toHaveLength(10);
        expect(typeof id).toBe('string');
      });
    });

    it('should generate unique UUIDs and unique short IDs', () => {
      const rapidUuids: string[] = [];
      const rapidShortIds: string[] = [];
      
      // Generate UUIDs and short IDs
      for (let i = 0; i < 10; i++) {
        rapidUuids.push(uniqueId(false));
        rapidShortIds.push(uniqueId(true));
      }
      
      const uniqueUuids = new Set(rapidUuids);
      const uniqueShortIds = new Set(rapidShortIds);
      
      // UUIDs should all be unique
      expect(uniqueUuids.size).toBe(rapidUuids.length);
      // Short IDs should also be unique (high probability with UUID slices)
      expect(uniqueShortIds.size).toBe(rapidShortIds.length);
    });
  });

  describe('performance characteristics', () => {
    it('should generate IDs efficiently', () => {
      const startTime = Date.now();
      
      // Generate 1000 IDs
      for (let i = 0; i < 1000; i++) {
        uniqueId();
        uniqueId(true);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});

describe('testUniqueId', () => {
  it('should call uniqueId function without errors', () => {
    // Mock console.log to capture output
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    expect(() => testUniqueId()).not.toThrow();
    
    // Should have called console.log with a UUID
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const loggedValue = consoleSpy.mock.calls[0][0];
    
    // Should be a UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(loggedValue).toMatch(uuidRegex);
    
    consoleSpy.mockRestore();
  });

  it('should generate different IDs each time called', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    testUniqueId();
    const firstId = consoleSpy.mock.calls[0][0];
    
    consoleSpy.mockClear();
    
    testUniqueId();
    const secondId = consoleSpy.mock.calls[0][0];
    
    expect(firstId).not.toBe(secondId);
    
    consoleSpy.mockRestore();
  });
});