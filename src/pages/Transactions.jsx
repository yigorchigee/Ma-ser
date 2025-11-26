import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, List, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
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

  const handleDeleteDonation = (id) => {
    if (confirm('Are you sure you want to delete this donation?')) {
      deleteDonationMutation.mutate(id);
    }
  };

  const allItems = [
    ...transactions.map((t) => ({ ...t, type: 'income' })),
    ...donations.map((d) => ({ ...d, type: 'donation' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = transactions.filter((t) => !t.is_internal_transfer);

  const filteredItems =
    view === 'all'
      ? allItems
      : view === 'income'
        ? allItems.filter((item) => item.type === 'income')
        : allItems.filter((item) => item.type === 'donation');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Income entries" value={incomeTransactions.length} accent="indigo" />
        <SummaryCard label="Ma'aser payments" value={donations.length} accent="emerald" />
        <SummaryCard label="All records" value={allItems.length} accent="rose" />
      </div>

      <LedgerCard
        title="Activity feed"
        view={view}
        onViewChange={setView}
        items={filteredItems}
        onDeleteDonation={handleDeleteDonation}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}

function SummaryCard({ label, value, accent }) {
  const colors = {
    indigo: {
      surface: 'from-indigo-50 to-slate-50 border-indigo-100 text-indigo-700',
      dot: 'bg-indigo-500',
    },
    emerald: {
      surface: 'from-emerald-50 to-slate-50 border-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    rose: {
      surface: 'from-rose-50 to-slate-50 border-rose-100 text-rose-700',
      dot: 'bg-rose-500',
    },
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 ${colors[accent].surface}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${colors[accent].dot}`} />
      </div>
      <p className="text-3xl font-black mt-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4" /> {value}
      </p>
    </div>
  );
}

function LedgerCard({ title, items, onDeleteTransaction, onDeleteDonation, view, onViewChange }) {
  return (
    <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
      <CardHeader className="pb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          {title}
        </CardTitle>
        <div className="w-full sm:w-64">
          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="w-full h-11 text-sm font-semibold bg-white border-slate-200 text-slate-900 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="All activity" />
            </SelectTrigger>
            <SelectContent className="text-slate-900 bg-white shadow-lg border border-slate-200">
              <SelectItem
                value="all"
                className="text-base text-slate-900 data-[highlighted]:bg-indigo-50 data-[state=checked]:bg-indigo-100"
              >
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  All
                </div>
              </SelectItem>
              <SelectItem
                value="income"
                className="text-base text-slate-900 data-[highlighted]:bg-indigo-50 data-[state=checked]:bg-indigo-100"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Income
                </div>
              </SelectItem>
              <SelectItem
                value="donations"
                className="text-base text-slate-900 data-[highlighted]:bg-indigo-50 data-[state=checked]:bg-indigo-100"
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
                  ? 'bg-indigo-50 border-indigo-100'
                  : 'bg-emerald-50 border-emerald-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl ${item.type === 'income' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.type === 'income' ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <CharityBoxIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-900 text-lg truncate">
                      {item.type === 'income' ? item.description : item.charity_name}
                    </h4>
                    <Badge className={item.type === 'income' ? 'bg-indigo-600' : 'bg-emerald-600'}>
                      {item.type === 'income' ? 'Income' : 'Donation'}
                    </Badge>
                    {item.is_internal_transfer && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Internal Transfer
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (item.type === 'income' ? onDeleteTransaction(item.id) : onDeleteDonation(item.id))}
                  className="hover:bg-rose-100 active:scale-95 transition"
                >
                  <Trash2 className="h-5 w-5 text-rose-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
