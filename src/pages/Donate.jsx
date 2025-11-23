import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DonationForm from '../components/forms/DonationForm';
import { Card, CardContent } from '@/components/ui/card';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';

export default function Donate() {
  const [showDonationForm, setShowDonationForm] = useState(true);
  const queryClient = useQueryClient();

  // Fetch charities
  const { data: charities = [] } = useQuery({
    queryKey: ['charities'],
    queryFn: () => dataClient.entities.Charity.list(),
  });

  // Fetch donations
  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => dataClient.entities.Donation.list('-date'),
  });

  // Fetch transactions to calculate ma'aser owed
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataClient.entities.Transaction.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const maaserPercentage = user?.maaser_percentage || 10;

  const createDonationMutation = useMutation({
    mutationFn: (data) => dataClient.entities.Donation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast.success('Donation recorded successfully!');
    },
  });

  const handleDonationSubmit = (data) => {
    createDonationMutation.mutate(data);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => !t.is_internal_transfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const maaserTarget = (totalIncome * maaserPercentage) / 100;
  const maaserOwed = Math.max(maaserTarget - totalDonated, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Make a Donation</h1>
          <p className="text-xl text-gray-600">Ma'aser Owed: ${maaserOwed.toFixed(2)}</p>
        </div>

        {/* Donation Form */}
        <DonationForm
          charities={charities}
          onSubmit={handleDonationSubmit}
          onCancel={() => {}}
          maxAmount={maaserOwed}
        />

        {/* Donations History */}
        {donations.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Donation History</h3>
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CharityBoxIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{donation.charity_name}</h4>
                        <p className="text-sm text-gray-600">{new Date(donation.date).toLocaleDateString()}</p>
                        {donation.notes && <p className="text-sm text-gray-500 mt-1">{donation.notes}</p>}
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-600">${donation.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
