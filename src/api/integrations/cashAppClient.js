import { integrationConfig } from './config';
import { buildAuthHeaders, request } from './httpClient';
import { createCashAppClient, createCashAppPaymentRequest } from './cashAppSdk';

function hasCashAppConfig() {
  return Boolean(integrationConfig.cashApp.baseUrl && integrationConfig.cashApp.apiKey);
}

export const cashAppClient = {
  enabled: hasCashAppConfig(),
  async listTransfers({ startDate, endDate } = {}) {
    if (!hasCashAppConfig()) return [];
    const { baseUrl, apiKey } = integrationConfig.cashApp;
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    return request({
      url: `${baseUrl}/transfers${params.toString() ? `?${params.toString()}` : ''}`,
      method: 'GET',
      headers: buildAuthHeaders(apiKey),
    });
  },
  async sendPayment(payload) {
    if (!hasCashAppConfig()) return null;
    const { baseUrl, apiKey } = integrationConfig.cashApp;
    return request({
      url: `${baseUrl}/payments`,
      method: 'POST',
      headers: buildAuthHeaders(apiKey),
      body: payload,
    });
  },
  async renderCashAppPay(amount) {
    const payments = await createCashAppClient();
    return createCashAppPaymentRequest(payments, amount);
  },
};
