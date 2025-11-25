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
    { name: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transactions', label: 'Transactions', icon: Receipt },
    { name: 'Donate', label: 'Donate', icon: CharityBoxIcon },
    { name: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.16),_transparent_45%),radial-gradient(circle_at_80%_0%,_rgba(59,130,246,0.14),_transparent_40%)]" aria-hidden />
      <div className="fixed inset-x-4 top-10 h-56 rounded-3xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-3xl opacity-70" aria-hidden />

      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/80 border-b border-white/60 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 group">
              <div
                className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg shadow-${theme.accent}/30 ring-1 ring-white/50 flex items-center justify-center text-white font-black transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95`}
              >
                M
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Ma'aser Tracker</p>
                <p className={`text-xl font-black text-${theme.accent} drop-shadow-sm`}>Clarity for your giving.</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 rounded-full bg-white/70 border border-white/60 shadow-md shadow-slate-900/5 px-1 py-1 backdrop-blur">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
                      isActive
                        ? `bg-${theme.muted} text-${theme.accent} border-${theme.accent}/40 shadow-inner shadow-${theme.accent}/20`
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-200 hover:bg-white'
                    } active:scale-95 hover:-translate-y-0.5`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? `text-${theme.accent}` : 'text-slate-500'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-white/0 via-white/40 to-white/0" aria-hidden />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative pt-10 pb-16">
        <div className="absolute inset-x-0 top-8 flex justify-center" aria-hidden>
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-white/25 to-white/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">{children}</div>
      </main>
    </div>
  );
}
