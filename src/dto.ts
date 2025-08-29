import { Expose } from 'class-transformer';

export const JSONRPC_VERSION = "2.0.0";
export const DEFAULT_PORT = 9627;
export const DEFAULT_PREFIX = "/opentool";

export class VersionDto {
  @Expose()
  version: string;

  constructor(version: string) {
    this.version = version;
  }

  static fromJson(json: any): VersionDto {
    return new VersionDto(json.version);
  }

  toJson(): any {
    return {
      version: this.version
    };
  }
}

export class JsonRPCHttpRequestBody {
  @Expose()
  jsonrpc: string = JSONRPC_VERSION;

  @Expose()
  method: string;

  @Expose()
  params?: { [key: string]: any };

  @Expose()
  id: string;

  constructor(method: string, id: string, params?: { [key: string]: any }) {
    this.method = method;
    this.id = id;
    this.params = params;
  }

  static fromJson(json: any): JsonRPCHttpRequestBody {
    if (!json || typeof json !== 'object' || !json.method || json.id === undefined) {
      throw new Error('Invalid request body');
    }
    return new JsonRPCHttpRequestBody(
      json.method,
      json.id,
      json.params
    );
  }

  toJson(): any {
    const result: any = {
      jsonrpc: this.jsonrpc,
      method: this.method,
      id: this.id
    };

    if (this.params !== undefined) {
      result.params = this.params;
    }

    return result;
  }
}

export class JsonRPCHttpResponseBodyError {
  @Expose()
  code: number;

  @Expose()
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  static fromJson(json: any): JsonRPCHttpResponseBodyError {
    return new JsonRPCHttpResponseBodyError(json.code, json.message);
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class JsonRPCHttpResponseBody {
  @Expose()
  jsonrpc: string = JSONRPC_VERSION;

  @Expose()
  result: { [key: string]: any };

  @Expose()
  error?: JsonRPCHttpResponseBodyError;

  @Expose()
  id: string;

  constructor(result: { [key: string]: any }, id: string, error?: JsonRPCHttpResponseBodyError) {
    this.result = result;
    this.id = id;
    this.error = error;
  }

  static fromJson(json: any): JsonRPCHttpResponseBody {
    return new JsonRPCHttpResponseBody(
      json.result,
      json.id,
      json.error ? JsonRPCHttpResponseBodyError.fromJson(json.error) : undefined
    );
  }

  toJson(): any {
    const result: any = {
      jsonrpc: this.jsonrpc,
      result: this.result,
      id: this.id
    };

    if (this.error !== undefined) {
      result.error = this.error.toJson();
    }

    return result;
  }
}