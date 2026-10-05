import { DegradedMemoryProvider, MemoryService, SupermemoryAdapter } from '@debo/memory';

let memoryServiceInstance: MemoryService | null = null;

export function getMemoryService(): MemoryService {
  if (!memoryServiceInstance) {
    const supermemoryKey = process.env.SUPERMEMORY_API_KEY;
    if (supermemoryKey) {
      memoryServiceInstance = new MemoryService(
        new SupermemoryAdapter({ apiKey: supermemoryKey }),
      );
    } else {
      memoryServiceInstance = new MemoryService(new DegradedMemoryProvider());
    }
  }
  return memoryServiceInstance;
}
