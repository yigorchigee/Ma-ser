import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Link2, Landmark, DollarSign, Wallet, Send, Apple } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthContext';
import { dataClient } from '@/api/dataClient';

const accountProviders = [
  { name: 'Bank', icon: Landmark, description: 'Tap to link bank' },
  { name: 'Cash App', icon: DollarSign, description: 'Tap to link cash app' },
  { name: 'Venmo', icon: Wallet, description: 'Tap to link venmo' },
  { name: 'PayPal', icon: Wallet, description: 'Tap to link paypal' },
  { name: 'Zelle', icon: Send, description: 'Tap to link zelle' },
  { name: 'Apple Pay', icon: Apple, description: 'Tap to link apple pay' },
];

export default function ConnectAccounts() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [selectedProviders, setSelectedProviders] = useState(user?.connected_banks || []);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSelectedProviders(user?.connected_banks || []);
  }, [user]);

  const toggleProvider = async (name) => {
    const exists = selectedProviders.includes(name);
    const nextProviders = exists
      ? selectedProviders.filter((provider) => provider !== name)
      : [...selectedProviders, name];

    setSelectedProviders(nextProviders);
    setIsUpdating(true);
    try {
      await dataClient.auth.updateMe({ connected_banks: nextProviders });
      await refreshSession();
      toast.success(`${name} ${exists ? 'disconnected' : 'linked'} successfully`);
    } catch (error) {
      toast.error(error.message || 'Unable to update connections.');
      setSelectedProviders(selectedProviders);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <Card className="border border-slate-200 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Link2 className="h-6 w-6" />
              </span>
              Connect your banks now
            </CardTitle>
            <p className="text-slate-600 text-base">
              Pick the accounts you want to link so transactions stay in sync from day one. You can update these later in
              settings.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accountProviders.map(({ name, icon: Icon, description }) => {
                const isSelected = selectedProviders.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => toggleProvider(name)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isSelected ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                          isSelected ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="block text-base font-semibold">{name}</span>
                        <span className="block text-xs font-normal text-slate-500">
                          {isSelected ? 'Connected' : description}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <Button
                type="button"
                onClick={() => navigate('/create-pin', { replace: true, state: { from: '/connect-accounts' } })}
                className="rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm px-4 py-2 hover:-translate-y-0.5 active:scale-95"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95"
              >
                Go to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
