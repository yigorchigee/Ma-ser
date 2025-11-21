import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Receipt, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CharityBoxIcon from './components/icons/CharityBoxIcon';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'MaaserTracker', label: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transactions', label: 'Transactions', icon: Receipt },
    { name: 'Donate', label: 'Donate', icon: CharityBoxIcon },
    { name: 'Settings', label: 'Settings', icon: Settings }
  ];

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
  });

  const colorScheme = user?.color_scheme || 'purple';

  const colorMap = {
    purple: {
      primary: 'purple-600',
      hover: 'purple-100',
      border: 'purple-600'
    },
    green: {
      primary: 'green-600',
      hover: 'green-100',
      border: 'green-600'
    },
    orange: {
      primary: 'orange-600',
      hover: 'orange-100',
      border: 'orange-600'
    },
    blue: {
      primary: 'blue-600',
      hover: 'blue-100',
      border: 'blue-600'
    },
    pink: {
      primary: 'pink-600',
      hover: 'pink-100',
      border: 'pink-600'
    },
    red: {
      primary: 'red-600',
      hover: 'red-100',
      border: 'red-600'
    }
  };

  const colors = colorMap[colorScheme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className={`bg-white shadow-lg border-b-4 border-${colors.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-lg p-1 shadow-sm">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69168b31a1c7548829035f39/f0d741e3d_MeiserLogo.png" 
                  alt="Ma'aser Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className={`text-2xl md:text-3xl font-bold text-${colors.primary}`}>Ma'aser Tracker</h1>
            </div>
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold text-base md:text-lg transition-all ${
                      isActive
                        ? `bg-${colors.primary} text-white shadow-lg`
                        : `text-gray-700 hover:bg-${colors.hover}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
