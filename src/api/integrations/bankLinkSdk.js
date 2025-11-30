import { integrationConfig } from './config.js';
import { loadExternalScript } from './sdkLoader.js';

const PLAID_SDK_URL = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';

export async function openBankLink({ onSuccess, onExit, token }) {
  const linkToken = token || integrationConfig.bankAggregator.linkToken;
  if (!linkToken) throw new Error('Bank link token missing');

  await loadExternalScript(PLAID_SDK_URL);
  if (!window.Plaid) throw new Error('Plaid Link failed to load');

  const handler = window.Plaid.create({
    token: linkToken,
    onSuccess: (publicToken, metadata) => onSuccess?.(publicToken, metadata),
    onExit: (err, metadata) => onExit?.(err, metadata),
  });

  handler?.open();
  return handler;
}
