import { Expose, Type } from 'class-transformer';
import { Schema } from './schema';

export class Return {  
  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => Schema)
  schema: Schema;

  constructor(name: string, schema: Schema, description?: string) {
    this.name = name;
    this.schema = schema;
    this.description = description;
  }

  static fromJson(json: any): Return {
    return new Return(
      json.name,
      Schema.fromJson(json.schema),
      json.description
    );
  }

  toJson(): any {
    const result: any = {
      name: this.name,
      schema: this.schema.toJson()
    };

    if (this.description !== undefined) {
      result.description = this.description;
    }

    return result;
  }
}