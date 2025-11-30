import { integrationHub } from './integrations/integrationHub.js';

const STORAGE_KEYS = {
  user: 'maaser_user',
  session: 'maaser_session',
  credentials: 'maaser_credentials',
  transactions: 'maaser_transactions',
  donations: 'maaser_donations',
};

const defaultUser = {
  maaser_percentage: 10,
};

const defaultCharities = [
  { id: 'c1', name: 'Tomchei Shabbos', category: 'Community', is_recommended: true },
  { id: 'c2', name: 'Chai Lifeline', category: 'Health', is_recommended: true },
  { id: 'c3', name: 'Hatzalah', category: 'Emergency Services', is_recommended: true },
  { id: 'c4', name: 'Local Shul', category: 'Community', is_recommended: false },
  { id: 'c5', name: 'Food Pantry', category: 'Hunger Relief', is_recommended: false },
];

const starterTransactions = [
  {
    id: 'txn_seed_1',
    date: new Date().toISOString().split('T')[0],
    description: 'Paycheck',
    amount: 2500,
    account: 'Checking',
    is_internal_transfer: false,
    category: 'Salary',
    is_manual: false,
  },
  {
    id: 'txn_seed_2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    description: 'Gift',
    amount: 200,
    account: 'Savings',
    is_internal_transfer: false,
    category: 'Gift',
    is_manual: false,
  },
];

const starterDonations = [
  {
    id: 'don_seed_1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    charity_name: 'Tomchei Shabbos',
    amount: 120,
  },
];

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_CLIENT_ID : null;

const hasWindow = typeof window !== 'undefined';
let memoryStore = {};

let googleSdkPromise = null;

function resolveGoogleClientId() {
  const envClientId = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_CLIENT_ID : null;
  const windowClientId = hasWindow ? window?.VITE_GOOGLE_CLIENT_ID : null;
  const globalConfigClientId = hasWindow ? window?.__MAASER_CONFIG__?.googleClientId : null;

  return envClientId || windowClientId || globalConfigClientId || null;
}

function loadGoogleSdk() {
  if (!hasWindow) {
    return Promise.reject(new Error('Google login is only available in the browser.'));
  }

  if (googleSdkPromise) return googleSdkPromise;

  if (window.google?.accounts?.oauth2) {
    googleSdkPromise = Promise.resolve(window.google);
    return googleSdkPromise;
  }

  googleSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        googleSdkPromise = null;
        reject(new Error('Google Identity Services SDK failed to load.'));
      }
    };
    script.onerror = () => {
      googleSdkPromise = null;
      reject(new Error('Unable to load Google Identity Services SDK.'));
    };
    document.head.appendChild(script);
  });

  return googleSdkPromise;
}

async function requestGoogleAccessToken() {
  const clientId = GOOGLE_CLIENT_ID || (hasWindow ? window?.VITE_GOOGLE_CLIENT_ID : null);

  if (!clientId) {
    throw new Error('Google login is not configured.');
  }

  const google = await loadGoogleSdk();

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'profile email',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || 'Unable to retrieve Google access token.'));
          return;
        }

        resolve(response.access_token);
      },
    });

    client.requestAccessToken();
  });
}

async function fetchGoogleUser(accessToken) {
  if (!accessToken) {
    throw new Error('Missing Google access token.');
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch Google profile.');
  }

  return response.json();
}

const storage = {
  getItem(key) {
    if (hasWindow && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore[key] || null;
  },
  setItem(key, value) {
    if (hasWindow && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  },
};

function load(key, fallback) {
  const raw = storage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function persist(key, value) {
  storage.setItem(key, JSON.stringify(value));
}

function sanitizeUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return { ...defaultUser, ...safeUser };
}

function getStoredCredentials() {
  return load(STORAGE_KEYS.credentials, null);
}

function persistCredentials(credentials) {
  persist(STORAGE_KEYS.credentials, credentials);
}

function persistSession(user) {
  const sanitized = sanitizeUser(user);
  const session = { user: sanitized };
  persist(STORAGE_KEYS.session, session);
  persist(STORAGE_KEYS.user, sanitized);
  return session;
}

function isGoogleLoginConfigured() {
  return Boolean(resolveGoogleClientId());
}

function sanitizeDonationNotes(donation) {
  const normalizedNote = donation.note?.trim().toLowerCase();
  const normalizedNotes = donation.notes?.trim().toLowerCase();

  const cleaned = { ...donation };

  if (normalizedNote === 'weekly giving') {
    delete cleaned.note;
  }

  if (normalizedNotes === 'weekly giving') {
    delete cleaned.notes;
  }

  return cleaned;
}

function removeWeeklyGivingNotes(donations) {
  let updated = false;

  const cleaned = donations.map((donation) => {
    const sanitized = sanitizeDonationNotes(donation);

    if (donation.note !== sanitized.note || donation.notes !== sanitized.notes) {
      updated = true;
    }

    return sanitized;
  });

  if (updated) {
    persist(STORAGE_KEYS.donations, cleaned);
  }

  return cleaned;
}

function ensureSeeded(key, fallback = []) {
  const existing = load(key, []);
  if (existing.length === 0 && fallback.length) {
    persist(key, fallback);
    return fallback;
  }
  return existing;
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isManualTransaction(transaction) {
  if (!transaction) return false;

  if (typeof transaction.is_manual === 'boolean') {
    return transaction.is_manual;
  }

  return (
    !transaction.integration_provider &&
    !transaction.integration_source_id &&
    !transaction.id?.toString().startsWith('txn_seed')
  );
}

function sortByDate(items, order) {
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  return order === '-date' ? sorted.reverse() : sorted;
}

export const dataClient = {
  auth: {
    async me() {
      const session = load(STORAGE_KEYS.session, null);
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const storedUser = load(STORAGE_KEYS.user, defaultUser);
      const user = { ...storedUser, ...session.user };
      persist(STORAGE_KEYS.user, user);
      return user;
    },
    async updateMe(updates) {
      const existingCredentials = getStoredCredentials() || defaultUser;
      const next = { ...existingCredentials, ...updates };
      persistCredentials(next);
      persistSession(next);
      return sanitizeUser(next);
    },
    getSession() {
      const session = load(STORAGE_KEYS.session, null);
      return session?.user ? session : null;
    },
    async registerWithEmail({ name, email, password }) {
      const normalizedEmail = email?.trim().toLowerCase();

      const account = {
        name: name?.trim() || 'Maaser User',
        email: normalizedEmail,
        password,
        maaser_percentage: defaultUser.maaser_percentage,
        auth_provider: 'email',
        email_verified: false,
        created_at: new Date().toISOString(),
      };

      persistCredentials(account);
      const session = persistSession(account);

      return {
        session,
        user: sanitizeUser(account),
        emailSentAt: new Date().toISOString(),
        message: `Verification email sent to ${normalizedEmail}`,
      };
    },
    async loginWithEmail({ email, password }) {
      const normalizedEmail = email?.trim().toLowerCase();
      const stored = getStoredCredentials();

      if (!stored || stored.email !== normalizedEmail || stored.password !== password) {
        throw new Error('Invalid email or password');
      }

      const session = persistSession(stored);
      return { session, user: sanitizeUser(stored) };
    },
    async loginWithGoogle() {
      const accessToken = await requestGoogleAccessToken();
      const profile = await fetchGoogleUser(accessToken);

      const normalizedEmail = profile.email?.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error('Google account does not include an email address.');
      }

      const googleAccount = {
        name: profile.name || profile.given_name || 'Google User',
        email: normalizedEmail,
        maaser_percentage: defaultUser.maaser_percentage,
        auth_provider: 'google',
        email_verified: Boolean(profile.email_verified),
        avatar_url: profile.picture,
        connected_at: new Date().toISOString(),
      };

      persistCredentials(googleAccount);
      const session = persistSession(googleAccount);

      return { session, user: sanitizeUser(googleAccount) };
    },
    isGoogleLoginConfigured,
    async logout() {
      persist(STORAGE_KEYS.session, null);
      return { success: true };
    },
  },
  entities: {
    Transaction: {
      async list(order = '-date', { includeExternal = false } = {}) {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);

        if (!includeExternal) {
          return sortByDate(items, order);
        }

        const externalTransactions = await integrationHub.syncExternalTransactions();

        const mappedExternal = externalTransactions.map((txn) => ({
          id: txn.id || generateId(`txn_${txn.provider || 'external'}`),
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          account: txn.account || txn.provider,
          is_internal_transfer: Boolean(txn.is_internal_transfer),
          category: txn.category || txn.provider || 'External',
          integration_provider: txn.provider,
          integration_source_id: txn.sourceId,
        }));

        return sortByDate([...items, ...mappedExternal], order);
      },
      async create(data) {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);
        const next = { ...data, id: generateId('txn'), is_manual: true };
        items.push(next);
        persist(STORAGE_KEYS.transactions, items);
        return next;
      },
      async update(id, data) {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);
        const idx = items.findIndex((item) => item.id === id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...data };
          persist(STORAGE_KEYS.transactions, items);
        }
        return items[idx];
      },
      async delete(id) {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);
        const idx = items.findIndex((item) => item.id === id);

        if (idx === -1) {
          return { id };
        }

        if (!isManualTransaction(items[idx])) {
          throw new Error('Only manually added transactions can be deleted.');
        }

        const filtered = items.filter((item) => item.id !== id);
        persist(STORAGE_KEYS.transactions, filtered);
        return { id };
      },
    },
    Donation: {
      async list(order = '-date') {
        const items = ensureSeeded(STORAGE_KEYS.donations, starterDonations);
        const cleaned = removeWeeklyGivingNotes(items);
        return sortByDate(cleaned, order);
      },
      async create(data) {
        const items = ensureSeeded(STORAGE_KEYS.donations, starterDonations);
        const next = sanitizeDonationNotes({ ...data, id: generateId('don') });
        items.push(next);
        persist(STORAGE_KEYS.donations, items);
        return next;
      },
      async delete(id) {
        throw new Error('Donation records cannot be deleted.');
      },
    },
    Charity: {
      async list() {
        return defaultCharities;
      },
    },
  },
  integrations: {
    async syncExternalTransactions() {
      const externalTransactions = await integrationHub.syncExternalTransactions();
      const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);

      const normalized = externalTransactions.map((txn) => ({
        id: txn.id || generateId(`txn_${txn.provider || 'external'}`),
        date: txn.date,
        description: txn.description,
        amount: txn.amount,
        account: txn.account || txn.provider,
        is_internal_transfer: Boolean(txn.is_internal_transfer),
        category: txn.category || txn.provider || 'External',
        integration_provider: txn.provider,
        integration_source_id: txn.sourceId,
      }));

      const existingIds = new Set(items.map((txn) => txn.integration_source_id || txn.id));
      const merged = [
        ...items,
        ...normalized.filter((txn) => !existingIds.has(txn.integration_source_id || txn.id)),
      ];

      persist(STORAGE_KEYS.transactions, merged);
      return sortByDate(merged, '-date');
    },
    async getConnectionStatus() {
      return integrationHub.connectionStatus();
    },
    async disconnect(provider) {
      return integrationHub.disconnect(provider);
    },
  },
  reset() {
    memoryStore = {};
    persist(STORAGE_KEYS.user, defaultUser);
    persist(STORAGE_KEYS.session, null);
    persist(STORAGE_KEYS.credentials, null);
    persist(STORAGE_KEYS.transactions, starterTransactions);
    persist(STORAGE_KEYS.donations, starterDonations);
  },
};

