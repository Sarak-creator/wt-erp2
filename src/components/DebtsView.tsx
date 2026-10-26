'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Customer } from '@/types/database';
import {
  CreditCard,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  RefreshCw,
  X,
  History,
} from 'lucide-react';

export default function DebtsView() {
  const { lang, customers, customerDebts, addDebtPayment, fetchFromSupabase, isSyncing } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const indebtedCustomers = customers.filter((c) => c.current_balance > 0);
  const totalDebt = indebtedCustomers.reduce((sum, c) => sum + c.current_balance, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer || paymentAmount <= 0) return;
    setIsPaying(true);

    await addDebtPayment(payingCustomer.id, Number(paymentAmount), paymentMethod, paymentNotes);

    setIsPaying(false);
    setPayingCustomer(null);
  };

  const filtered = indebtedCustomers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការគ្រប់គ្រងបំណុលអតិថិជន (A/R)' : 'Customer Debt & Accounts Receivable'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'តាមដានប្រាក់ជំពាក់របស់អតិថិជន និងកត់ត្រាការទារបំណុលចូលក្រុមហ៊ុន'
              : 'Monitor outstanding client debts, credit aging, and collect debt payments'}
          </p>
        </div>

        <button
          onClick={() => fetchFromSupabase()}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rose-600' : ''}`} />
          {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'បំណុលអតិថិជនសរុប' : 'Total Outstanding Debt'}
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {indebtedCustomers.length} {lang === 'km' ? 'អតិថិជនកំពុងជំពាក់' : 'customers with balance'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ការទារបំណុលបានជោគជ័យ' : 'Collections Recorded'}
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {customerDebts.filter((d) => d.type === 'payment').length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {lang === 'km' ? 'ប្រតិបត្តិការបង់ប្រាក់' : 'Payment transactions'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ស្ថានភាពឥណទាន' : 'Credit Health'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {customers.length > 0
              ? `${Math.round(((customers.length - indebtedCustomers.length) / customers.length) * 100)}%`
              : '100%'}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {lang === 'km' ? 'អតិថិជនគ្មានបំណុល' : 'Debt-free customer ratio'}
          </span>
        </div>
      </div>

      {/* Indebted Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <h2 className="font-bold text-slate-900 text-sm">
            {lang === 'km' ? 'បញ្ជីអតិថិជនជំពាក់ប្រាក់' : 'Indebted Customers'}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬទូរស័ព្ទ...' : 'Search name or phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">{lang === 'km' ? 'អតិថិជន' : 'Customer'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ដែនកំណត់ឥណទាន' : 'Credit Limit'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ចំនួនប្រាក់ជំពាក់' : 'Debt Balance'}</th>
                <th className="px-6 py-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    {c.business_name && (
                      <div className="text-xs text-slate-400">{c.business_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{c.phone}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    ${c.credit_limit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-600 text-base">
                    ${c.current_balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setPayingCustomer(c);
                        setPaymentAmount(c.current_balance);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      {lang === 'km' ? 'ទារបំណុល' : 'Collect Payment'}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                    {lang === 'km'
                      ? 'អស្ចារ្យ! មិនមានអតិថិជនជំពាក់ប្រាក់ទេ'
                      : 'Great! No outstanding customer debts'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Debt Payment Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {lang === 'km' ? 'កត់ត្រាការទូទាត់បំណុល' : 'Record Debt Payment'}
              </h2>
              <button
                onClick={() => setPayingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500 block">{lang === 'km' ? 'អតិថិជន:' : 'Customer:'}</span>
                <strong className="text-slate-900 text-sm">{payingCustomer.name}</strong>
                <div className="mt-1 flex justify-between text-slate-600">
                  <span>{lang === 'km' ? 'បំណុលបច្ចុប្បន្ន:' : 'Current Debt:'}</span>
                  <span className="font-bold text-rose-600">${payingCustomer.current_balance.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ចំនួនប្រាក់ត្រូវបង់ ($)' : 'Payment Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={payingCustomer.current_balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Cash (សាច់ប្រាក់សុទ្ធ)</option>
                  <option value="khqr">Bakong / KHQR</option>
                  <option value="bank_transfer">ABA / Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'កំណត់សម្គាល់' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Receipt #502"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPaying || paymentAmount <= 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isPaying ? 'Processing...' : lang === 'km' ? 'កត់ត្រាការទូទាត់' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
