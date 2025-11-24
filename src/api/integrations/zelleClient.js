import { integrationConfig } from './config';
import { buildAuthHeaders, request } from './httpClient';

function hasZelleConfig() {
  return Boolean(integrationConfig.zelle.baseUrl && integrationConfig.zelle.apiKey);
}

export const zelleClient = {
  enabled: hasZelleConfig(),
  async listTransfers({ startDate, endDate } = {}) {
    if (!hasZelleConfig()) return [];
    const { baseUrl, apiKey } = integrationConfig.zelle;
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
    if (!hasZelleConfig()) return null;
    const { baseUrl, apiKey } = integrationConfig.zelle;
    return request({
      url: `${baseUrl}/payments`,
      method: 'POST',
      headers: buildAuthHeaders(apiKey),
      body: payload,
    });
  },
  launchApp({ amount, note, recipient }) {
    const params = new URLSearchParams();
    if (amount) params.set('amount', amount);
    if (note) params.set('note', note);
    if (recipient) params.set('recipient', recipient);
    const url = `zelle://pay${params.toString() ? `?${params.toString()}` : ''}`;
    window.location.href = url;
    return url;
  },
};
