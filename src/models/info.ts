import { Expose, Transform } from 'class-transformer';

export class Info {
  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  version: string;


  constructor(title: string, version: string, description?: string) {
    this.title = title;
    this.version = version;
    this.description = description;
  }

  static fromJson(json: any): Info {
    return new Info(
      json.title,
      json.version,
      json.description
    );
  }

  toJson(): any {
    return {
      title: this.title,
      version: this.version,
      ...(this.description && { description: this.description })
    };
  }
}