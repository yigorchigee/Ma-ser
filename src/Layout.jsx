import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Receipt, Settings } from 'lucide-react';
import { dataClient } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import CharityBoxIcon from './components/icons/CharityBoxIcon';

const themeMap = {
  purple: {
    accent: 'purple-600',
    gradient: 'from-purple-600 via-indigo-500 to-blue-500',
    muted: 'purple-50',
  },
  green: {
    accent: 'emerald-600',
    gradient: 'from-emerald-600 via-green-500 to-teal-500',
    muted: 'emerald-50',
  },
  orange: {
    accent: 'orange-600',
    gradient: 'from-orange-600 via-amber-500 to-rose-500',
    muted: 'orange-50',
  },
  blue: {
    accent: 'blue-600',
    gradient: 'from-blue-600 via-cyan-500 to-sky-500',
    muted: 'blue-50',
  },
  pink: {
    accent: 'pink-600',
    gradient: 'from-pink-600 via-fuchsia-500 to-purple-500',
    muted: 'pink-50',
  },
  red: {
    accent: 'rose-600',
    gradient: 'from-rose-600 via-red-500 to-orange-500',
    muted: 'rose-50',
  },
};

export default function Layout({ children, currentPageName }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => dataClient.auth.me(),
  });

  const theme = themeMap[user?.color_scheme] || themeMap.purple;

  const navItems = [
    { name: 'MaaserTracker', label: "Overview", icon: LayoutDashboard },
    { name: 'Transactions', label: 'Activity', icon: Receipt },
    { name: 'Donate', label: 'Give', icon: CharityBoxIcon },
    { name: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="fixed inset-0 bg-gradient-to-br from-white via-white to-slate-50" aria-hidden />
      <div className="fixed inset-x-6 top-10 h-72 rounded-3xl bg-gradient-to-br opacity-30 blur-3xl pointer-events-none" style={{ backgroundImage: 'linear-gradient(120deg, rgba(99,102,241,0.35), rgba(56,189,248,0.35))' }} aria-hidden />

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-slate-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg flex items-center justify-center text-white font-black`}>
                M
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Ma'aser Tracker</p>
                <p className={`text-xl font-bold text-${theme.accent}`}>Give with clarity.</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`group relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border border-transparent ${
                      isActive
                        ? `bg-${theme.muted} text-${theme.accent} border-${theme.accent}`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? `text-${theme.accent}` : 'text-slate-500'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
