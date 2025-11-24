import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DonationForm from '../components/forms/DonationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';
import { Heart, Sparkles } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 text-white">
          <CardContent className="p-8 space-y-6">
            <p className="uppercase tracking-[0.3em] text-xs text-white/70">Donate</p>
            <h1 className="text-3xl md:text-4xl font-black">Turn intention into impact.</h1>
            <p className="text-white/80 max-w-2xl">
              Record your ma'aser payments, celebrate your giving streak, and see how close you are to your goal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/80">
              <Highlight label="Ma'aser owed" value={`$${maaserOwed.toFixed(2)}`} />
              <Highlight label="Target" value={`$${maaserTarget.toFixed(2)}`} />
              <Highlight label="Donated" value={`$${totalDonated.toFixed(2)}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Quick guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Give with confidence</p>
            <p>Log each donation so your ma'aser balance updates instantly.</p>
            <p>Pick from saved charities or type a new recipient in the form.</p>
            <p className="text-xs text-slate-500">Everything stays on this device as demo data.</p>
          </CardContent>
        </Card>
      </div>

      {showDonationForm && (
        <Card className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Record a gift</CardTitle>
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

      {donations.length > 0 && (
        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Heart className="h-5 w-5 text-rose-500" />
              Donation history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <CharityBoxIcon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{donation.charity_name}</h4>
                    <p className="text-sm text-slate-600">{new Date(donation.date).toLocaleDateString()}</p>
                    {donation.notes && <p className="text-sm text-slate-500 mt-1">{donation.notes}</p>}
                  </div>
                </div>
                <span className="text-xl font-bold text-emerald-700">${donation.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Highlight({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
