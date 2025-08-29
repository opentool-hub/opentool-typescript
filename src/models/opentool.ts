import { Expose, Type } from 'class-transformer';
import { FunctionModel } from './function-model';
import { Info } from './info';
import { Schema } from './schema';
import { Server } from './server';

export class OpenTool {
  @Expose()
  opentool: string;

  @Expose()
  @Type(() => Info)
  info: Info;

  @Expose()
  @Type(() => Server)
  server?: Server;

  @Expose()
  @Type(() => FunctionModel)
  functions: FunctionModel[];

  @Expose()
  @Type(() => Schema)
  schemas?: { [key: string]: Schema };

  constructor(opentool: string, info: Info, server?: Server, functions: FunctionModel[] = [], schemas?: { [key: string]: Schema }) {
    this.opentool = opentool;
    this.info = info;
    this.server = server;
    this.functions = functions;
    this.schemas = schemas;
  }

  static fromJson(json: any): OpenTool {
    return new OpenTool(
      json.opentool,
      Info.fromJson(json.info),
      json.server ? Server.fromJson(json.server) : undefined,
      json.functions ? json.functions.map((func: any) => FunctionModel.fromJson(func)) : [],
      json.schemas ? Object.fromEntries(
        Object.entries(json.schemas).map(([key, value]) => [key, Schema.fromJson(value)])
      ) : undefined
    );
  }

  toJson(): any {
    const result: any = {
      opentool: this.opentool,
      info: this.info.toJson(),
      functions: this.functions.map(func => func.toJson())
    };

    if (this.server !== undefined) {
      result.server = this.server.toJson();
    }

    if (this.schemas !== undefined) {
      result.schemas = Object.fromEntries(
        Object.entries(this.schemas).map(([key, value]) => [
          key, 
          typeof value.toJson === 'function' ? value.toJson() : value
        ])
      );
    }

    return result;
  }
}