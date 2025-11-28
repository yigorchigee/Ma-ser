export function createPageUrl(name) {
  return `/${name.toLowerCase()}`;
}

export function formatCounterparty(item) {
  if (!item) return '';

  if (item.type === 'income') {
    const parts = [item.integration_provider, item.account || item.description || item.notes].filter(Boolean);
    return parts.join(' ') || 'Unknown source';
  }

  const recipient = item.charity_name || item.description || item.notes || item.account;
  return recipient || 'Unknown recipient';
}
