import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, List, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';

export default function Transactions() {
  const [view, setView] = useState('all');
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataClient.entities.Transaction.list('-date'),
  });

  // Fetch donations
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

  // Combine all items for "All" view
  const allItems = [
    ...transactions.map(t => ({ ...t, type: 'income' })),
    ...donations.map(d => ({ ...d, type: 'donation' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = transactions.filter(t => !t.is_internal_transfer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-xl text-gray-600">View your income and ma'aser payments</p>
          </div>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[250px] h-12 text-lg font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  All
                </div>
              </SelectItem>
              <SelectItem value="income" className="text-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Income
                </div>
              </SelectItem>
              <SelectItem value="donations" className="text-lg">
                <div className="flex items-center gap-2">
                  <CharityBoxIcon className="h-5 w-5" />
                  Ma'aser Payments
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All Transactions */}
        {view === 'all' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">All Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {allItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-lg">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {allItems.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          item.type === 'income' 
                            ? 'bg-blue-50 hover:bg-blue-100' 
                            : 'bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-full ${
                            item.type === 'income' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {item.type === 'income' ? (
                              <DollarSign className="h-6 w-6 text-blue-600" />
                            ) : (
                              <CharityBoxIcon className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {item.type === 'income' ? item.description : item.charity_name}
                              </h4>
                              <Badge className={item.type === 'income' ? 'bg-blue-600' : 'bg-green-600'}>
                                {item.type === 'income' ? 'Income' : 'Donation'}
                              </Badge>
                              {item.is_internal_transfer && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Internal Transfer
                                </Badge>
                              )}
                            </div>
                            <p className="text-base text-gray-600 mt-1">
                              {item.type === 'income' && item.account ? `${item.account} • ` : ''}
                              {format(new Date(item.date), 'MMMM dd, yyyy')}
                            </p>
                            {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">${item.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => item.type === 'income' ? handleDeleteTransaction(item.id) : handleDeleteDonation(item.id)}
                            className="hover:bg-red-100"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* Income Only */}
        {view === 'income' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Income Transactions</CardTitle>
                <p className="text-base text-gray-600 mt-2">
                  Showing {incomeTransactions.length} income transaction(s) used for ma'aser calculation
                </p>
              </CardHeader>
              <CardContent>
                {incomeTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-lg">No income transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {incomeTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{transaction.description}</h4>
                            <p className="text-base text-gray-600">
                              {transaction.account} • {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                            </p>
                            {transaction.category && (
                              <Badge variant="outline" className="mt-2">{transaction.category}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-blue-600">${transaction.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="hover:bg-red-100"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show excluded transfers */}
                {transactions.filter(t => t.is_internal_transfer).length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-700 text-lg mb-3">Excluded Internal Transfers</h4>
                    <div className="space-y-2">
                      {transactions.filter(t => t.is_internal_transfer).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-gray-200 p-2 rounded-full">
                              <DollarSign className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700">{transaction.description}</h4>
                              <p className="text-sm text-gray-500">
                                {transaction.account} • {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-500">${transaction.amount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* Donations Only */}
        {view === 'donations' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Ma'aser Payments</CardTitle>
                <p className="text-base text-gray-600 mt-2">
                  Showing {donations.length} donation(s)
                </p>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-lg">No donations yet</p>
                ) : (
                  <div className="space-y-3">
                    {donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-green-100 p-3 rounded-full">
                            <CharityBoxIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{donation.charity_name}</h4>
                            <p className="text-base text-gray-600">{format(new Date(donation.date), 'MMMM dd, yyyy')}</p>
                            {donation.notes && <p className="text-sm text-gray-500 mt-1">{donation.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-green-600">${donation.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDonation(donation.id)}
                            className="hover:bg-red-100"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
