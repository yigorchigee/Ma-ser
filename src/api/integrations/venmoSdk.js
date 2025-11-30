import { renderPayPalButtons } from './paypalSdk.js';

export async function renderVenmoButton({ container, createOrder, onApprove }) {
  return renderPayPalButtons({
    container,
    createOrder,
    onApprove,
    fundingSource: 'venmo',
  });
}
