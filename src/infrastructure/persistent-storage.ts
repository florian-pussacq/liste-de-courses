type StorageManagerLike = Pick<StorageManager, 'persist'>;

// Persistence only lowers the risk of eviction: the app works the same without it.
export async function requestPersistentStorage(
  storage: StorageManagerLike | undefined = globalThis.navigator?.storage,
): Promise<boolean> {
  if (!storage?.persist) return false;
  try {
    return await storage.persist();
  } catch (error) {
    console.warn('Persistent storage request failed', error);
    return false;
  }
}
