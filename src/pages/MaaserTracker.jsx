import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import StatCard from '../components/dashboard/StatCard';
import TransactionList from '../components/dashboard/TransactionList';
import TransactionForm from '../components/forms/TransactionForm';

export default function MaaserTracker() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showMoreStats, setShowMoreStats] = useState(false);

  const queryClient = useQueryClient();

  // Fetch user settings - make it optional so it doesn't break the page
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
  });

  const maaserPercentage = user?.maaser_percentage || 10;

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date'),
  });

  // Fetch donations
  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => base44.entities.Donation.list('-date'),
  });

  // Fetch charities
  const { data: charities = [] } = useQuery({
    queryKey: ['charities'],
    queryFn: () => base44.entities.Charity.list(),
  });

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionForm(false);
      setEditingTransaction(null);
      toast.success('Transaction added successfully!');
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowTransactionForm(false);
      setEditingTransaction(null);
      toast.success('Transaction updated successfully!');
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully!');
    },
  });



  // Calculate totals
  const totalIncome = transactions
    .filter(t => !t.is_internal_transfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const maaserOwed = (totalIncome * maaserPercentage) / 100;

  // Handlers
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Ma'aser Tracker</h1>
        </div>

        {/* Main Ma'aser Owed Card */}
        <Card 
          className="text-white shadow-2xl hover:shadow-3xl transition-shadow"
          style={{
            background: user?.color_scheme === 'green' ? 'linear-gradient(to bottom right, #059669, #0d9488)' :
                       user?.color_scheme === 'orange' ? 'linear-gradient(to bottom right, #ea580c, #dc2626)' :
                       user?.color_scheme === 'blue' ? 'linear-gradient(to bottom right, #2563eb, #06b6d4)' :
                       user?.color_scheme === 'pink' ? 'linear-gradient(to bottom right, #db2777, #9333ea)' :
                       user?.color_scheme === 'red' ? 'linear-gradient(to bottom right, #dc2626, #f43f5e)' :
                       'linear-gradient(to bottom right, #9333ea, #2563eb)'
          }}
        >
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ma'aser Owed</h2>
            <div className="text-6xl md:text-8xl font-bold mb-2">
              ${maaserOwed.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Toggle for more stats */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowMoreStats(!showMoreStats)}
            className="text-base px-6 py-3 bg-white"
          >
            {showMoreStats ? (
              <>
                <ChevronUp className="h-5 w-5 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-5 w-5 mr-2" />
                View More Details
              </>
            )}
          </Button>
        </div>

        {/* Additional Stats - Collapsible */}
        {showMoreStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total Income"
              value={totalIncome}
              icon={DollarSign}
              colorClass="text-blue-600"
            />
            <StatCard
              title="Total Donated"
              value={totalDonated}
              icon={Heart}
              colorClass="text-pink-600"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              setEditingTransaction(null);
              setShowTransactionForm(!showTransactionForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            size="lg"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add Income Transaction
          </Button>
        </div>

        {/* Forms */}
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

        {/* Transactions List */}
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
