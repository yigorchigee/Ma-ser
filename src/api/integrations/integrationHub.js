import { bankingClient } from './bankingClient';
import { cashAppClient } from './cashAppClient';
import { hasIntegrationConfig } from './config';
import { paypalClient } from './paypalClient';
import { venmoClient } from './venmoClient';
import { zelleClient } from './zelleClient';

function normalizeTransactions(provider, items, mapper) {
  if (!Array.isArray(items)) return [];
  return items
    .map(mapper)
    .filter(Boolean)
    .map((txn) => ({ ...txn, provider }));
}

export const integrationHub = {
  async connectionStatus() {
    return {
      bankAggregator: bankingClient.enabled,
      paypal: paypalClient.enabled,
      cashApp: cashAppClient.enabled,
      zelle: zelleClient.enabled,
      venmo: venmoClient.enabled,
    };
  },

  async syncExternalTransactions() {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const defaultEnd = now.toISOString();

    const results = await Promise.allSettled([
      bankingClient.syncTransactions?.(undefined, undefined),
      (async () => {
        const token = await paypalClient.createAccessToken();
        return paypalClient.listTransactions(token, defaultStart, defaultEnd);
      })(),
      cashAppClient.listTransfers({ startDate: defaultStart, endDate: defaultEnd }),
      zelleClient.listTransfers({ startDate: defaultStart, endDate: defaultEnd }),
      venmoClient.listPayments({ startDate: defaultStart, endDate: defaultEnd }),
    ]);

    const collected = [];

    // Bank aggregator (Plaid-like)
    const bankResult = results[0];
    if (bankResult.status === 'fulfilled' && bankResult.value) {
      collected.push(
        ...normalizeTransactions('bank', bankResult.value.added || bankResult.value.transactions || [], (txn) => ({
          id: txn.transaction_id || txn.id,
          date: txn.date,
          description: txn.name || txn.description,
          amount: txn.amount,
          account: txn.account_id,
          category: Array.isArray(txn.category) ? txn.category.join(', ') : txn.category,
          sourceId: txn.transaction_id || txn.id,
        }))
      );
    }

    // PayPal
    const paypalResult = results[1];
    if (paypalResult.status === 'fulfilled' && paypalResult.value) {
      collected.push(
        ...normalizeTransactions('paypal', paypalResult.value, (txn) => ({
          id: txn.transaction_info?.transaction_id,
          date: txn.transaction_info?.transaction_initiation_date,
          description: txn.payer_info?.payer_name || txn.transaction_info?.transaction_event_code,
          amount: Number(txn.transaction_info?.transaction_amount?.value || 0),
          account: txn.transaction_info?.paypal_account_id,
          category: txn.transaction_info?.transaction_event_code,
          sourceId: txn.transaction_info?.transaction_id,
        }))
      );
    }

    // Cash App
    const cashAppResult = results[2];
    if (cashAppResult.status === 'fulfilled' && cashAppResult.value) {
      collected.push(
        ...normalizeTransactions('cash_app', cashAppResult.value.transfers || cashAppResult.value, (txn) => ({
          id: txn.id,
          date: txn.created_at || txn.date,
          description: txn.note || 'Cash App transfer',
          amount: Number(txn.amount || txn.net_amount || 0),
          account: txn.account_id || 'Cash App',
          category: txn.status,
          sourceId: txn.id,
        }))
      );
    }

    // Zelle
    const zelleResult = results[3];
    if (zelleResult.status === 'fulfilled' && zelleResult.value) {
      collected.push(
        ...normalizeTransactions('zelle', zelleResult.value.transfers || zelleResult.value, (txn) => ({
          id: txn.id,
          date: txn.date,
          description: txn.memo || 'Zelle transfer',
          amount: Number(txn.amount || 0),
          account: txn.account || 'Zelle',
          category: txn.direction,
          sourceId: txn.id,
        }))
      );
    }

    // Venmo
    const venmoResult = results[4];
    if (venmoResult.status === 'fulfilled' && venmoResult.value) {
      collected.push(
        ...normalizeTransactions('venmo', venmoResult.value.payments || venmoResult.value, (txn) => ({
          id: txn.id,
          date: txn.created_at || txn.date_completed,
          description: txn.note || 'Venmo payment',
          amount: Number(txn.amount || txn.amount?.value || 0),
          account: txn.source || 'Venmo',
          category: txn.status,
          sourceId: txn.id,
        }))
      );
    }

    return collected.filter((txn) => txn.date && !Number.isNaN(Number(txn.amount)));
  },

  async disconnect(provider) {
    if (!hasIntegrationConfig(provider)) return { disconnected: true };
    // Most providers require server-side token revocation; here we simply signal intent.
    return { disconnected: true, provider };
  },
};
