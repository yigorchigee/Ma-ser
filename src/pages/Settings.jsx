import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Percent, RotateCcw, Link2, User, Wallet2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const [maaserPercentage, setMaaserPercentage] = useState(user?.maaser_percentage || 10);

  useEffect(() => {
    if (user?.maaser_percentage !== undefined) {
      setMaaserPercentage(user.maaser_percentage);
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => dataClient.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Settings updated successfully!');
    },
    onError: () => {
      toast.error("We couldn't update your settings. Please try again.");
      if (user?.maaser_percentage !== undefined) {
        setMaaserPercentage(user.maaser_percentage);
      }
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

  const isBusy = isLoading || updateSettingsMutation.isPending;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  const handleSectionNavigation = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sections = [
    { id: 'account', label: 'Account', description: "Profile, ma'aser, and connections", icon: User },
    { id: 'reset-data', label: 'Reset & data', description: 'Start fresh with sample data', icon: Wallet2 },
  ];

  if (isError) {
    return (
      <Card className="border border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="p-6 flex flex-col gap-4 text-amber-800">
          <div className="flex items-center gap-3 font-semibold text-lg">
            <AlertTriangle className="h-5 w-5" />
            Unable to load your settings
          </div>
          <p className="text-sm">{error?.message || 'Something went wrong while loading your preferences. Please try again.'}</p>
          <div>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !user) {
    return (
      <div className="space-y-6">
        {[1, 2].map((key) => (
          <div key={key} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((inner) => (
              <div key={`${key}-${inner}`} className="animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm h-40" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6 items-start">
      <Card className="border border-slate-200 shadow-md sticky top-4 h-fit">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSectionNavigation(id)}
              className="w-full flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:-translate-y-0.5 active:scale-95 transition"
            >
              <span className="mt-0.5 inline-flex rounded-lg bg-blue-50 text-blue-700 border border-blue-100 p-2">
                <Icon className="h-4 w-4" />
              </span>
              <span className="space-y-0.5">
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-slate-600">{description}</p>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card id="account" className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-blue-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <User className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
                <p className="text-lg font-semibold text-slate-900">{user?.name || 'Sample User'}</p>
                <p className="text-sm text-slate-600">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                <p className="text-lg font-semibold text-slate-900">{user?.name || 'Sample User'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <p className="text-lg font-semibold text-slate-900">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Ma'aser percentage</h3>
              </div>
              <p className="text-sm text-slate-600">Select the percentage of income you set aside for ma'aser.</p>
              <div className="space-y-2">
                <Label htmlFor="maaser-percentage" className="text-sm font-medium">Preferred rate</Label>
                <Select
                  value={maaserPercentage.toString()}
                  onValueChange={handleMaaserPercentageChange}
                  disabled={isBusy}
                >
                  <SelectTrigger id="maaser-percentage" className="w-full text-base h-12 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="text-base">10%</SelectItem>
                    <SelectItem value="20" className="text-base">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Account linking</h3>
              </div>
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
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 transition shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="reset-data" className="border border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet2 className="h-6 w-6 text-blue-600" />
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
              disabled={resetDataMutation.isLoading || isLoading}
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
