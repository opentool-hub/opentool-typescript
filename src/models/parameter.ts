import { Expose, Type } from 'class-transformer';
import { Schema } from './schema';

export class Parameter {
  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => Schema)
  schema: Schema;

  @Expose()
  required: boolean;

  constructor(name: string, schema: Schema, required: boolean, description?: string) {
    this.name = name;
    this.schema = schema;
    this.required = required;
    this.description = description;
  }

  static fromJson(json: any): Parameter {
    return new Parameter(
      json.name,
      Schema.fromJson(json.schema),
      json.required,
      json.description
    );
  }

  toJson(): any {
    const result: any = {
      name: this.name,
      schema: this.schema.toJson(),
      required: this.required
    };

    if (this.description !== undefined) {
      result.description = this.description;
    }

    return result;
  }
}