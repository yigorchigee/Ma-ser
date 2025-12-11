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
  connected_banks: [],
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
    integration_provider: 'Chase',
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
    integration_provider: 'Wells Fargo',
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
const PLACEHOLDER_GOOGLE_CLIENT_ID = '377092527146-REPLACE_WITH_YOUR_FULL_CLIENT_ID';
const DEFAULT_GOOGLE_CLIENT_ID = '377092527146-vu27pupmj0m69d3ndavbnv2i7adv6t9k.apps.googleusercontent.com';

const hasWindow = typeof window !== 'undefined';
const hasDom = typeof document !== 'undefined';
let memoryStore = {};

let googleSdkPromise = null;

function normalizeGoogleClientId(clientId) {
  if (!clientId) return null;

  const trimmed = clientId.trim();

  if (!trimmed || trimmed === PLACEHOLDER_GOOGLE_CLIENT_ID) {
    return null;
  }

  return trimmed;
}

function resolveGoogleClientId() {
  const candidates = [
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_CLIENT_ID : null,
    hasWindow ? window?.VITE_GOOGLE_CLIENT_ID : null,
    hasWindow ? window?.__MAASER_CONFIG__?.googleClientId : null,
    DEFAULT_GOOGLE_CLIENT_ID,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeGoogleClientId(candidate);
    if (normalized) return normalized;
  }

  return null;
}

function loadGoogleSdk() {
  if (!hasWindow || typeof document === 'undefined') {
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

async function requestGoogleAccessToken(clientId) {
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

  const { password, security_pin, ...safeUser } = user;
  return {
    ...defaultUser,
    ...safeUser,
    has_security_pin: Boolean(security_pin),
    connected_banks: safeUser.connected_banks || defaultUser.connected_banks,
  };
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

function assertValidPin(pin) {
  const normalizedPin = pin?.toString().trim();

  if (!normalizedPin || !/^\d{4}$/.test(normalizedPin)) {
    throw new Error('Security PIN must be exactly 4 digits.');
  }

  return normalizedPin;
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
    async registerWithEmail({ name, email, password, securityPin, connectedBanks = [] }) {
      const normalizedEmail = email?.trim().toLowerCase();
      const normalizedPin = securityPin?.toString().trim();
      const hasValidPin = normalizedPin && normalizedPin.length >= 4;

      if (normalizedPin && !hasValidPin) {
        throw new Error('Please choose a 4+ digit security PIN.');
      }

      const account = {
        name: name?.trim() || 'Maaser User',
        email: normalizedEmail,
        password,
        security_pin: hasValidPin ? normalizedPin : null,
        maaser_percentage: defaultUser.maaser_percentage,
        connected_banks: hasValidPin && Array.isArray(connectedBanks) ? connectedBanks : [],
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
      if (!hasDom) {
        throw new Error('Google login is only available in the browser.');
      }

      const clientId = resolveGoogleClientId();

      if (!clientId) {
        throw new Error('Google login is not configured. Set VITE_GOOGLE_CLIENT_ID.');
      }

      const accessToken = await requestGoogleAccessToken(clientId);
      const profile = await fetchGoogleUser(accessToken);

      const normalizedEmail = profile.email?.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error('Google account does not include an email address.');
      }

      const existingAccount = getStoredCredentials();

      if (existingAccount && existingAccount.email === normalizedEmail && existingAccount.auth_provider === 'google') {
        const session = persistSession(existingAccount);
        return { session, user: sanitizeUser(existingAccount) };
      }

      const googleAccount = {
        name: profile.name || profile.given_name || 'Google User',
        email: normalizedEmail,
        maaser_percentage: defaultUser.maaser_percentage,
        auth_provider: 'google',
        email_verified: Boolean(profile.email_verified),
        avatar_url: profile.picture,
        connected_at: new Date().toISOString(),
        security_pin: null,
        connected_banks: [],
      };

      persistCredentials(googleAccount);
      const session = persistSession(googleAccount);

      return { session, user: sanitizeUser(googleAccount) };
    },
    async verifySecurityPin(pin) {
      const stored = getStoredCredentials();
      if (!stored?.security_pin) {
        throw new Error('No security PIN set for this account yet.');
      }

      const normalizedPin = assertValidPin(pin);

      if (stored.security_pin !== normalizedPin) {
        throw new Error('Incorrect security PIN.');
      }

      const session = persistSession(stored);
      return { session, user: sanitizeUser(stored) };
    },
    async setSecurityPin(pin) {
      const stored = getStoredCredentials();

      if (!stored) {
        throw new Error('No authenticated account found.');
      }

      if (stored.security_pin) {
        throw new Error('A security PIN is already set for this account.');
      }

      const normalizedPin = assertValidPin(pin);

      const updated = { ...stored, security_pin: normalizedPin };
      persistCredentials(updated);
      const session = persistSession(updated);

      return { session, user: sanitizeUser(updated) };
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
};

