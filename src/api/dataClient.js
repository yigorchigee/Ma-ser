import { integrationHub } from './integrations/integrationHub';

const STORAGE_KEYS = {
  user: 'maaser_user',
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

const hasWindow = typeof window !== 'undefined';
let memoryStore = {};

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

function removeWeeklyGivingNotes(donations) {
  let updated = false;

  const cleaned = donations.map((donation) => {
    const rawNote = donation.note ?? donation.notes;
    const noteValue = typeof rawNote === 'string' ? rawNote.trim().toLowerCase() : '';

    if (noteValue === 'weekly giving') {
      const { note, notes, ...rest } = donation;
      updated = true;
      return rest;
    }

    return donation;
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
      const user = load(STORAGE_KEYS.user, defaultUser);
      persist(STORAGE_KEYS.user, user);
      return user;
    },
    async updateMe(updates) {
      const existing = load(STORAGE_KEYS.user, defaultUser);
      const next = { ...existing, ...updates };
      persist(STORAGE_KEYS.user, next);
      return next;
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
        const next = { ...data, id: generateId('don') };
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
    persist(STORAGE_KEYS.transactions, starterTransactions);
    persist(STORAGE_KEYS.donations, starterDonations);
  },
};

