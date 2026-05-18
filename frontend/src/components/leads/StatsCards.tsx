import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { LeadStats } from '../../types';
import { leadsApi } from '../../api/leads';

export const StatsCards = () => {
  const [stats, setStats] = useState<LeadStats | null>(null);

  useEffect(() => {
    leadsApi.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return null;

  const getCount = (key: string) =>
    stats.byStatus.find((s) => s._id === key)?.count ?? 0;

  const cards = [
    { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Qualified', value: getCount('Qualified'), icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Contacted', value: getCount('Contacted'), icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Lost', value: getCount('Lost'), icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
