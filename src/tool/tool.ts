import { OpenTool } from '../models/opentool';

export abstract class Tool {
  abstract call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }>;
  
  async load(): Promise<OpenTool | null> {
    return null;
  }
}