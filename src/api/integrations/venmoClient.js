import { integrationConfig } from './config';
import { buildAuthHeaders, request } from './httpClient';
import { renderVenmoButton } from './venmoSdk';

function hasVenmoConfig() {
  return Boolean(integrationConfig.venmo.baseUrl && integrationConfig.venmo.apiKey);
}

export const venmoClient = {
  enabled: hasVenmoConfig(),
  async listPayments({ startDate, endDate } = {}) {
    if (!hasVenmoConfig()) return [];
    const { baseUrl, apiKey } = integrationConfig.venmo;
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    return request({
      url: `${baseUrl}/payments${params.toString() ? `?${params.toString()}` : ''}`,
      method: 'GET',
      headers: buildAuthHeaders(apiKey),
    });
  },
  async sendPayment(payload) {
    if (!hasVenmoConfig()) return null;
    const { baseUrl, apiKey } = integrationConfig.venmo;
    return request({
      url: `${baseUrl}/payments`,
      method: 'POST',
      headers: buildAuthHeaders(apiKey),
      body: payload,
    });
  },
  async renderVenmo(options) {
    return renderVenmoButton(options);
  },
};
