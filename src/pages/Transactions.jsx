import React, { useState } from 'react';
import { dataClient, isManualTransaction } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, List, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatCounterparty } from '@/utils';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';

export default function Transactions() {
  const [view, setView] = useState('all');
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataClient.entities.Transaction.list('-date'),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => dataClient.entities.Donation.list('-date'),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => dataClient.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Only manually added transactions can be deleted.');
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: (id) => dataClient.entities.Donation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast.success('Donation deleted successfully!');
    },
  });

  const handleDeleteTransaction = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const allItems = [
    ...transactions.map((t) => ({ ...t, type: 'income', isManual: isManualTransaction(t) })),
    ...donations.map((d) => ({ ...d, type: 'donation' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredItems =
    view === 'all'
      ? allItems
      : view === 'income'
        ? allItems.filter((item) => item.type === 'income')
        : allItems.filter((item) => item.type === 'donation');

  return (
    <div className="space-y-8">
      <LedgerCard
        title="Activity feed"
        view={view}
        onViewChange={setView}
        items={filteredItems}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}

function LedgerCard({ title, items, onDeleteTransaction, view, onViewChange }) {
  return (
    <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
      <CardHeader className="pb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <div className="w-full sm:w-64">
          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="w-full h-11 text-sm font-semibold bg-white border-slate-200 text-slate-900 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="All activity" />
            </SelectTrigger>
            <SelectContent className="text-slate-900 bg-white shadow-lg border border-slate-200">
              <SelectItem
                value="all"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  All
                </div>
              </SelectItem>
              <SelectItem
                value="income"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Income
                </div>
              </SelectItem>
              <SelectItem
                value="donations"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <CharityBoxIcon className="h-5 w-5" />
                  Ma'aser Payments
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No transactions yet</p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition hover:-translate-y-0.5 hover:shadow ${
                item.type === 'income'
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.type === 'income' ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <CharityBoxIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-900 text-lg truncate">
                      {formatCounterparty(item)}
                    </h4>
                    <Badge className={item.type === 'income' ? 'bg-emerald-600' : 'bg-blue-600'}>
                      {item.type === 'income' ? 'Income' : "Ma'aser Payment"}
                    </Badge>
                    {item.is_internal_transfer && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Internal Transfer
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    {item.type === 'income' ? (
                      <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                        {[item.integration_provider, item.account].filter(Boolean).join(' ') || 'Manual entry'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                        {item.charity_name || item.description || 'Recipient'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {item.type === 'income' && item.account ? `${item.account} • ` : ''}
                    {format(new Date(item.date), 'MMMM dd, yyyy')}
                  </p>
                  {item.notes && <p className="text-sm text-slate-500 truncate">{item.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                {(item.type === 'income' ? item.isManual : true) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (item.type === 'income' ? onDeleteTransaction(item.id) : onDeleteDonation(item.id))}
                    className="hover:bg-rose-100 active:scale-95 transition"
                  >
                    <Trash2 className="h-5 w-5 text-rose-600" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
