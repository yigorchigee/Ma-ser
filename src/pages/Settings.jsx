import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Percent, RotateCcw, Link2, User, LogOut, Landmark } from 'lucide-react';
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

  const accountProviders = [
    { name: 'Bank', icon: Landmark, description: 'Tap to link bank' },
    {
      name: 'Cash App',
      description: 'Tap to link Cash App',
      svg: {
        viewBox: '0 0 64 64',
        background: '#00C244',
        paths: [
          {
            d: 'M35 14h-6c-5.5 0-9 3.5-9 9v1.5h-3v5h3V36h-3v5h3V43c0 5.5 3.5 9 9 9h6v-5h-6c-2.3 0-3.7-1.4-3.7-3.6v-.4h7.7v-5h-7.7V29.5h7.7v-5h-7.7V23c0-2.2 1.4-3.6 3.7-3.6h6z',
            fill: '#fff',
          },
        ],
      },
    },
    {
      name: 'Venmo',
      description: 'Tap to link Venmo',
      svg: {
        viewBox: '0 0 64 64',
        background: '#3D95CE',
        paths: [
          {
            d: 'M40.6 12 35 40H25.4L19.3 12h8.2l1.5 13.6L34.4 12z',
            fill: '#fff',
          },
        ],
      },
    },
    {
      name: 'PayPal',
      description: 'Tap to link PayPal',
      svg: {
        viewBox: '0 0 64 64',
        background: '#fff',
        paths: [
          {
            d: 'M25 14h13c6.7 0 11 3.5 11 9.5 0 8.5-5.6 13-13.7 13H30.5l-1.8 10H21z',
            fill: '#003087',
          },
          {
            d: 'M27 16.5h10.5c4.3 0 7 2 7 5.5 0 5-4 8-9.2 8h-6l-1.1 6.6h-5.2z',
            fill: '#009cde',
          },
        ],
      },
    },
    {
      name: 'Zelle',
      description: 'Tap to link Zelle',
      svg: {
        viewBox: '0 0 64 64',
        background: '#6C1D8B',
        paths: [
          {
            d: 'M21 12h28l-14 17.5L49 47H21v-6h15.4L23.5 32l12.9-9H21z',
            fill: '#fff',
          },
        ],
      },
    },
    {
      name: 'Apple Pay',
      description: 'Tap to link Apple Pay',
      svg: {
        viewBox: '0 0 80 50',
        background: '#fff',
        paths: [
          {
            d: 'M52.545 12.616c0 .544-.15 1.089-.45 1.633-.3.53-.735.957-1.305 1.293-.57.336-1.185.504-1.83.504-.045-.6.105-1.2.45-1.781.345-.566.795-1.023 1.35-1.364.555-.341 1.13-.52 1.695-.57.045.399.045.8.09 1.285zm3.255 11.558c-.54 1.27-1.185 2.415-1.935 3.469-.99 1.468-1.8 2.475-2.43 3.034-.99.9-2.04.45-3.33.45-1.32 0-1.71.84-3.18-.45-.6-.435-1.44-1.35-2.52-2.744-1.08-1.41-1.965-3.032-2.655-4.865-.705-1.87-1.065-3.676-1.065-5.418 0-1.995.42-3.726 1.245-5.193.825-1.468 1.92-2.202 3.285-2.202.63 0 1.47.234 2.49.669 1.02.435 1.674.669 1.965.669.225 0 .885-.24 1.99-.72 0 0 1.32-.573 2.31-.573 1.71 0 3.09.687 4.14 2.058-1.65 1.002-2.47 2.401-2.47 4.196 0 1.4.525 2.567 1.575 3.519.465.444.99.8 1.575 1.047-.135.42-.285.809-.435 1.188z',
            fill: '#000',
          },
        ],
        text: {
          content: 'Pay',
          x: 38,
          y: 31,
          fill: '#000',
        },
      },
    },
  ];

  const renderProviderIcon = (provider) => {
    if (provider.svg) {
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 border border-slate-200">
          <svg
            aria-hidden
            focusable="false"
            role="img"
            viewBox={provider.svg.viewBox}
            className="h-7 w-7"
          >
            <rect
              width="100%"
              height="100%"
              rx="8"
              fill={provider.svg.background}
            />
            {provider.svg.paths.map((path, index) => (
              <path key={index} d={path.d} fill={path.fill} />
            ))}
            {provider.svg.text ? (
              <text
                x={provider.svg.text.x}
                y={provider.svg.text.y}
                fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
                fontWeight="700"
                fontSize="16"
                fill={provider.svg.text.fill}
              >
                {provider.svg.text.content}
              </text>
            ) : null}
          </svg>
        </span>
      );
    }

    const Icon = provider.icon;
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
        <Icon className="h-5 w-5" />
      </span>
    );
  };

  const sections = [
    { id: 'account', label: 'Account', description: "Profile, ma'aser, and connections", icon: User },
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
                {accountProviders.map((provider) => (
                  <button
                    key={provider.name}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:border-slate-400 hover:-translate-y-0.5 active:scale-95 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {renderProviderIcon(provider)}
                      <div>
                        <span className="block text-base font-semibold text-slate-900">{provider.name}</span>
                        <span className="block text-xs font-normal text-slate-500">{provider.description}</span>
                      </div>
                    </div>
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

      </div>
    </div>
  );
}
