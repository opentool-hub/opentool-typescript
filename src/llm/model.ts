export class FunctionCall {
  id: string;
  name: string;
  arguments: { [key: string]: any };

  constructor(id: string, name: string, args: { [key: string]: any }) {
    this.id = id;
    this.name = name;
    this.arguments = args;
  }

  static fromJson(json: any): FunctionCall {
    return new FunctionCall(
      json.id,
      json.name,
      json.arguments
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      arguments: this.arguments
    };
  }
}

export class ToolReturn {
  id: string;
  result: { [key: string]: any };

  constructor(id: string, result: { [key: string]: any }) {
    this.id = id;
    this.result = result;
  }

  static fromJson(json: any): ToolReturn {
    return new ToolReturn(
      json.id,
      json.result
    );
  }

  toJson(): any {
    return {
      id: this.id,
      result: this.result
    };
  }
}