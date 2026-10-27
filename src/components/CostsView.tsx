'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Expense } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Tag,
  RefreshCw,
  X,
  FileText,
  TrendingDown,
} from 'lucide-react';

export default function CostsView() {
  const { lang, expenses, addExpense, fetchFromSupabase, isSyncing } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState('utilities');
  const [amount, setAmount] = useState(50);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { id: 'utilities', label: lang === 'km' ? 'ទឹក / ភ្លើង / អគ្គិសនី' : 'Electricity & Utilities' },
    { id: 'maintenance', label: lang === 'km' ? 'ថែទាំម៉ាស៊ីនចម្រោះទឹក' : 'Water Filter Maintenance' },
    { id: 'fuel', label: lang === 'km' ? 'សាំង / ប្រេងឡានដឹក' : 'Vehicle Fuel' },
    { id: 'chemicals', label: lang === 'km' ? 'សារធាតុរ៉ែ / សម្អាត' : 'Water Minerals & Sanitation' },
    { id: 'payroll', label: lang === 'km' ? 'ប្រាក់ខែបុគ្គលិក' : 'Labor & Payroll' },
    { id: 'rent', label: lang === 'km' ? 'ថ្លៃជួលទីតាំង' : 'Facility Rent' },
    { id: 'other', label: lang === 'km' ? 'ចំណាយផ្សេងៗ' : 'Other Expenses' },
  ];

  const totalCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsSaving(true);

    const expenseNumber = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;

    await addExpense({
      expense_number: expenseNumber,
      category,
      amount: Number(amount),
      description: description.trim() || category || 'Operating expense',
      expense_date: expenseDate,
    });

    setIsSaving(false);
    setIsModalOpen(false);
    setDescription('');
    setAmount(50);
  };

  const filtered = expenses.filter((exp) => {
    const matchesCat = filterCategory === 'all' || exp.category === filterCategory;
    const matchesSearch =
      (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.expense_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការគ្រប់គ្រងចំណាយ & ថ្លៃដើម (Cost Accounting)' : 'Cost & Factory Expense Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'កត់ត្រាចំណាយប្រតិបត្តិការរោងចក្រ ថ្លៃអគ្គិសនី ប្តូរស្នូលចម្រោះ និងថ្លៃសាំងដឹកជញ្ជូន'
              : 'Track factory operating costs, filter replacements, electricity, and fleet maintenance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFromSupabase()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {lang === 'km' ? 'កត់ត្រាចំណាយថ្មី' : 'Record New Expense'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ចំណាយសរុបទាំងអស់' : 'Total Recorded Cost'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatKHR(totalCost)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {expenses.length} {lang === 'km' ? 'វិក្កយបត្រចំណាយ' : 'expense entries'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ប្រភេទចំណាយធំបំផុត' : 'Primary Cost Category'}
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">Utilities</div>
          <span className="text-xs text-slate-500 mt-1 block">
            Electricity & Reverse Osmosis power
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ស្ថានភាពថវិកា' : 'Budget Health'}
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Controlled</div>
          <span className="text-xs text-slate-500 mt-1 block">Within healthy unit COGS range</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកការចំណាយ...' : 'Search expense description or number...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'km' ? 'ប្រភេទទាំងអស់' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Ref #</th>
                <th className="px-6 py-4">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ប្រភេទចំណាយ' : 'Category'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'បរិយាយ' : 'Description'}</th>
                <th className="px-6 py-4 text-right">{lang === 'km' ? 'ចំនួនទឹកប្រាក់' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    {exp.expense_number}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {exp.expense_date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold capitalize border border-amber-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{exp.description}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 text-base">
                    <div>{formatKHR(exp.amount)}</div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    {lang === 'km' ? 'មិនមានទិន្នន័យចំណាយទេ' : 'No expenses recorded yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {lang === 'km' ? 'កត់ត្រាចំណាយថ្មី' : 'Record New Expense'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ប្រភេទចំណាយ' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    {lang === 'km' ? 'ចំនួនទឹកប្រាក់ (៛)' : 'Amount (៛)'}
                  </label>
                  <span className="text-xs font-bold text-amber-600">
                    {formatKHR(amount)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Expense Date'}
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'បរិយាយលម្អិត' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly electricity bill for RO Plant #1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || amount <= 0}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : lang === 'km' ? 'រក្សាទុក' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
