'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { UserRole } from '@/types/database';
import CustomSelect from '@/components/ui/CustomSelect';
import {
  Droplet,
  Languages,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
  setCurrentTab?: (tab: string) => void;
}

export default function Header({ currentTab, setCurrentTab }: HeaderProps = {}) {
  const {
    lang,
    setLang,
    theme,
    toggleTheme,
    currentRole,
    setCurrentRole,
    toggleMobileMenu,
  } = useAppStore();

  const t = translations[lang];

  const roles: { role: UserRole; label: string }[] = [
    { role: 'admin', label: t.roles.admin },
    { role: 'cashier', label: t.roles.cashier },
    { role: 'driver', label: t.roles.driver },
    { role: 'accountant', label: t.roles.accountant },
    { role: 'inventory_manager', label: t.roles.inventory_manager },
  ];

  return (
    <header className="shrink-0 sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2.5 sm:px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Factory Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={lang === 'km' ? 'បើកម៉ឺនុយ' : 'Open Menu'}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-blue-500/20 text-white">
          <Droplet className="h-4 w-4 sm:h-6 sm:w-6 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-lg truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {lang === 'km' ? 'សហគ្រាសទឹកបរិសុទ្ធ ខ្មែរ អង្គរ' : 'Khmer Angkor Pure Water ERP'}
            </span>
            <span className="hidden sm:inline rounded-full bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
              PWA v2.4
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate">
            {t.tagline}
          </p>
        </div>
      </div>

      {/* Right Controls: Role Switcher & Language Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Role Simulator Selector */}
        <div className="max-w-[110px] sm:max-w-[140px] md:max-w-none">
          <CustomSelect
            value={currentRole}
            onChange={(val) => setCurrentRole(val as UserRole)}
            options={roles.map((r) => ({
              value: r.role,
              label: r.label,
              badge: r.role.toUpperCase(),
              badgeColor:
                r.role === 'admin'
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : r.role === 'cashier'
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : r.role === 'driver'
                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                  : r.role === 'accountant'
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
            }))}
            icon={ShieldCheck}
            size="sm"
            buttonClassName="h-7 sm:h-8 px-2 text-xs rounded-lg border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Master User Guide Launcher Button */}
        {setCurrentTab && (
          <button
            onClick={() => setCurrentTab('guide')}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold transition-all shadow-sm h-7 sm:h-8 ${
              currentTab === 'guide'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={lang === 'km' ? 'សៀវភៅណែនាំប្រើប្រាស់ App ទាំងមូល' : 'Master App User Guide'}
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">{lang === 'km' ? 'របៀបប្រើប្រាស់' : 'Guide'}</span>
          </button>
        )}


        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'km' ? 'en' : 'km')}
          className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm h-7 sm:h-8"
          title="Toggle Language"
        >
          <Languages className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">{lang === 'km' ? 'English' : 'ភាសាខ្មែរ'}</span>
          <span className="sm:hidden text-[11px] font-bold">{lang === 'km' ? 'EN' : 'ខ្មែរ'}</span>
        </button>

        {/* Theme Toggle (Dark / Light Mode) */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm h-7 sm:h-8"
          title={
            lang === 'km'
              ? theme === 'dark'
                ? 'ប្ដូរទៅពន្លឺ (Light Mode)'
                : 'ប្ដូរទៅងងឹត (Dark Mode)'
              : theme === 'dark'
              ? 'Switch to Light Mode'
              : 'Switch to Dark Mode'
          }
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden md:inline">{lang === 'km' ? 'ពន្លឺ' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 fill-slate-200" />
              <span className="hidden md:inline">{lang === 'km' ? 'ងងឹត' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-sm">
          {currentRole[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
