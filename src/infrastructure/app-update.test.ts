// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchForUpdates, type RegisterServiceWorker } from './app-update';

type Options = NonNullable<Parameters<RegisterServiceWorker>[0]>;

function fakeRegistration() {
  let options: Options = {};
  const updateServiceWorker = vi.fn(async () => {});
  const register: RegisterServiceWorker = (given) => {
    options = given ?? {};
    return updateServiceWorker;
  };
  return { register, updateServiceWorker, options: () => options };
}

afterEach(() => vi.restoreAllMocks());

describe('watchForUpdates', () => {
  it('tells when a new version is ready, with the way to load it', async () => {
    const { register, updateServiceWorker, options } = fakeRegistration();
    const onUpdateReady = vi.fn();
    watchForUpdates(register, onUpdateReady);

    options().onNeedRefresh?.();
    expect(onUpdateReady).toHaveBeenCalledOnce();
    await onUpdateReady.mock.calls[0]?.[0]();

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('looks for a new version when the application comes back to the foreground', () => {
    const { register, options } = fakeRegistration();
    const registration = { update: vi.fn(async () => {}) } as unknown as ServiceWorkerRegistration;
    watchForUpdates(register, () => {});
    options().onRegisteredSW?.('sw.js', registration);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(registration.update).toHaveBeenCalledOnce();
  });

  it('does not look for a new version when the application goes to the background', () => {
    const { register, options } = fakeRegistration();
    const registration = { update: vi.fn(async () => {}) } as unknown as ServiceWorkerRegistration;
    watchForUpdates(register, () => {});
    options().onRegisteredSW?.('sw.js', registration);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(registration.update).not.toHaveBeenCalled();
  });
});
