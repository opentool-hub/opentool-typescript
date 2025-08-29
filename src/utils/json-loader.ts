import * as fs from 'fs/promises';
import { OpenTool } from '../models/opentool';
import { SchemasSingleton } from '../models/schema';

export class OpenToolJsonLoader {
  private schemasJson?: { [key: string]: any };

  async load(jsonString: string): Promise<OpenTool> {
    const openToolMap = JSON.parse(jsonString);
    this.schemasJson = openToolMap["schemas"];
    
    if (this.schemasJson != null) {
      SchemasSingleton.initInstance(this.schemasJson);
    }
    
    const openTool = OpenTool.fromJson(openToolMap);
    return openTool;
  }

  async loadFromFile(jsonPath: string): Promise<OpenTool> {
    const jsonString = await fs.readFile(jsonPath, 'utf-8');
    return this.load(jsonString);
  }
}