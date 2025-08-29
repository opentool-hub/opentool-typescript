export class MockUtil {
  private storage: Map<number, string> = new Map();
  private nextId: number = 1;

  count(): number {
    return this.storage.size;
  }

  create(text: string): number {
    const id = this.nextId++;
    this.storage.set(id, text);
    return id;
  }

  read(id: number): string {
    const text = this.storage.get(id);
    if (text === undefined) {
      throw new Error(`No text found with id: ${id}`);
    }
    return text;
  }

  update(id: number, text: string): void {
    if (!this.storage.has(id)) {
      throw new Error(`No text found with id: ${id}`);
    }
    this.storage.set(id, text);
  }

  delete(id: number): void {
    if (!this.storage.has(id)) {
      throw new Error(`No text found with id: ${id}`);
    }
    this.storage.delete(id);
  }

  run(): void {
    // Simulate to throw a fatal error
    throw new Error("Fatal error occurred in run()");
  }
}