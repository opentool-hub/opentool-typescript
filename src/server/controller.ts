import { Request, Response } from 'express';
import { VersionDto, JsonRPCHttpRequestBody, JsonRPCHttpResponseBody, JsonRPCHttpResponseBodyError } from '../dto';
import { Tool } from '../tool/tool';
import { JsonParserException } from '../tool/exception';

export class Controller {
  private tool: Tool;
  private version: string;

  constructor(tool: Tool, version: string) {
    this.tool = tool;
    this.version = version;
  }

  async getVersion(req: Request, res: Response): Promise<void> {
    const versionDto = new VersionDto(this.version);
    res.json(versionDto.toJson());
  }

  async call(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const body = JsonRPCHttpRequestBody.fromJson(data);

      try {
        const result = await this.tool.call(body.method, body.params);
        const responseBody = new JsonRPCHttpResponseBody(result, body.id);
        res.json(responseBody.toJson());
      } catch (error) {
        const errorObj = new JsonRPCHttpResponseBodyError(500, error instanceof Error ? error.toString() : String(error));
        const responseBody = new JsonRPCHttpResponseBody({}, body.id, errorObj);
        res.json(responseBody.toJson());
      }
    } catch (error) {
      const errorObj = new JsonRPCHttpResponseBodyError(400, 'Invalid request body');
      const responseBody = new JsonRPCHttpResponseBody({}, '', errorObj);
      res.status(400).json(responseBody.toJson());
    }
  }

  async load(req: Request, res: Response): Promise<void> {
    try {
      const openTool = await this.tool.load();
      if (openTool == null) {
        res.json(new JsonParserException().toJson());
        return;
      }
      res.json(openTool.toJson());
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.toString() : String(error));
    }
  }
}