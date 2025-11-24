const env =
  (typeof import.meta !== 'undefined' && import.meta.env) ||
  (typeof process !== 'undefined' ? process.env : {}) ||
  {};

export const integrationConfig = {
  bankAggregator: {
    baseUrl: env.VITE_BANK_API_BASE_URL || env.BANK_API_BASE_URL || '',
    apiKey: env.VITE_BANK_API_KEY || env.BANK_API_KEY || '',
    linkToken: env.VITE_BANK_LINK_TOKEN || env.BANK_LINK_TOKEN || '',
  },
  paypal: {
    baseUrl: env.VITE_PAYPAL_API_BASE_URL || env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com',
    clientId: env.VITE_PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_ID || '',
    clientSecret: env.VITE_PAYPAL_CLIENT_SECRET || env.PAYPAL_CLIENT_SECRET || '',
  },
  cashApp: {
    baseUrl: env.VITE_CASH_APP_API_BASE_URL || env.CASH_APP_API_BASE_URL || '',
    apiKey: env.VITE_CASH_APP_API_KEY || env.CASH_APP_API_KEY || '',
    applicationId: env.VITE_SQUARE_APPLICATION_ID || env.SQUARE_APPLICATION_ID || '',
    locationId: env.VITE_SQUARE_LOCATION_ID || env.SQUARE_LOCATION_ID || '',
    environment: env.VITE_SQUARE_ENVIRONMENT || env.SQUARE_ENVIRONMENT || 'sandbox',
  },
  zelle: {
    baseUrl: env.VITE_ZELLE_API_BASE_URL || env.ZELLE_API_BASE_URL || '',
    apiKey: env.VITE_ZELLE_API_KEY || env.ZELLE_API_KEY || '',
  },
  venmo: {
    baseUrl: env.VITE_VENMO_API_BASE_URL || env.VENMO_API_BASE_URL || '',
    apiKey: env.VITE_VENMO_API_KEY || env.VENMO_API_KEY || '',
    clientId: env.VITE_VENMO_CLIENT_ID || env.VENMO_CLIENT_ID || env.VITE_PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_ID || '',
  },
};

export function hasIntegrationConfig(provider) {
  const config = integrationConfig[provider];
  if (!config) return false;
  return Object.values(config).some(Boolean);
}
