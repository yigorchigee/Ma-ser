import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, List, Edit2, Trash2, ArrowUpRight, Notebook } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white">
          <CardContent className="p-8 space-y-5">
            <p className="uppercase tracking-[0.3em] text-xs text-white/70">Transactions</p>
            <h1 className="text-3xl md:text-4xl font-black">Every dollar tells a story.</h1>
            <p className="text-white/80 max-w-2xl">
              Review income entries and ma'aser payments in one streamlined ledger. Switch views to focus on just what you need.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="px-3 py-2 rounded-full bg-white/15 border border-white/20">{transactions.length} income entries</span>
              <span className="px-3 py-2 rounded-full bg-white/15 border border-white/20">{donations.length} donations</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Notebook className="h-5 w-5 text-indigo-500" />
              Pick what to explore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-full h-12 text-base font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base">
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    All activity
                  </div>
                </SelectItem>
                <SelectItem value="income" className="text-base">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Income only
                  </div>
                </SelectItem>
                <SelectItem value="donations" className="text-base">
                  <div className="flex items-center gap-2">
                    <CharityBoxIcon className="h-5 w-5" />
                    Ma'aser payments
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600">Use this switcher to focus on the entries you care about right now.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Income entries" value={incomeTransactions.length} accent="indigo" />
        <SummaryCard label="Donations" value={donations.length} accent="emerald" />
        <SummaryCard label="All records" value={allItems.length} accent="rose" />
      </div>

      {view === 'all' && (
        <LedgerCard
          title="All activity"
          items={allItems}
          onDeleteDonation={handleDeleteDonation}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {view === 'income' && (
        <IncomeCard
          transactions={transactions}
          incomeTransactions={incomeTransactions}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {view === 'donations' && (
        <DonationCard
          donations={donations}
          onDeleteDonation={handleDeleteDonation}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }) {
  const colors = {
    indigo: 'from-indigo-50 to-slate-50 border-indigo-100 text-indigo-700',
    emerald: 'from-emerald-50 to-slate-50 border-emerald-100 text-emerald-700',
    rose: 'from-rose-50 to-slate-50 border-rose-100 text-rose-700',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${colors[accent]}`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}

function LedgerCard({ title, items, onDeleteTransaction, onDeleteDonation }) {
  return (
    <Card className="border border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No transactions yet</p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
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
                  className="hover:bg-rose-100"
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

function IncomeCard({ transactions, incomeTransactions, onDeleteTransaction }) {
  return (
    <Card className="border border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900">Income transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600">Showing {incomeTransactions.length} income transaction(s) used for ma'aser calculation.</p>
        {incomeTransactions.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No income transactions yet</p>
        ) : (
          <div className="space-y-3">
            {incomeTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-lg truncate">{transaction.description}</h4>
                    <p className="text-sm text-slate-600 truncate">
                      {transaction.account} • {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                    </p>
                    {transaction.category && (
                      <Badge variant="outline" className="mt-2">
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-700">${transaction.amount.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="hover:bg-rose-100"
                  >
                    <Trash2 className="h-5 w-5 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.filter((t) => t.is_internal_transfer).length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-slate-800 text-lg">Excluded internal transfers</h4>
            {transactions.filter((t) => t.is_internal_transfer).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg opacity-80"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-slate-200 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{transaction.description}</h4>
                    <p className="text-sm text-slate-600 truncate">
                      {transaction.account} • {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-slate-700">${transaction.amount.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DonationCard({ donations, onDeleteDonation }) {
  return (
    <Card className="border border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900">Ma'aser payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600">Showing {donations.length} donation(s)</p>
        {donations.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No donations yet</p>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <CharityBoxIcon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-lg truncate">{donation.charity_name}</h4>
                    <p className="text-sm text-slate-600 truncate">{format(new Date(donation.date), 'MMMM dd, yyyy')}</p>
                    {donation.notes && <p className="text-sm text-slate-500 truncate">{donation.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-emerald-700">${donation.amount.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteDonation(donation.id)}
                    className="hover:bg-rose-100"
                  >
                    <Trash2 className="h-5 w-5 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
