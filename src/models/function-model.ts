import { Expose, Type, Transform } from 'class-transformer';
import { Parameter } from './parameter';
import { Return } from './return';

export class FunctionModel {
  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => Parameter)
  parameters: Parameter[];

  @Expose({ name: 'return' })
  @Type(() => Return)
  return_?: Return;

  constructor(name: string, description: string, parameters: Parameter[], return_?: Return) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.return_ = return_;
  }

  static fromJson(json: any): FunctionModel {
    return new FunctionModel(
      json.name,
      json.description,
      json.parameters ? json.parameters.map((param: any) => Parameter.fromJson(param)) : [],
      json.return ? Return.fromJson(json.return) : undefined
    );
  }

  toJson(): any {
    const result: any = {
      name: this.name,
      description: this.description,
      parameters: this.parameters.map(param => param.toJson())
    };

    if (this.return_ !== undefined) {
      result.return = this.return_.toJson();
    }

    return result;
  }
}