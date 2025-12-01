import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Receipt, Settings } from 'lucide-react';
import CharityBoxIcon from './components/icons/CharityBoxIcon';
import TzedakaLogo from './components/icons/TzedakaLogo';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transactions', label: 'Transactions', icon: Receipt },
    { name: 'Donate', label: 'Donate', icon: CharityBoxIcon },
    { name: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50" aria-hidden />
      <div
        className="fixed inset-x-6 top-4 h-64 rounded-3xl bg-gradient-to-r opacity-40 blur-3xl pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(120deg, rgba(37,99,235,0.35), rgba(16,185,129,0.32))' }}
        aria-hidden
      />

      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <TzedakaLogo className="h-16 md:h-20 w-auto max-w-[16rem] shrink-0 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95" />
            </Link>

            <nav className="flex items-center gap-2 rounded-full bg-white/70 border border-white/60 shadow-md shadow-slate-900/5 px-1 py-1 backdrop-blur">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border shadow-sm hover:shadow ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-600'
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-200 hover:bg-white'
                    } active:scale-95 hover:-translate-y-0.5`}
                  >
                    <Icon
                      className={`${item.name === 'Donate' ? 'h-5 w-5' : 'h-4 w-4'} ${
                        isActive ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    />
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-white/0 via-white/40 to-white/0" aria-hidden />
                  </Link>
                );
              })}
            </nav>

            <div />
          </div>
        </div>
      </header>

      <main className="relative pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
