import { Expose } from 'class-transformer';

export class Server {
  @Expose()
  url: string;

  @Expose()
  description?: string;

  constructor(url: string, description?: string) {
    this.url = url;
    this.description = description;
  }

  static fromJson(json: any): Server {
    return new Server(
      json.url,
      json.description
    );
  }

  toJson(): any {
    return {
      url: this.url,
      ...(this.description && { description: this.description })
    };
  }
}