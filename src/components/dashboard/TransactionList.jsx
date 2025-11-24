import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <p className="text-slate-600 text-center py-8">No transactions yet. Add your first transaction!</p>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-slate-900 text-lg truncate">{transaction.description}</h4>
                  {transaction.is_internal_transfer && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Internal Transfer
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {transaction.account} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-slate-900">${transaction.amount.toFixed(2)}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(transaction)}
                  className="hover:bg-indigo-100"
                >
                  <Edit2 className="h-4 w-4 text-indigo-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(transaction.id)}
                  className="hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
