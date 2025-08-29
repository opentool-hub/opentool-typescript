export class ResponseNullException extends Error {
  readonly code!: number;
  readonly message!: string;

  constructor(code: number) {
    super('Response is null');
    Object.defineProperty(this, 'code', { value: code, writable: false });
    Object.defineProperty(this, 'message', { value: 'Response is null', writable: false });
    this.name = 'ResponseNullException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class ErrorNullException extends Error {
  readonly code!: number;
  readonly message!: string;

  constructor(code: number) {
    super('Error is null');
    Object.defineProperty(this, 'code', { value: code, writable: false });
    Object.defineProperty(this, 'message', { value: 'Error is null', writable: false });
    this.name = 'ErrorNullException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class OpenToolServerUnauthorizedException extends Error {
  readonly code!: number;
  readonly message!: string;

  constructor() {
    super("Please check API Key is VALID or NOT");
    Object.defineProperty(this, 'code', { value: 401, writable: false });
    Object.defineProperty(this, 'message', { value: "Please check API Key is VALID or NOT", writable: false });
    this.name = 'OpenToolServerUnauthorizedException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class OpenToolServerNoAccessException extends Error {
  readonly code!: number;
  readonly message!: string;

  constructor() {
    super("Please check OpenTool Server is RUNNING or NOT");
    Object.defineProperty(this, 'code', { value: 404, writable: false });
    Object.defineProperty(this, 'message', { value: "Please check OpenTool Server is RUNNING or NOT", writable: false });
    this.name = 'OpenToolServerNoAccessException';
  }

  toJson(): any {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class OpenToolServerCallException extends Error {
  readonly message!: string;

  constructor(message: string) {
    super(message);
    Object.defineProperty(this, 'message', { value: message, writable: false });
    this.name = 'OpenToolServerCallException';
  }

  toJson(): any {
    return {
      message: this.message
    };
  }
}