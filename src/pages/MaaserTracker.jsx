import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Heart, ArrowUpRight, ArrowDownLeft, Clock3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import TransactionForm from '../components/forms/TransactionForm';

export default function MaaserTracker() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const maaserPercentage = user?.maaser_percentage || 10;

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataClient.entities.Transaction.list('-date'),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => dataClient.entities.Donation.list('-date'),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => dataClient.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionForm(false);
      toast.success('Income added successfully!');
    },
  });

  const totalIncome = transactions
    .filter((t) => !t.is_internal_transfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const maaserTarget = (totalIncome * maaserPercentage) / 100;
  const maaserOwed = Math.max(maaserTarget - totalDonated, 0);

  const handleTransactionSubmit = (data) => {
    createTransactionMutation.mutate(data);
  };

  const handleTransactionCancel = () => {
    setShowTransactionForm(false);
  };

  const recentActivity = [
    ...transactions
      .filter((t) => !t.is_internal_transfer)
      .map((t) => ({
        id: `income-${t.id}`,
        type: 'income',
        label: t.description || 'Income received',
        amount: t.amount,
        date: t.date,
        account: t.account,
      })),
    ...donations.map((d) => ({
      id: `donation-${d.id}`,
      type: 'donation',
      label: d.charity_name || 'Ma’aser payment',
      amount: d.amount,
      date: d.date,
      account: d.notes,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl overflow-hidden">
        <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black">Know exactly where your ma'aser stands.</h1>
            <p className="text-white/70 max-w-2xl">A calm snapshot of what you owe, what you've given, and the latest money coming in.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
            <Clock3 className="h-5 w-5" />
            <div>
              <p className="text-xs text-white/60">Current commitment</p>
              <p className="text-lg font-semibold">{maaserPercentage}% of income</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 text-white shadow-2xl p-8 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Ma'aser Owed</p>
              <p className="text-5xl md:text-6xl font-black mt-2">${maaserOwed.toFixed(2)}</p>
              <p className="text-white/80 mt-2">Set aside this amount to stay square with your ma'aser goal.</p>
            </div>
            <Button
              className="bg-white text-rose-600 hover:bg-white/90 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
              onClick={() => setShowTransactionForm((prev) => !prev)}
            >
              <Plus className="h-5 w-5 mr-2" /> Add income
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-md p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total donate</p>
              <p className="text-3xl font-bold text-slate-900">${totalDonated.toFixed(2)}</p>
              <p className="text-sm text-slate-500">Ma'aser already paid out</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-md p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total income</p>
              <p className="text-3xl font-bold text-slate-900">${totalIncome.toFixed(2)}</p>
              <p className="text-sm text-slate-500">Tracked earnings subject to ma'aser</p>
            </div>
          </div>
        </div>
      </div>

      {showTransactionForm && (
        <Card className="border border-slate-200 shadow-md">
          <CardContent className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">New income</p>
                <h2 className="text-2xl font-bold text-slate-900">Log earnings to update the balance</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTransactionForm(false)}
                className="text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5 active:scale-95 transition"
              >
                Close
              </Button>
            </div>
              <TransactionForm
                transaction={null}
                onSubmit={handleTransactionSubmit}
                onCancel={handleTransactionCancel}
              />
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent</p>
              <h3 className="text-2xl font-bold text-slate-900">Latest activity</h3>
              <p className="text-slate-600">Income and ma'aser payments, most recent first.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {recentActivity.length} total records
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 && <p className="text-slate-600 text-center py-10">No transactions yet.</p>}
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow ${
                  item.type === 'income'
                    ? 'bg-indigo-50 border-indigo-100'
                    : 'bg-emerald-50 border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
                      item.type === 'income' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.type === 'income' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 text-lg truncate">{item.label}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          item.type === 'income'
                            ? 'bg-indigo-200 text-indigo-800'
                            : 'bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        {item.type === 'income' ? 'Income' : "Ma'aser Payment"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {item.account ? `${item.account} • ` : ''}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">${item.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
