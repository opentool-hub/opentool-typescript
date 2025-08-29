import * as path from 'path';
import { Tool } from '../../src/tool/tool';
import { OpenTool } from '../../src/models/opentool';
import { OpenToolJsonLoader } from '../../src/utils/json-loader';
import { FunctionNotSupportedException, ToolBreakException } from '../../src/tool/exception';
import { MockUtil } from './mock-util';

export class MockTool extends Tool {
  private mockUtil: MockUtil = new MockUtil();

  async call(name: string, args?: { [key: string]: any }): Promise<{ [key: string]: any }> {
    if (name === "count") {
      const count = this.mockUtil.count();
      return { "count": count };
    } else if (name === "create" && args != null) {
      const text = args["text"] as string;
      const id = this.mockUtil.create(text);
      return { "id": id };
    } else if (name === "read" && args != null) {
      const id = args["id"] as number;
      const text = this.mockUtil.read(id);
      return { "text": text };
    } else if (name === "update" && args != null) {
      const id = args["id"] as number;
      const text = args["text"] as string;
      this.mockUtil.update(id, text);
      return { "result": "Update successfully." };
    } else if (name === "delete" && args != null) {
      const id = args["id"] as number;
      this.mockUtil.delete(id);
      return { "result": "Delete successfully." };
    } else if (name === "run") {
      try {
        this.mockUtil.run();
      } catch (e) {
        // Simulate to throw a fatal error
        throw new ToolBreakException(e instanceof Error ? e.toString() : String(e));
      }
      return { "result": "Delete successfully." };
    } else {
      return new FunctionNotSupportedException(name).toJson();
    }
  }

  async load(): Promise<OpenTool | null> {
    const folder = path.join(__dirname, "..", "json");
    const fileName = "mock-tool.json";
    const jsonPath = path.join(folder, fileName);
    
    try {
      const openTool = await new OpenToolJsonLoader().loadFromFile(jsonPath);
      return openTool;
    } catch (error) {
      console.error('Error loading OpenTool JSON:', error);
      return null;
    }
  }
}