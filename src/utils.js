export function createPageUrl(name) {
  return `/${name.toLowerCase()}`;
}

const SERVICE_FIRST_PROVIDERS = ['paypal', 'venmo', 'cashapp', 'cash app', 'cash-app'];

export function formatFundingSource(item) {
  if (!item) return 'Manual entry';

  const provider = item.integration_provider?.toString().trim();
  const account = item.account?.toString().trim();
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
    const accountPart = account || (!provider ? description || notes : null);

    if (
      accountPart &&
      !parts.some((part) => accountPart.toLowerCase().includes(part.toLowerCase()))
    ) {
      parts.push(accountPart);
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
