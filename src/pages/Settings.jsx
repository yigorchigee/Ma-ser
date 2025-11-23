import React, { useState, useEffect } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Palette, Percent, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const [maaserPercentage, setMaaserPercentage] = useState(user?.maaser_percentage || 10);
  const [colorScheme, setColorScheme] = useState(user?.color_scheme || 'purple');

  const colorMap = {
    purple: 'purple-600',
    green: 'green-600',
    orange: 'orange-600',
    blue: 'blue-600',
    pink: 'pink-600',
    red: 'red-600'
  };

  useEffect(() => {
    if (user?.maaser_percentage) {
      setMaaserPercentage(user.maaser_percentage);
    }
    if (user?.color_scheme) {
      setColorScheme(user.color_scheme);
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

  const handleColorSchemeChange = (value) => {
    setColorScheme(value);
    updateSettingsMutation.mutate({ color_scheme: value });
  };

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      dataClient.reset();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Demo data reset. Fresh sample data loaded.');
    },
  });

  const colorSchemes = [
    { value: 'purple', label: 'Purple', gradient: 'from-purple-600 to-blue-600' },
    { value: 'green', label: 'Green', gradient: 'from-green-600 to-teal-600' },
    { value: 'orange', label: 'Orange', gradient: 'from-orange-600 to-red-600' },
    { value: 'blue', label: 'Blue', gradient: 'from-blue-600 to-cyan-600' },
    { value: 'pink', label: 'Pink', gradient: 'from-pink-600 to-purple-600' },
    { value: 'red', label: 'Red', gradient: 'from-red-600 to-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-xl text-gray-600">Customize your Ma'aser Tracker experience</p>
        </div>

        {/* Ma'aser Percentage Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Percent className={`h-6 w-6 text-${colorMap[colorScheme]}`} />
              Ma'aser Percentage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="maaser-percentage" className="text-lg">
                Select your ma'aser percentage:
              </Label>
              <Select value={maaserPercentage.toString()} onValueChange={handleMaaserPercentageChange}>
                <SelectTrigger id="maaser-percentage" className="w-full text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="text-lg">10%</SelectItem>
                  <SelectItem value="20" className="text-lg">20%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                This determines what percentage of your income should be set aside for ma'aser.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Color Scheme Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Palette className={`h-6 w-6 text-${colorMap[colorScheme]}`} />
              Color Scheme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="color-scheme" className="text-lg">
                Choose your preferred color theme:
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => handleColorSchemeChange(scheme.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      colorScheme === scheme.value
                        ? 'border-gray-900 shadow-lg'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-br ${scheme.gradient} mb-2`} />
                    <p className="text-center font-semibold">{scheme.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo data controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <RotateCcw className={`h-6 w-6 text-${colorMap[colorScheme]}`} />
              Reset Demo Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-gray-700">
              Clear your current local data and reload the seeded demo income, donations, and charities. Useful if you want a clean slate or to see the starter example values again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const confirmed = confirm('Reset demo data? This will remove your local entries and restore the starter examples.');
                if (confirmed) {
                  resetDataMutation.mutate();
                }
              }}
              className="flex items-center gap-2"
              disabled={resetDataMutation.isLoading}
            >
              <RotateCcw className="h-5 w-5" />
              {resetDataMutation.isLoading ? 'Resetting...' : 'Reset demo data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
