import express, { Express } from 'express';
import { Server as HttpServer } from 'http';
import { Tool } from '../tool/tool';
import { Controller } from './controller';
import { opentoolRoutes } from './route';
import { checkAuthorization } from './middleware';
import { DEFAULT_PORT, DEFAULT_PREFIX } from '../dto';
import { DaemonClient } from '../daemon/client';
import { RegisterInfo, RegisterResult } from '../daemon/dto';

export abstract class Server {
  protected tool: Tool;
  protected version: string;

  constructor(tool: Tool, version: string) {
    this.tool = tool;
    this.version = version;
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}

export class OpenToolServer extends Server {
  private ip: string = "0.0.0.0";
  private port: number = DEFAULT_PORT;
  private prefix: string = DEFAULT_PREFIX;
  private apiKeys: string[] = [];
  private server?: HttpServer;
  private app: Express;

  constructor(
    tool: Tool, 
    version: string, 
    options?: { ip?: string; port?: number; apiKeys?: string[] }
  ) {
    super(tool, version);
    
    if (options?.ip && options.ip.length > 0) this.ip = options.ip;
    if (options?.port && options.port > 0) this.port = options.port;
    if (options?.apiKeys && options.apiKeys.length > 0) this.apiKeys = options.apiKeys;

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    if (this.apiKeys.length > 0) {
      this.app.use(this.prefix, checkAuthorization(this.apiKeys));
    }
  }

  private setupRoutes(): void {
    const controller = new Controller(this.tool, this.version);
    const routes = opentoolRoutes(controller);
    this.app.use(this.prefix, routes);
  }

  async start(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.server = this.app.listen(this.port, this.ip, async () => {
        console.log(`Start Server: http://${this.ip}:${this.port}${this.prefix}`);
        
        // Register with daemon
        const daemonClient = new DaemonClient();
        const registerInfo = new RegisterInfo(
          require.main?.filename || process.argv[1] || '',
          this.ip,
          this.port,
          this.prefix,
          process.pid,
          this.apiKeys.length > 0 ? this.apiKeys : undefined
        );
        
        try {
          const result: RegisterResult = await daemonClient.register(registerInfo);
          if (result.error) {
            console.log(`WARNING: Register to daemon failed. (${result.error})`);
            console.log("Tool Running in SOLO mode.");
          } else {
            console.log(`Register to daemon successfully, id: ${result.id}, pid: ${process.pid}`);
          }
        } catch (error) {
          console.log("WARNING: Could not connect to daemon. Tool Running in SOLO mode.");
        }
        
        resolve();
      });

      this.server.on('error', (error) => {
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}