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

export function formatFundingSource(item) {
  if (!item) return 'Manual entry';

  const provider = humanize(
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
  );

  const account = humanize(
    item.account ||
      item.account_name ||
      item.account_label ||
      item.account_type ||
      item.account_subtype ||
      item.account_category ||
      item.account_kind
  );

  const description = item.description?.toString().trim();
  const notes = item.notes?.toString().trim();

  const isServiceOnly = provider
    ? SERVICE_FIRST_PROVIDERS.some((service) => provider.toLowerCase().includes(service))
    : false;

  const parts = [];

  if (provider) {
    parts.push(provider);
  }

  if (!isServiceOnly) {
    const accountType = extractAccountType(account, provider) || (!provider ? description || notes : null);

    if (accountType) {
      parts.push(accountType);
    }
  }

  return parts.join(' ') || 'Manual entry';
}

export function formatCounterparty(item) {
  if (!item) return '';

  if (item.type === 'income') {
    return formatFundingSource(item);
  }

  const recipient = item.charity_name || item.description || item.notes || item.account;
  return recipient || 'Unknown recipient';
}
