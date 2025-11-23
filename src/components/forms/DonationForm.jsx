import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DonationForm({ charities, onSubmit, onCancel, maxAmount }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    charity_name: '',
    amount: '',
    notes: ''
  });

  const [customCharity, setCustomCharity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      charity_name: formData.charity_name === 'custom' ? customCharity : formData.charity_name,
      amount: parseFloat(formData.amount)
    });
  };

  const recommendedCharities = charities.filter(c => c.is_recommended);
  const otherCharities = charities.filter(c => !c.is_recommended);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Make a Donation</CardTitle>
        {maxAmount > 0 && (
          <p className="text-base text-gray-600 mt-2">
            Available ma'aser balance: <span className="font-bold text-green-600">${maxAmount.toFixed(2)}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-base font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="text-lg"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-base font-semibold">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                max={maxAmount}
                className="text-lg"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="charity" className="text-base font-semibold">Select Charity</Label>
            <Select value={formData.charity_name} onValueChange={(value) => setFormData({ ...formData, charity_name: value })}>
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Choose a charity" />
              </SelectTrigger>
              <SelectContent>
                {recommendedCharities.length > 0 && (
                  <>
                    <SelectItem disabled className="font-semibold text-blue-600">Recommended Charities</SelectItem>
                    {recommendedCharities.map(charity => (
                      <SelectItem key={charity.id} value={charity.name} className="text-base">
                        {charity.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                {otherCharities.length > 0 && (
                  <>
                    <SelectItem disabled className="font-semibold text-gray-600">Other Charities</SelectItem>
                    {otherCharities.map(charity => (
                      <SelectItem key={charity.id} value={charity.name} className="text-base">
                        {charity.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                <SelectItem value="custom" className="text-base font-semibold text-green-600">+ Add Custom Charity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.charity_name === 'custom' && (
            <div>
              <Label htmlFor="customCharity" className="text-base font-semibold">Custom Charity Name</Label>
              <Input
                id="customCharity"
                value={customCharity}
                onChange={(e) => setCustomCharity(e.target.value)}
                required
                className="text-lg"
                placeholder="Enter charity name"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-base font-semibold">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="text-lg"
              placeholder="Add any notes about this donation"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="text-lg px-6">
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-lg px-6">
              Record Donation
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
