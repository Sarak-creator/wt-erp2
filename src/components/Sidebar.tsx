'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { UserRole } from '@/types/database';
import {
  ShoppingCart,
  Package,
  Truck,
  Factory,
  BarChart3,
  Users,
  Boxes,
  Shield,
  CreditCard,
  Receipt,
  UserCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  BookOpen,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const {
    lang,
    currentRole,
    orders,
    inventory,
    customers,
    employees,
    purchases,
    customerDebts,
    expenses,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useAppStore();
  const t = translations[lang];

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto collapse sidebar when entering POS
  useEffect(() => {
    if (currentTab === 'pos') {
      setIsCollapsed(true);
    }
  }, [currentTab]);

  const isAccessible = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(currentRole);
  };

  const navItems = [
    {
      id: 'products',
      label: lang === 'km' ? 'ផលិតផល' : 'Products',
      icon: Package,
      allowed: ['admin', 'inventory_manager', 'cashier', 'accountant'] as UserRole[],
      badge: inventory.filter((i) => i.type === 'finished_good').length.toString(),
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'customers',
      label: lang === 'km' ? 'អតិថិជន' : 'Customers',
      icon: Users,
      allowed: ['admin', 'cashier', 'accountant', 'driver'] as UserRole[],
      badge: customers.length.toString(),
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'employers',
      label: lang === 'km' ? 'បុគ្គលិក / និយោជក' : 'Staff & Employees',
      icon: UserCheck,
      allowed: ['admin', 'accountant', 'manager' as any] as UserRole[],
      badge: employees.length.toString(),
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'inventory',
      label: lang === 'km' ? 'ឃ្លាំងស្តុក' : 'Stock Inventory',
      icon: Boxes,
      allowed: ['admin', 'inventory_manager'] as UserRole[],
      badge: inventory.length.toString(),
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'orders',
      label: lang === 'km' ? 'ការបញ្ជាទិញ' : 'Orders',
      icon: ShoppingCart,
      allowed: ['admin', 'cashier', 'accountant', 'driver'] as UserRole[],
      badge: orders.length.toString(),
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'pos',
      label: lang === 'km' ? 'កន្លែងគិតលុយ (POS)' : 'Point of Sale (POS)',
      icon: ShoppingCart,
      allowed: ['admin', 'cashier', 'accountant'] as UserRole[],
      badge: 'Touch',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'debts',
      label: lang === 'km' ? 'បំណុលអតិថិជន' : 'Debts & A/R',
      icon: CreditCard,
      allowed: ['admin', 'accountant', 'cashier'] as UserRole[],
      badge: customers.filter((c) => c.current_balance > 0).length.toString(),
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'costs',
      label: lang === 'km' ? 'ចំណាយប្រតិបត្តិការ' : 'Costs & Expenses',
      icon: Receipt,
      allowed: ['admin', 'accountant'] as UserRole[],
      badge: expenses.length.toString(),
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'purchases',
      label: lang === 'km' ? 'បញ្ជាទិញចូល (PO)' : 'Purchasing',
      icon: Truck,
      allowed: ['admin', 'inventory_manager', 'accountant'] as UserRole[],
      badge: purchases.length.toString(),
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'reports',
      label: lang === 'km' ? 'របាយការណ៍' : 'Reports & Analytics',
      icon: BarChart3,
      allowed: ['admin', 'accountant'] as UserRole[],
      badge: 'Live',
      badgeColor: 'bg-violet-100 text-violet-800',
    },
    {
      id: 'bottles',
      label: lang === 'km' ? 'ដប ២០លីត្រ' : '20L Bottles',
      icon: Package,
      allowed: ['admin', 'cashier', 'accountant', 'inventory_manager'] as UserRole[],
      badge: 'Ledger',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'manufacturing',
      label: lang === 'km' ? 'សង្វាក់ផលិតកម្ម' : 'Manufacturing',
      icon: Factory,
      allowed: ['admin', 'inventory_manager'] as UserRole[],
      badge: 'RO',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'logistics',
      label: lang === 'km' ? 'ចាត់ចែងដឹកជញ្ជូន' : 'Driver Dispatch',
      icon: Truck,
      allowed: ['admin', 'driver', 'inventory_manager'] as UserRole[],
      badge: 'Dispatch',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'finance',
      label: lang === 'km' ? 'ហិរញ្ញវត្ថុ & P&L' : 'Financial Dashboard',
      icon: DollarSign,
      allowed: ['admin', 'accountant'] as UserRole[],
      badge: 'P&L',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'settings',
      label: lang === 'km' ? 'ការកំណត់' : 'Settings',
      icon: Settings,
      allowed: ['admin'] as UserRole[],
      badge: 'Supabase',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'guide',
      label: lang === 'km' ? '📖 របៀបប្រើប្រាស់' : 'User Guide',
      icon: BookOpen,
      allowed: ['admin', 'cashier', 'driver', 'accountant', 'inventory_manager'] as UserRole[],
      badge: 'Manual',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar (Fixed & Independently Scrollable) */}
      <aside
        className={`${
          isCollapsed ? 'w-16 md:w-[72px]' : 'w-64'
        } border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 hidden md:flex h-full z-20 overflow-x-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Header & Collapse Toggle */}
          <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            {!isCollapsed ? (
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {lang === 'km' ? 'ម៉ូឌុលគ្រប់គ្រង' : 'Modules'}
              </div>
            ) : (
              <span className="w-1" />
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
              title={
                isCollapsed
                  ? lang === 'km'
                    ? 'ពង្រីក Sidebar'
                    : 'Expand Sidebar'
                  : lang === 'km'
                  ? 'បង្រួម Sidebar'
                  : 'Collapse Sidebar'
              }
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation Items (Smooth Independent Scroll - No Horizontal Scroll) */}
          <div className="p-2 space-y-1 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain">
            {navItems.map((item) => {
              if (!isAccessible(item.allowed)) return null;

              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all group overflow-hidden ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0 flex-1 overflow-hidden`}>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate block">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ml-1.5 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RBAC notice footer (Pinned at bottom) */}
        <div className="shrink-0">
          {isCollapsed ? (
            <div
              className="p-3 flex justify-center border-t border-slate-100 dark:border-slate-800"
              title={`RBAC Active: ${t.roles[currentRole]}`}
            >
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 m-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold mb-0.5">
                <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>RBAC Active</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {lang === 'km'
                  ? `តួនាទី: ${t.roles[currentRole]}`
                  : `Logged in as ${t.roles[currentRole]}`}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Slide-over Drawer Menu (< md) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-250">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">
                    ERP
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang === 'km' ? 'ម៉ឺនុយប្រព័ន្ធ ERP' : 'ERP System Menu'}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {lang === 'km' ? 'គ្រប់គ្រងម៉ូឌុលទាំងអស់' : 'All Enterprise Modules'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items in Drawer (Smooth Scroll - No Horizontal Scroll) */}
              <div className="p-3 space-y-1 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain">
                {navItems.map((item) => {
                  if (!isAccessible(item.allowed)) return null;

                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer RBAC Footer */}
            <div className="shrink-0 p-3 m-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold mb-0.5">
                <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>RBAC Active</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {lang === 'km'
                  ? `តួនាទី: ${t.roles[currentRole]}`
                  : `Role: ${t.roles[currentRole]}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
