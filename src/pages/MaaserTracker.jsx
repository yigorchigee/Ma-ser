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
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.2),transparent_40%)]" aria-hidden />
        <div className="absolute -right-28 -bottom-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black">Know exactly where your ma'aser stands.</h1>
            <p className="text-white/70 max-w-2xl">A calm snapshot of what you owe, what you've given, and the latest money coming in.</p>
            <div className="flex flex-wrap gap-2 text-sm text-white/70">
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Live totals</span>
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Recent feed</span>
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Quick add income</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 shadow-xl shadow-indigo-900/40 backdrop-blur">
            <Clock3 className="h-5 w-5" />
            <div>
              <p className="text-xs text-white/60">Current commitment</p>
              <p className="text-lg font-semibold">{maaserPercentage}% of income</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-400 text-white shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_35%)] opacity-40" aria-hidden />
            <div className="flex items-start justify-between gap-6 relative">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Ma'aser Owed</p>
                <p className="text-5xl md:text-6xl font-black drop-shadow">${maaserOwed.toFixed(2)}</p>
                <p className="text-white/90">Set aside this amount to stay square with your ma'aser goal.</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-white/85">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                    <p className="uppercase tracking-wide text-[11px] text-white/70">Income tracked</p>
                    <p className="text-xl font-semibold">${totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                    <p className="uppercase tracking-wide text-[11px] text-white/70">Paid so far</p>
                    <p className="text-xl font-semibold">${totalDonated.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <Button
                  className="bg-white text-rose-600 hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
                  onClick={() => setShowTransactionForm((prev) => !prev)}
                >
                  <Plus className="h-5 w-5 mr-2" /> Add income
                </Button>
                <div className="rounded-full bg-white/15 border border-white/30 px-3 py-1 text-xs font-semibold text-white/80">Auto-updates live</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-rose-100/80 bg-gradient-to-br from-white to-rose-50 shadow-lg p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-600/80">Total donate</p>
                <p className="text-3xl font-bold text-slate-900">${totalDonated.toFixed(2)}</p>
                <p className="text-sm text-slate-500">Ma'aser already paid out</p>
              </div>
            </div>
            <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50 shadow-lg p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600/80">Total income</p>
                <p className="text-3xl font-bold text-slate-900">${totalIncome.toFixed(2)}</p>
                <p className="text-sm text-slate-500">Tracked earnings subject to ma'aser</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-lg bg-white/90 backdrop-blur">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick view</p>
                <h3 className="text-xl font-bold text-slate-900">Balance snapshot</h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">Healthy</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Target ({maaserPercentage}%)</span>
                <span className="font-semibold text-slate-900">${maaserTarget.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                  style={{ width: `${maaserTarget > 0 ? Math.min((totalDonated / maaserTarget) * 100, 100) : 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Already set aside</p>
                  <p className="text-lg font-semibold text-slate-900">${Math.min(totalDonated, maaserTarget).toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Still to go</p>
                  <p className="text-lg font-semibold text-slate-900">${maaserOwed.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Keep logging income and donations to automatically adjust these numbers.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showTransactionForm && (
        <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">New income</p>
                <h2 className="text-2xl font-bold text-slate-900">Log earnings to update the balance</h2>
                <p className="text-sm text-slate-600">Add the source, date, and amount—your owed total will refresh instantly.</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTransactionForm(false)}
                className="text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5 active:scale-95 transition"
              >
                Close
              </Button>
            </div>
            <TransactionForm transaction={null} onSubmit={handleTransactionSubmit} onCancel={() => setShowTransactionForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
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
