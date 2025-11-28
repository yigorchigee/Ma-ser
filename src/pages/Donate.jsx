import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DonationForm from '../components/forms/DonationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';
import { Heart, Sparkles, ArrowUpRight } from 'lucide-react';

export default function Donate() {
  const [showDonationForm] = useState(true);
  const queryClient = useQueryClient();

  const { data: charities = [] } = useQuery({
    queryKey: ['charities'],
    queryFn: () => dataClient.entities.Charity.list(),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => dataClient.entities.Donation.list('-date'),
  });

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

  const totalIncome = transactions
    .filter((t) => !t.is_internal_transfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const maaserTarget = (totalIncome * maaserPercentage) / 100;
  const maaserOwed = Math.max(maaserTarget - totalDonated, 0);

  const showcaseCharities =
    charities.length > 0
      ? charities
      : [
          { id: '1', name: 'Hope Relief Fund', website: 'hope-relief.org', focus: 'Emergency support' },
          { id: '2', name: 'Bright Futures', website: 'brightfutures.org', focus: 'Education & youth' },
          { id: '3', name: 'Healing Hands', website: 'healinghands.org', focus: 'Health & wellness' },
          { id: '4', name: 'Community Roots', website: 'communityroots.org', focus: 'Local assistance' },
        ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Channel your ma'aser where it matters most.</h1>
        <p className="text-slate-600 max-w-2xl">Pick a cause to support. We'll expand each profile soon, but for now choose the charity that resonates and log your gift.</p>
      </div>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-2xl font-bold text-slate-900">
            <span>Choose a charity</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" /> Curated partners
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseCharities.map((charity) => (
            <button
              key={charity.id}
              className="group text-left rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Charity</p>
                  <p className="text-lg font-semibold text-slate-900">{charity.name}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mb-2">{charity.focus || 'Trusted partner'}</p>
              {charity.website && (
                <p className="text-sm font-semibold text-blue-700">{charity.website}</p>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {showDonationForm && (
        <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Record a ma'aser payment</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DonationForm
              charities={charities}
              onSubmit={handleDonationSubmit}
              onCancel={() => {}}
              maxAmount={maaserOwed}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Heart className="h-5 w-5 text-blue-600" />
            Recent gifts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {donations.length === 0 && <p className="text-slate-600">No donations yet. Pick a charity above to get started.</p>}
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl transition hover:-translate-y-0.5 hover:shadow"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <CharityBoxIcon className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">{donation.charity_name}</h4>
                  <p className="text-sm text-slate-600">{new Date(donation.date).toLocaleDateString()}</p>
                  {donation.notes && <p className="text-sm text-slate-500 mt-1">{donation.notes}</p>}
                </div>
              </div>
              <span className="text-xl font-bold text-blue-700">${donation.amount.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
