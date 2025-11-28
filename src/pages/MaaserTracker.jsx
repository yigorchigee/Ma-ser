import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

import TransactionForm from '../components/forms/TransactionForm';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';

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
        description: t.description || 'Income received',
        amount: t.amount,
        date: t.date,
        account: t.account,
        notes: t.notes,
      })),
    ...donations.map((d) => ({
      id: `donation-${d.id}`,
      type: 'donation',
      charity_name: d.charity_name || "Ma'aser payment",
      amount: d.amount,
      date: d.date,
      notes: d.notes,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-500 text-white shadow-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Ma'aser Owed</p>
            <p className="text-5xl md:text-6xl font-black">${maaserOwed.toFixed(2)}</p>
          </div>
          <Button
            className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            onClick={() => setShowTransactionForm((prev) => !prev)}
          >
            <Plus className="h-5 w-5 mr-2" /> Add income
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-md p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total donated</p>
            <p className="text-3xl font-bold text-slate-900">${totalDonated.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Ma'aser already paid out</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-md p-6 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total income</p>
            <p className="text-3xl font-bold text-slate-900">${totalIncome.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Tracked earnings subject to ma'aser</p>
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
            <TransactionForm transaction={null} onSubmit={handleTransactionSubmit} onCancel={() => setShowTransactionForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent</p>
              <h3 className="text-2xl font-bold text-slate-900">Recent activity</h3>
              <p className="text-slate-600">Income and ma'aser payments, most recent first.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {recentActivity.length} total records
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 && <p className="text-slate-600 text-center py-10">No transactions yet.</p>}
            {recentActivity.map((item) => {
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition hover:-translate-y-0.5 hover:shadow ${
                    isIncome ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isIncome ? <DollarSign className="h-5 w-5" /> : <CharityBoxIcon className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-lg truncate">
                          {isIncome ? item.description : item.charity_name}
                        </h4>
                        <Badge className={isIncome ? 'bg-emerald-600' : 'bg-blue-600'}>
                          {isIncome ? 'Income' : "Ma'aser Payment"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {isIncome && item.account ? `${item.account} • ` : ''}
                        {format(new Date(item.date), 'MMMM dd, yyyy')}
                      </p>
                      {item.notes && <p className="text-sm text-slate-500 truncate">{item.notes}</p>}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
