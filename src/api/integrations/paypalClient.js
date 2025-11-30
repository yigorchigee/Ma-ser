import { integrationConfig } from './config.js';
import { buildAuthHeaders, request } from './httpClient.js';
import { renderPayPalButtons } from './paypalSdk.js';

function buildBasicAuthHeader(clientId, clientSecret) {
  if (!clientId || !clientSecret) return {};
  const encoded = btoa(`${clientId}:${clientSecret}`);
  return { Authorization: `Basic ${encoded}` };
}

export const paypalClient = {
  enabled: Boolean(integrationConfig.paypal.clientId && integrationConfig.paypal.clientSecret),
  async createAccessToken() {
    const { baseUrl, clientId, clientSecret } = integrationConfig.paypal;
    if (!clientId || !clientSecret) return null;

    const response = await request({
      url: `${baseUrl}/v1/oauth2/token`,
      method: 'POST',
      headers: {
        ...buildBasicAuthHeader(clientId, clientSecret),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    });

    return response?.access_token;
  },
  async listTransactions(accessToken, startDate, endDate) {
    if (!accessToken) return [];
    const { baseUrl } = integrationConfig.paypal;
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });

    const response = await request({
      url: `${baseUrl}/v1/reporting/transactions?${params.toString()}`,
      method: 'GET',
      headers: buildAuthHeaders(accessToken),
    });

    return response?.transaction_details || [];
  },
  async createPayout(accessToken, payload) {
    if (!accessToken) return null;
    const { baseUrl } = integrationConfig.paypal;
    return request({
      url: `${baseUrl}/v1/payments/payouts`,
      method: 'POST',
      headers: buildAuthHeaders(accessToken),
      body: payload,
    });
  },
  async renderButtons(options) {
    return renderPayPalButtons(options);
  },
};
