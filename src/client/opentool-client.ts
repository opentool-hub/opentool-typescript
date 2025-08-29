import axios, { AxiosInstance } from 'axios';
import { VersionDto, JsonRPCHttpRequestBody, JsonRPCHttpResponseBody, DEFAULT_PORT, DEFAULT_PREFIX } from '../dto';
import { FunctionCall, ToolReturn } from '../llm/model';
import { OpenTool } from '../models/opentool';
import { 
  OpenToolServerUnauthorizedException, 
  OpenToolServerNoAccessException,
  OpenToolServerCallException
} from './exception';

export abstract class Client {
  abstract version(): Promise<VersionDto>;
  abstract call(functionCall: FunctionCall): Promise<ToolReturn>;
  async load(): Promise<OpenTool | null> {
    return null;
  }
}

export class OpenToolClient extends Client {
  private isSSL: boolean = false;
  private host: string = "localhost";
  private port: number = DEFAULT_PORT;
  private prefix: string = DEFAULT_PREFIX;
  private apiKey?: string;
  private axiosInstance: AxiosInstance;

  constructor(options?: { isSSL?: boolean; host?: string; port?: number; apiKey?: string }) {
    super();
    
    if (options?.isSSL !== undefined) this.isSSL = options.isSSL;
    if (options?.host && options.host.length > 0) this.host = options.host;
    if (options?.port && options.port > 0) this.port = options.port;
    this.apiKey = options?.apiKey;

    const protocol = this.isSSL ? 'https' : 'http';
    const baseURL = options?.host || `${protocol}://${this.host}:${this.port}${this.prefix}`;

    const axiosConfig: any = { baseURL };
    if (this.apiKey && this.apiKey.length > 0) {
      axiosConfig.headers = { "Authorization": `Bearer ${this.apiKey}` };
    }

    this.axiosInstance = axios.create(axiosConfig);
  }

  async version(): Promise<VersionDto> {
    try {
      const response = await this.axiosInstance.get('/version');
      return VersionDto.fromJson(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new OpenToolServerUnauthorizedException();
        }
      }
      throw new OpenToolServerNoAccessException();
    }
  }

  async call(functionCall: FunctionCall): Promise<ToolReturn> {
    const result = await this._callJsonRpcHttp(functionCall.id, functionCall.name, functionCall.arguments);
    return new ToolReturn(functionCall.id, result);
  }

  private async _callJsonRpcHttp(id: string, method: string, params: { [key: string]: any }): Promise<{ [key: string]: any }> {
    const requestBody = new JsonRPCHttpRequestBody(method, id, params);

    try {
      const response = await this.axiosInstance.post('/call', requestBody.toJson());

      const responseBody = JsonRPCHttpResponseBody.fromJson(response.data);
      
      if (responseBody.error != null) {
        throw new OpenToolServerCallException(responseBody.error.message);
      }

      return responseBody.result;

    } catch (error) {
      if (error instanceof OpenToolServerCallException) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new OpenToolServerUnauthorizedException();
        }
      }
      throw new OpenToolServerNoAccessException();
    }
  }

  async load(): Promise<OpenTool | null> {
    try {
      const response = await this.axiosInstance.get('/load');
      if (response.status !== 200) {
        return null;
      }
      return OpenTool.fromJson(response.data);
    } catch (error) {
      return null;
    }
  }
}