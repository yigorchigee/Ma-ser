const STORAGE_KEYS = {
  user: 'maaser_user',
  transactions: 'maaser_transactions',
  donations: 'maaser_donations',
};

const defaultUser = {
  maaser_percentage: 10,
  color_scheme: 'purple',
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
  },
  {
    id: 'txn_seed_2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    description: 'Gift',
    amount: 200,
    account: 'Savings',
    is_internal_transfer: false,
    category: 'Gift',
  },
];

const starterDonations = [
  {
    id: 'don_seed_1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    charity_name: 'Tomchei Shabbos',
    amount: 120,
    notes: 'Weekly giving',
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
      async list(order = '-date') {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);
        return sortByDate(items, order);
      },
      async create(data) {
        const items = ensureSeeded(STORAGE_KEYS.transactions, starterTransactions);
        const next = { ...data, id: generateId('txn') };
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
        const filtered = items.filter((item) => item.id !== id);
        persist(STORAGE_KEYS.transactions, filtered);
        return { id };
      },
    },
    Donation: {
      async list(order = '-date') {
        const items = ensureSeeded(STORAGE_KEYS.donations, starterDonations);
        return sortByDate(items, order);
      },
      async create(data) {
        const items = ensureSeeded(STORAGE_KEYS.donations, starterDonations);
        const next = { ...data, id: generateId('don') };
        items.push(next);
        persist(STORAGE_KEYS.donations, items);
        return next;
      },
      async delete(id) {
        const items = ensureSeeded(STORAGE_KEYS.donations, starterDonations);
        const filtered = items.filter((item) => item.id !== id);
        persist(STORAGE_KEYS.donations, filtered);
        return { id };
      },
    },
    Charity: {
      async list() {
        return defaultCharities;
      },
    },
  },
  reset() {
    memoryStore = {};
    persist(STORAGE_KEYS.user, defaultUser);
    persist(STORAGE_KEYS.transactions, starterTransactions);
    persist(STORAGE_KEYS.donations, starterDonations);
  },
};
