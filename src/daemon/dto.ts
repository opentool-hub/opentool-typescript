import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class RegisterInfo {
  @IsString()
  file: string;

  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  prefix: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apiKeys?: string[];

  @IsNumber()
  pid: number;

  constructor(
    file: string,
    host: string,
    port: number,
    prefix: string,
    pid: number,
    apiKeys?: string[]
  ) {
    this.file = file;
    this.host = host;
    this.port = port;
    this.prefix = prefix;
    this.pid = pid;
    this.apiKeys = apiKeys;
  }
}

export class RegisterResult {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  error?: string;

  constructor(id: string, error?: string) {
    this.id = id;
    this.error = error;
  }
}