import { loadScript } from '@paypal/paypal-js';
import { integrationConfig } from './config';

const paypalSdkPromise = (() => {
  if (!integrationConfig.paypal.clientId) return null;
  return loadScript({
    'client-id': integrationConfig.paypal.clientId,
    components: 'buttons,funding-eligibility',
    intent: 'capture',
    currency: 'USD',
    'enable-funding': 'venmo',
  });
})();

export async function getPayPalSdk() {
  if (!paypalSdkPromise) throw new Error('PayPal client ID is not configured');
  return paypalSdkPromise;
}

export async function renderPayPalButtons({ container, createOrder, onApprove, fundingSource }) {
  const paypal = await getPayPalSdk();
  if (!paypal) throw new Error('PayPal SDK failed to load');

  return paypal.Buttons({
    fundingSource,
    createOrder,
    onApprove,
  }).render(container);
}
