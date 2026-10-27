'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

import ProductsView from '@/components/ProductsView';
import CustomersView from '@/components/CustomersView';
import EmployeesView from '@/components/EmployeesView';
import StockInventoryView from '@/components/StockInventoryView';
import OrdersView from '@/components/OrdersView';
import DebtsView from '@/components/DebtsView';
import CostsView from '@/components/CostsView';
import PurchasesView from '@/components/PurchasesView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';

import PosView from '@/components/PosView';
import BottleLedgerView from '@/components/BottleLedgerView';
import DriverDispatchView from '@/components/DriverDispatchView';
import FinancialDashboardView from '@/components/FinancialDashboardView';
import ManufacturingView from '@/components/ManufacturingView';

import { useAppStore } from '@/lib/store';

export default function Home() {
  const { currentRole, fetchFromSupabase, setTheme } = useAppStore();
  const [currentTab, setCurrentTab] = useState<string>('products');

  // Initialize theme from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_preference') as 'light' | 'dark' | null;
      if (saved) {
        setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    }
  }, [setTheme]);

  // Fetch live data directly from Supabase on mount
  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // Adjust default tab when switching role
  useEffect(() => {
    if (currentRole === 'driver') {
      setCurrentTab('orders');
    } else if (currentRole === 'accountant') {
      setCurrentTab('debts');
    } else if (currentRole === 'inventory_manager') {
      setCurrentTab('inventory');
    } else if (currentRole === 'cashier') {
      setCurrentTab('pos');
    }
  }, [currentRole]);

  return (
    <div className="flex min-h-screen md:h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-16 md:pb-0 md:overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto min-h-0 min-w-0">
          {currentTab === 'products' && <ProductsView />}
          {currentTab === 'customers' && <CustomersView />}
          {currentTab === 'employers' && <EmployeesView />}
          {currentTab === 'inventory' && <StockInventoryView />}
          {currentTab === 'orders' && <OrdersView />}
          {currentTab === 'pos' && <PosView />}
          {currentTab === 'debts' && <DebtsView />}
          {currentTab === 'costs' && <CostsView />}
          {currentTab === 'purchases' && <PurchasesView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'settings' && <SettingsView />}
          {currentTab === 'bottles' && <BottleLedgerView />}
          {currentTab === 'manufacturing' && <ManufacturingView />}
          {currentTab === 'logistics' && <DriverDispatchView />}
          {currentTab === 'finance' && <FinancialDashboardView />}
        </main>
      </div>

      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}
