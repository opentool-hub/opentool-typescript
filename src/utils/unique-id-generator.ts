import { v4 as uuidv4 } from 'uuid';

export function uniqueId(shorter: boolean = false): string {
  if (shorter) {
    return uuidv4().slice(0, 10);
  }
  return uuidv4();
}

// Test function
export function testUniqueId(): void {
  const id = uniqueId(false);
  console.log(id);
}