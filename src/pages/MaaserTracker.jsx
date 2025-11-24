import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Heart, Target, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import StatCard from '../components/dashboard/StatCard';
import TransactionList from '../components/dashboard/TransactionList';
import TransactionForm from '../components/forms/TransactionForm';

export default function MaaserTracker() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

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

  const { data: charities = [] } = useQuery({
    queryKey: ['charities'],
    queryFn: () => dataClient.entities.Charity.list(),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => dataClient.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionForm(false);
      setEditingTransaction(null);
      toast.success('Transaction added successfully!');
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => dataClient.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionForm(false);
      setEditingTransaction(null);
      toast.success('Transaction updated successfully!');
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => dataClient.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully!');
    },
  });

  const totalIncome = transactions
    .filter((t) => !t.is_internal_transfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const maaserTarget = (totalIncome * maaserPercentage) / 100;
  const maaserOwed = Math.max(maaserTarget - totalDonated, 0);

  const handleTransactionSubmit = (data) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createTransactionMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const progress = maaserTarget === 0 ? 0 : Math.min((totalDonated / maaserTarget) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-800 text-white">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="uppercase tracking-[0.3em] text-xs text-white/60 mb-2">Ma'aser Overview</p>
                <h1 className="text-3xl md:text-4xl font-black">Give with confidence.</h1>
                <p className="text-white/70 mt-3 max-w-xl">
                  Track income, set aside ma'aser, and celebrate the impact of every donation.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-semibold">
                <Shield className="h-5 w-5" />
                {maaserPercentage}% commitment
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm text-white/60">Ma'aser owed</p>
                <p className="text-3xl font-black mt-1">${maaserOwed.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm text-white/60">Income tracked</p>
                <p className="text-3xl font-black mt-1">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm text-white/60">Donated so far</p>
                <p className="text-3xl font-black mt-1">${totalDonated.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Goal progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/60">{maaserPercentage}% of income reserved for giving.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-md">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="uppercase text-xs tracking-[0.3em] text-slate-500 mb-2">Quick actions</p>
                <h2 className="text-2xl font-bold text-slate-900">Add income or adjust details</h2>
              </div>
              <Sparkles className="h-6 w-6 text-indigo-500" />
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><DollarSign className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">Log a new income entry</p>
                  <p className="text-slate-500">Keep your ma'aser target current and transparent.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Heart className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">Celebrate generosity</p>
                  <p className="text-slate-500">Use the Donate page to record each gift in one place.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setEditingTransaction(null);
                  setShowTransactionForm(!showTransactionForm);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-5 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add income
              </Button>
              {editingTransaction && (
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                  Editing <span className="font-semibold">{editingTransaction.description}</span>
                </div>
              )}
            </div>

            {showTransactionForm && (
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleTransactionSubmit}
                onCancel={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Income" value={totalIncome} icon={DollarSign} colorClass="text-indigo-600" />
        <StatCard title="Ma'aser Target" value={maaserTarget} icon={Target} colorClass="text-emerald-600" />
        <StatCard title="Donated" value={totalDonated} icon={Heart} colorClass="text-rose-600" />
      </div>

      <Card className="border border-slate-200 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="uppercase text-xs tracking-[0.3em] text-slate-500">Activity</p>
              <h3 className="text-2xl font-bold text-slate-900">Recent income</h3>
              <p className="text-slate-600">Edit or remove transactions to keep your ledger pristine.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Up to date with {transactions.length} entries
            </div>
          </div>

          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-rose-500" />
            <div>
              <p className="uppercase text-xs tracking-[0.3em] text-slate-500">Giving spotlight</p>
              <h3 className="text-xl font-bold text-slate-900">Charities you're supporting</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {charities.length === 0 && (
              <p className="text-slate-600">No charities on file yet. Add donations to see them here.</p>
            )}
            {charities.map((charity) => (
              <div key={charity.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Partner</p>
                <p className="font-semibold text-slate-900">{charity.name}</p>
                {charity.website && (
                  <a
                    href={charity.website}
                    className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {charity.website}
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
