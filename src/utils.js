export function createPageUrl(name) {
  return `/${name.toLowerCase()}`;
}

export function formatCounterparty(item) {
  if (!item) return '';

  if (item.type === 'income') {
    const source = item.description || item.account || item.notes;
    return source ? `From ${source}` : 'From unknown source';
  }

  const recipient = item.charity_name || item.description || item.notes || item.account;
  return recipient ? `To ${recipient}` : 'To unknown recipient';
}
