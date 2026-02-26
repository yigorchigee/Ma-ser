import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

function createMemoryStorage() {
  const store = new Map();

  return {
    getItem(key) {
      const value = store.get(key);
      return typeof value === 'undefined' ? null : value;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

globalThis.window = {
  localStorage: createMemoryStorage(),
};

globalThis.fetch = async () => {
  throw new Error('fetch was called unexpectedly');
};

const { dataClient } = await import('./dataClient.js');

beforeEach(() => {
  window.localStorage.clear();
  window.VITE_GOOGLE_CLIENT_ID = undefined;
});

describe('dataClient auth', () => {
  it('registers a user with sanitized session data', async () => {
    const result = await dataClient.auth.registerWithEmail({
      name: 'Test User',
      email: 'tester@example.com',
      password: 'secret',
    });

    assert.equal(result.user.email, 'tester@example.com');
    assert.equal(result.session.user.maaser_percentage, 10);
    assert.ok(!('password' in result.user));

    const storedSession = JSON.parse(window.localStorage.getItem('maaser_session'));
    assert.equal(storedSession.user.email, 'tester@example.com');
    assert.equal(storedSession.user.has_security_pin, false);
  });

  it('logs a user in with stored credentials', async () => {
    await dataClient.auth.registerWithEmail({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hunter2',
    });

    await dataClient.auth.setSecurityPin('1234');

    const { user, session } = await dataClient.auth.loginWithEmail({
      email: 'existing@example.com',
      password: 'hunter2',
    });

    assert.equal(user.email, 'existing@example.com');
    assert.equal(session.user.maaser_percentage, 10);
  });

  it('rejects login attempts with invalid credentials', async () => {
    await dataClient.auth.registerWithEmail({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hunter2',
    });

    await dataClient.auth.setSecurityPin('1234');

    await assert.rejects(
      () =>
        dataClient.auth.loginWithEmail({
          email: 'existing@example.com',
          password: 'wrong',
        }),
      /Invalid email or password/
    );
  });

  it('creates and verifies a security PIN after login', async () => {
    await dataClient.auth.registerWithEmail({
      name: 'Pinless User',
      email: 'pinless@example.com',
      password: 'secret',
    });

    await dataClient.auth.loginWithEmail({ email: 'pinless@example.com', password: 'secret' });

    const created = await dataClient.auth.setSecurityPin('1234');
    assert.equal(created.user.has_security_pin, true);

    const verified = await dataClient.auth.verifySecurityPin('1234');
    assert.equal(verified.user.email, 'pinless@example.com');

    await assert.rejects(() => dataClient.auth.verifySecurityPin('9999'), /Incorrect security PIN/);
  });

  it('fails Google login in a non-browser environment', async () => {
    await assert.rejects(
      () => dataClient.auth.loginWithGoogle(),
      /Google login is only available in the browser/
    );
  });

  it('falls back to the default Google client ID when a placeholder is provided', () => {
    window.VITE_GOOGLE_CLIENT_ID = '377092527146-REPLACE_WITH_YOUR_FULL_CLIENT_ID';

    assert.ok(dataClient.auth.isGoogleLoginConfigured());
  });
});
