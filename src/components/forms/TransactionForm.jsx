import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    transaction || {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      integration_provider: '',
      account: '',
      is_internal_transfer: false,
      category: '',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
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
                className="text-lg"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="text-lg"
              placeholder="Enter transaction description"
            />
          </div>

          <div>
            <Label htmlFor="integration_provider" className="text-base font-semibold">Bank or app name</Label>
            <Input
              id="integration_provider"
              value={formData.integration_provider || ''}
              onChange={(e) => setFormData({ ...formData, integration_provider: e.target.value })}
              className="text-lg"
              placeholder="e.g., Chase, Wells Fargo, PayPal"
            />
          </div>

          <div>
            <Label htmlFor="account" className="text-base font-semibold">Account</Label>
            <Input
              id="account"
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              required
              className="text-lg"
              placeholder="e.g., Main Checking"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-base font-semibold">Category (Optional)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="text-lg"
              placeholder="e.g., Salary, Freelance"
            />
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <Switch
              id="internal"
              checked={formData.is_internal_transfer}
              onCheckedChange={(checked) => setFormData({ ...formData, is_internal_transfer: checked })}
            />
            <Label htmlFor="internal" className="text-base font-semibold cursor-pointer">
              Internal Transfer (exclude from ma'aser calculation)
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="text-lg px-6">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-lg px-6">
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
