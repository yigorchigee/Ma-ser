import { integrationConfig } from './config.js';
import { request } from './httpClient.js';
import { openBankLink } from './bankLinkSdk.js';

function bankHeaders() {
  const { apiKey } = integrationConfig.bankAggregator;
  return apiKey ? { 'x-api-key': apiKey } : {};
}

function hasBankConfig() {
  return Boolean(integrationConfig.bankAggregator.baseUrl);
}

export const bankingClient = {
  enabled: hasBankConfig(),
  async createLinkToken(metadata = {}) {
    if (!hasBankConfig()) return null;
    const { baseUrl } = integrationConfig.bankAggregator;
    return request({
      url: `${baseUrl}/link/token`,
      method: 'POST',
      headers: bankHeaders(),
      body: metadata,
    });
  },
  async exchangePublicToken(publicToken) {
    if (!hasBankConfig()) return null;
    const { baseUrl } = integrationConfig.bankAggregator;
    return request({
      url: `${baseUrl}/link/exchange`,
      method: 'POST',
      headers: bankHeaders(),
      body: { public_token: publicToken },
    });
  },
  async listAccounts(accessToken) {
    if (!hasBankConfig()) return [];
    const { baseUrl } = integrationConfig.bankAggregator;
    return request({
      url: `${baseUrl}/accounts`,
      method: 'GET',
      headers: { ...bankHeaders(), Authorization: `Bearer ${accessToken}` },
    });
  },
  async syncTransactions(accessToken, cursor) {
    if (!hasBankConfig()) return [];
    const { baseUrl } = integrationConfig.bankAggregator;
    return request({
      url: `${baseUrl}/transactions/sync${cursor ? `?cursor=${cursor}` : ''}`,
      method: 'GET',
      headers: { ...bankHeaders(), Authorization: `Bearer ${accessToken}` },
    });
  },
  async startLinkFlow(options = {}) {
    return openBankLink(options);
  },
};
