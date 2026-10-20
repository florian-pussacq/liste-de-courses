import { describe, expect, it } from 'vitest';
import { requestPersistentStorage } from './persistent-storage';

describe('requestPersistentStorage', () => {
  it('reports whether the browser granted persistence', async () => {
    expect(await requestPersistentStorage({ persist: async () => true })).toBe(true);
    expect(await requestPersistentStorage({ persist: async () => false })).toBe(false);
  });

  it('does not fail when the API is missing', async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false);
  });

  it('does not fail when the browser rejects the request', async () => {
    const rejecting = { persist: () => Promise.reject(new Error('denied')) };

    expect(await requestPersistentStorage(rejecting)).toBe(false);
  });
});
