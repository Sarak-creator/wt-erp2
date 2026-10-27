'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShoppingCart, Package, Truck, Factory, DollarSign, Menu } from 'lucide-react';
import { UserRole } from '@/types/database';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function MobileNav({ currentTab, setCurrentTab }: MobileNavProps) {
  const { currentRole, lang, toggleMobileMenu, isMobileMenuOpen } = useAppStore();

  const isAccessible = (allowedRoles: UserRole[]) => allowedRoles.includes(currentRole);

  const tabs = [
    { id: 'pos', label: lang === 'km' ? 'លក់ POS' : 'POS', icon: ShoppingCart, allowed: ['admin', 'cashier', 'accountant'] as UserRole[] },
    { id: 'bottles', label: lang === 'km' ? 'ធុង ២០L' : 'Bottles', icon: Package, allowed: ['admin', 'cashier', 'accountant', 'inventory_manager'] as UserRole[] },
    { id: 'logistics', label: lang === 'km' ? 'ដឹកជញ្ជូន' : 'Dispatch', icon: Truck, allowed: ['admin', 'driver', 'inventory_manager'] as UserRole[] },
    { id: 'manufacturing', label: lang === 'km' ? 'ផលិតកម្ម' : 'Factory', icon: Factory, allowed: ['admin', 'inventory_manager'] as UserRole[] },
    { id: 'finance', label: lang === 'km' ? 'ហិរញ្ញវត្ថុ' : 'Finance', icon: DollarSign, allowed: ['admin', 'accountant'] as UserRole[] },
  ];

  const visibleTabs = tabs.filter((t) => isAccessible(t.allowed));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 min-h-[56px] border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 backdrop-blur-lg md:hidden justify-around items-center shadow-lg">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] text-[11px] font-bold transition-all active:scale-95 ${
              isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'stroke-[2.5] text-sky-600 dark:text-sky-400' : ''}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* All Modules / Hamburger Menu Button */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] text-[11px] font-bold transition-all active:scale-95 ${
          isMobileMenuOpen
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Menu className="h-5 w-5 mb-0.5" />
        <span>{lang === 'km' ? 'ម៉ឺនុយ' : 'Menu'}</span>
      </button>
    </nav>
  );
}
