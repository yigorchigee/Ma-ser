import React, { useState, useEffect } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Percent, RotateCcw, Link2, User, Wallet2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const [maaserPercentage, setMaaserPercentage] = useState(user?.maaser_percentage || 10);

  useEffect(() => {
    if (user?.maaser_percentage) {
      setMaaserPercentage(user.maaser_percentage);
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => dataClient.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Settings updated successfully!');
    },
  });

  const handleMaaserPercentageChange = (value) => {
    const percentage = parseInt(value);
    setMaaserPercentage(percentage);
    updateSettingsMutation.mutate({ maaser_percentage: percentage });
  };

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      dataClient.reset();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Sample data reset. Fresh starter data loaded.');
    },
  });

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.25),transparent_40%)]" aria-hidden />
        <CardContent className="p-8 space-y-4 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black">Make it feel like yours.</h1>
              <p className="text-white/75 max-w-2xl">Tune the ma'aser percentage and reset the sample data whenever you want a clean slate.</p>
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Live saving</span>
                <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Account linking</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-5 w-5" />
              Preferences saved locally
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Percent className="h-6 w-6 text-purple-600" />
              Ma'aser percentage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="maaser-percentage" className="text-base">Select your ma'aser percentage:</Label>
            <Select value={maaserPercentage.toString()} onValueChange={handleMaaserPercentageChange}>
              <SelectTrigger id="maaser-percentage" className="w-full text-base h-12 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-base">10%</SelectItem>
                <SelectItem value="20" className="text-base">20%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600">This determines what percentage of your income should be set aside for ma'aser.</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Link2 className="h-6 w-6 text-purple-600" />
              Link your accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Connect banks or payment apps so income and giving stay in sync. These buttons are placeholders for upcoming integrations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Bank', 'Cash App', 'Venmo', 'PayPal', 'Zelle', 'Other'].map((provider) => (
                <button
                  key={provider}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:border-slate-400 hover:-translate-y-0.5 active:scale-95 transition shadow-sm"
                >
                  {provider}
                  <span className="block text-xs font-normal text-slate-500">Tap to link {provider.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-purple-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
              <p className="text-lg font-semibold text-slate-900">{user?.name || 'Sample User'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="text-lg font-semibold text-slate-900">{user?.email || 'user@example.com'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet2 className="h-6 w-6 text-purple-600" />
              Reset & data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-slate-700">
              Clear your current local data and reload the seeded sample income, donations, and charities. Useful if you want a clean slate or to see the starter example values again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = confirm('Reset sample data? This will remove your local entries and restore the starter examples.');
                if (confirmed) {
                  resetDataMutation.mutate();
                }
              }}
              className="flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 transition shadow-sm"
              disabled={resetDataMutation.isLoading}
            >
              <RotateCcw className="h-5 w-5" />
              {resetDataMutation.isLoading ? 'Resetting...' : 'Reset sample data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
