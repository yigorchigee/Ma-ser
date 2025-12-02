export function createPageUrl(name) {
  return `/${name.toLowerCase()}`;
}

const SERVICE_FIRST_PROVIDERS = [
  'paypal',
  'venmo',
  'zelle',
  'cashapp',
  'cash app',
  'cash-app',
  'cash_app',
];

const ACCOUNT_TYPE_KEYWORDS = [
  'checking',
  'savings',
  'credit card',
  'credit',
  'debit card',
  'debit',
  'money market',
  'brokerage',
  'investment',
];

function humanize(value) {
  if (!value) return '';

  const cleaned = value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function extractAccountType(account, provider) {
  if (!account) return '';

  if (!provider) return account;

  const providerPattern = new RegExp(provider.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const stripped = account.replace(providerPattern, '').trim();

  return stripped || account;
}

function parseAccountDetails(rawAccount) {
  const normalized = humanize(rawAccount);

  if (!normalized) {
    return { provider: '', type: '' };
  }

  const lower = normalized.toLowerCase();
  const keyword = ACCOUNT_TYPE_KEYWORDS.find((key) => lower.includes(key));

  if (!keyword) {
    const parts = normalized.split(' ');

    if (parts.length >= 2) {
      const provider = humanize(parts.slice(0, -1).join(' '));
      const type = humanize(parts[parts.length - 1]);

      return { provider, type };
    }

    return { provider: '', type: normalized };
  }

  const keywordRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const match = normalized.match(keywordRegex);

  const type = match ? humanize(match[0]) : humanize(keyword);

  if (!match) {
    return { provider: '', type };
  }

  const before = normalized.slice(0, match.index).replace(/[-_]/g, ' ').trim();
  const after = normalized.slice(match.index + match[0].length).replace(/[-_]/g, ' ').trim();

  const provider = humanize(before || after);

  return { provider, type };
}

export function formatFundingSource(item) {
  if (!item) return 'Manual entry';

  const accountRaw =
    item.account ||
    item.account_name ||
    item.account_label ||
    item.account_type ||
    item.account_subtype ||
    item.account_category ||
    item.account_kind;

  const accountDetails = parseAccountDetails(accountRaw);

  const provider =
    humanize(
      item.integration_provider ||
        item.provider ||
        item.source_name ||
        item.source ||
        item.bank_name ||
        item.institution_name ||
        item.account_provider ||
        item.account_bank ||
        item.account_institution ||
        item.financial_institution ||
        item.bank
    ) || accountDetails.provider;

  const account = accountDetails.type || humanize(accountRaw);

  const description = item.description?.toString().trim();
  const notes = item.notes?.toString().trim();

  const isServiceOnly = provider
    ? SERVICE_FIRST_PROVIDERS.some((service) => provider.toLowerCase().includes(service))
    : false;

  const accountType =
    extractAccountType(account, provider) || (!provider ? account || description || notes : null);

  if (!provider && accountDetails.provider) {
    const cleaned = extractAccountType(accountType, accountDetails.provider);
    return [accountDetails.provider, cleaned].filter(Boolean).join(' ') || 'Manual entry';
  }

  if (isServiceOnly) {
    return provider || accountType || 'Manual entry';
  }

  if (provider && accountType) {
    const trimmedAccountType = accountType
      .replace(new RegExp(`^${provider.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s*`, 'i'), '')
      .trim();

    return [provider, trimmedAccountType || null].filter(Boolean).join(' ');
  }

  if (provider && accountRaw && !isServiceOnly) {
    const cleaned = extractAccountType(humanize(accountRaw), provider);
    return [provider, cleaned || null].filter(Boolean).join(' ') || provider;
  }

  return provider || accountType || 'Manual entry';
}

export function formatCounterparty(item) {
  if (!item) return '';

  if (item.type === 'income') {
    return formatFundingSource(item);
  }

  const recipient = item.charity_name || item.description || item.notes || item.account;
  return recipient || 'Unknown recipient';
}
