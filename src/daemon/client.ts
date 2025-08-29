import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RegisterInfo, RegisterResult } from './dto';

export const DAEMON_DEFAULT_PORT = 19627;
export const DAEMON_DEFAULT_PREFIX = "/opentool-daemon";

export class DaemonClient {
  private protocol: string = 'http';
  private host: string = "localhost";
  private port: number = DAEMON_DEFAULT_PORT;
  private prefix: string = DAEMON_DEFAULT_PREFIX;
  private axiosInstance: AxiosInstance;

  constructor(port?: number) {
    if (port && port > 0) {
      this.port = port;
    }

    const baseURL = `${this.protocol}://${this.host}:${this.port}${this.prefix}`;

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async register(registerInfo: RegisterInfo): Promise<RegisterResult> {
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/register', registerInfo);
      const data = response.data;
      
      return new RegisterResult(data.id, data.error);
    } catch (error: any) {
      return new RegisterResult("-1", error.message || "Unknown error occurred");
    }
  }
}