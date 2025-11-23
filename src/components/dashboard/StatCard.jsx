import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, colorClass = "text-blue-600" }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">${value.toFixed(2)}</div>
        {trend && (
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
            {trend > 0 ? <ArrowUpCircle className="h-4 w-4 text-green-600" /> : <ArrowDownCircle className="h-4 w-4 text-red-600" />}
            {Math.abs(trend)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
