import { Expose, Transform, Type } from 'class-transformer';

export class SchemaType {
  static readonly BOOLEAN = "boolean";
  static readonly INTEGER = "integer";
  static readonly NUMBER = "number";
  static readonly STRING = "string";
  static readonly ARRAY = "array";
  static readonly OBJECT = "object";
}

export class Schema {
  @Expose()
  type: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => Schema)
  properties?: { [key: string]: Schema };

  @Expose()
  @Type(() => Schema)
  items?: Schema;

  @Expose({ name: 'enum' })
  enum_?: any[];

  @Expose()
  required?: string[];

  constructor(
    type: string,
    description?: string,
    properties?: { [key: string]: Schema },
    items?: Schema,
    enum_?: any[],
    required?: string[]
  ) {
    this.type = type;
    this.description = description;
    this.properties = properties;
    this.items = items;
    this.enum_ = enum_;
    this.required = required;
  }

  static fromJson(json: any): Schema {
    if (json["$ref"] != null) {
      const schema = this._fromRef(json["$ref"] as string);
      schema._validateEnumConsistency();
      return schema;
    }

    const schema = new Schema(
      json.type,
      json.description,
      json.properties ? Object.fromEntries(
        Object.entries(json.properties).map(([key, value]) => [key, Schema.fromJson(value)])
      ) : undefined,
      json.items ? Schema.fromJson(json.items) : undefined,
      json.enum,
      json.required
    );

    schema._validateEnumConsistency();
    return schema;
  }

  toJson(): any {
    const result: any = {
      type: this.type
    };

    if (this.description !== undefined) {
      result.description = this.description;
    }

    if (this.properties !== undefined) {
      result.properties = Object.fromEntries(
        Object.entries(this.properties).map(([key, value]) => [key, value.toJson()])
      );
    }

    if (this.items !== undefined) {
      result.items = this.items.toJson();
    }

    if (this.enum_ !== undefined) {
      result.enum = this.enum_;
    }

    if (this.required !== undefined) {
      result.required = this.required;
    }

    return result;
  }

  private static _fromRef(ref: string): Schema {
    const parts = ref.split("/");
    if (parts[0] === "#" && parts[1] === "schemas") {
      const refName = parts[2];
      const schema = SchemasSingleton.getInstance()[refName];
      if (schema != null) {
        return schema;
      } else {
        throw new Error(`#ref not found: ${ref}`);
      }
    } else {
      throw new Error(`#ref format exception: ${ref}`);
    }
  }

  private _validateEnumConsistency(): void {
    if (this.enum_ == null || this.enum_.length === 0) {
      return;
    }

    for (let i = 0; i < this.enum_.length; i++) {
      const value = this.enum_[i];
      if (!this._isValueConsistentWithType(value)) {
        throw new Error(`Enum value at index ${i} ("${value}") does not match schema type "${this.type}".`);
      }
    }
  }

  private _isValueConsistentWithType(value: any): boolean {
    switch (this.type) {
      case 'string':
        return typeof value === 'string' || value == null;
      case 'integer':
        return Number.isInteger(value) || value == null;
      case 'number':
        return (typeof value === 'number' && typeof value !== 'boolean') || value == null;
      case 'boolean':
        return typeof value === 'boolean' || value == null;
      case 'null':
        return value == null;
      default:
        return true;
    }
  }
}

export class SchemasSingleton {
  private static _schemas: { [key: string]: Schema } = {};

  static initInstance(schemasJson: { [key: string]: any }): void {
    Object.entries(schemasJson).forEach(([key, value]) => {
      const schemaName = key;
      const schemaMap = value;
      if (schemaMap["$ref"] == null) {
        this._schemas[schemaName] = Schema.fromJson(schemaMap);
      }
    });
  }

  static getInstance(): { [key: string]: Schema } {
    return this._schemas;
  }
}