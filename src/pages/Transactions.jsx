import React, { useState } from 'react';
import { dataClient } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, List, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { formatCounterparty } from '@/utils';
import CharityBoxIcon from '../components/icons/CharityBoxIcon';

export default function Transactions() {
  const [view, setView] = useState('all');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => dataClient.entities.Transaction.list('-date'),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => dataClient.entities.Donation.list('-date'),
  });

  const allItems = [
    ...transactions.map((t) => ({ ...t, type: 'income' })),
    ...donations.map((d) => ({ ...d, type: 'donation' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredItems =
    view === 'all'
      ? allItems
      : view === 'income'
        ? allItems.filter((item) => item.type === 'income')
        : allItems.filter((item) => item.type === 'donation');

  return (
    <div className="space-y-8">
      <LedgerCard
        title="Activity feed"
        view={view}
        onViewChange={setView}
        items={filteredItems}
      />
    </div>
  );
}

function LedgerCard({ title, items, view, onViewChange }) {
  return (
    <Card className="border border-slate-200 shadow-xl shadow-slate-900/5">
      <CardHeader className="pb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <div className="w-full sm:w-64">
          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="w-full h-11 text-sm font-semibold bg-white border-slate-200 text-slate-900 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="All activity" />
            </SelectTrigger>
            <SelectContent className="text-slate-900 bg-white shadow-lg border border-slate-200">
              <SelectItem
                value="all"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  All
                </div>
              </SelectItem>
              <SelectItem
                value="income"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Income
                </div>
              </SelectItem>
              <SelectItem
                value="donations"
                className="text-base text-slate-900 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <CharityBoxIcon className="h-5 w-5" />
                  Ma'aser Payments
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-600 text-center py-10">No transactions yet</p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-4 rounded-xl border transition hover:-translate-y-0.5 hover:shadow bg-white border-slate-200"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.type === 'income' ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <CharityBoxIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-900 text-lg truncate">
                      {formatCounterparty(item)}
                    </h4>
                    <Badge className={item.type === 'income' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}>
                      {item.type === 'income' ? 'Income' : "Ma'aser Payment"}
                    </Badge>
                    {item.is_internal_transfer && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Internal Transfer
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    {item.type === 'income' ? (
                      <>
                        <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                          Source: {item.integration_provider || item.account || 'Manual entry'}
                        </Badge>
                        {item.account && (
                          <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                            Account: {item.account}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                        To: {item.charity_name || item.description || 'Recipient'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {item.type === 'income' && item.account ? `${item.account} • ` : ''}
                    {format(new Date(item.date), 'MMMM dd, yyyy')}
                  </p>
                  {(() => {
                    const noteCandidate = item.type === 'donation' ? item.notes || item.note : item.notes;
                    const normalized = typeof noteCandidate === 'string' ? noteCandidate.trim() : '';

                    if (!normalized || normalized.toLowerCase() === 'weekly giving') {
                      return null;
                    }

                    return <p className="text-sm text-slate-500 truncate">{normalized}</p>;
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">${item.amount.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
