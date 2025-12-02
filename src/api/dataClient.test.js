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
  });

  it('logs a user in with stored credentials', async () => {
    await dataClient.auth.registerWithEmail({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hunter2',
    });

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

    await assert.rejects(
      () =>
        dataClient.auth.loginWithEmail({
          email: 'existing@example.com',
          password: 'wrong',
        }),
      /Invalid email or password/
    );
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

describe('dataClient donations', () => {
  it('strips weekly giving notes when creating a donation', async () => {
    const created = await dataClient.entities.Donation.create({
      date: '2024-01-01',
      charity_name: 'Test Charity',
      amount: 50,
      note: 'Weekly Giving',
      notes: 'weekly giving',
    });

    assert.ok(!('note' in created));
    assert.ok(!('notes' in created));
  });

  it('cleans existing weekly giving notes on list and persists the sanitized copy', async () => {
    const donationsWithNotes = [
      { id: 'don_1', date: '2024-02-01', charity_name: 'First', amount: 20, note: 'Weekly Giving' },
      { id: 'don_2', date: '2024-02-02', charity_name: 'Second', amount: 30, notes: '  weekly giving  ' },
    ];

    window.localStorage.setItem('maaser_donations', JSON.stringify(donationsWithNotes));

    const listed = await dataClient.entities.Donation.list();

    assert.ok(listed.every((donation) => !('note' in donation) && !('notes' in donation)));

    const persisted = JSON.parse(window.localStorage.getItem('maaser_donations'));
    assert.ok(persisted.every((donation) => !('note' in donation) && !('notes' in donation)));
  });
});
