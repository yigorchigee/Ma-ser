import { integrationConfig } from './config.js';
import { loadExternalScript } from './sdkLoader.js';

const SQUARE_SDK_URL = 'https://sandbox.web.squarecdn.com/v1/square.js';

async function getSquareSdk() {
  if (!integrationConfig.cashApp.applicationId || !integrationConfig.cashApp.locationId) {
    throw new Error('Square applicationId and locationId are required for Cash App Pay');
  }

  await loadExternalScript(SQUARE_SDK_URL);
  if (!window.Square) throw new Error('Square Web Payments SDK failed to load');

  return window.Square;
}

export async function createCashAppClient() {
  const square = await getSquareSdk();
  return square.payments(integrationConfig.cashApp.applicationId, integrationConfig.cashApp.locationId, {
    environment: integrationConfig.cashApp.environment,
  });
}

export async function createCashAppPaymentRequest(payments, amount) {
  const cashAppPay = await payments.cashAppPay({
    redirectURL: window.location.href,
    referenceId: crypto.randomUUID(),
  });

  const paymentRequest = await payments.paymentRequest({
    countryCode: 'US',
    currencyCode: 'USD',
    total: {
      amount: amount.toString(),
      label: 'Donation',
    },
  });

  await cashAppPay.attach('#cash-app-pay-button');
  await cashAppPay.update({ paymentRequest });
  return { cashAppPay, paymentRequest };
}
