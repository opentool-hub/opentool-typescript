export class FunctionNotSupportedException extends Error {
  readonly code!: number;
  readonly message!: string;
  constructor(functionName: string) {
    const message = `Function Not Supported: ${functionName}`;
    super(message);
    Object.defineProperty(this, 'code', { value: 405, writable: false });
    Object.defineProperty(this, 'message', { value: message, writable: false });
    this.name = 'FunctionNotSupportedException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export class InvalidArgumentsException extends Error {
  readonly code!: number;
  readonly message!: string;
  constructor(args?: { [key: string]: any }) {
    const message = `Invalid Arguments: ${JSON.stringify(args)}`;
    super(message);
    Object.defineProperty(this, 'code', { value: 400, writable: false });
    Object.defineProperty(this, 'message', { value: message, writable: false });
    this.name = 'InvalidArgumentsException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export class ToolBreakException extends Error {
  readonly code!: number;
  readonly message!: string;
  constructor(message?: string) {
    const errorMessage = message !== undefined ? message : 'Tool break exception';
    super(errorMessage);
    Object.defineProperty(this, 'code', { value: 500, writable: false });
    Object.defineProperty(this, 'message', { value: errorMessage, writable: false });
    this.name = 'ToolBreakException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export class JsonParserException extends Error {
  readonly code!: number;
  readonly message!: string;
  constructor() {
    super("Json Parser NOT implement");
    Object.defineProperty(this, 'code', { value: 404, writable: false });
    Object.defineProperty(this, 'message', { value: "Json Parser NOT implement", writable: false });
    this.name = 'JsonParserException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}