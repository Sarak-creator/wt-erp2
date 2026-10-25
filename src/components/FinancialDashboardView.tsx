'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { formatUSD, formatKHR } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Plus,
  X,
  Upload,
  CheckCircle2,
  Calendar,
  Truck,
  Fuel,
  Wrench,
  Lightbulb,
} from 'lucide-react';

export default function FinancialDashboardView() {
  const { lang, customers, orders, inventory, expenses, addExpense } = useAppStore();
  const t = translations[lang];

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('ភ្លើង & ថាមពល');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Accounts Receivable (A/R) Aging calculations
  const totalReceivables = customers.reduce((acc, c) => acc + c.current_balance, 0);

  // Simulated Aging brackets for Cambodian water distributor credit terms
  const current30Days = totalReceivables * 0.62; // 62% current
  const aging31to60 = totalReceivables * 0.25; // 25% 31-60 days
  const overdueOver60 = totalReceivables * 0.13; // 13% high risk overdue

  // Customers exceeding or near credit limit
  const highRiskCustomers = customers.filter(
    (c) => c.current_balance >= c.credit_limit * 0.9
  );

  // Delivered Orders & KPI calculations
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const todayRevenue = deliveredOrders.reduce((acc, o) => acc + o.paid_amount, 0);

  // Total Gallons Delivered (today & lifetime)
  const totalGallonsDelivered = deliveredOrders.reduce(
    (acc, o) => acc + (o.bottles_delivered || 0),
    0
  );

  // Actual Cash in Drawer (Cash + Paid KHQR)
  const actualCashInDrawer = deliveredOrders
    .filter((o) => o.payment_method === 'cash')
    .reduce((acc, o) => acc + o.paid_amount, 0) + 120.0; // $120 petty cash opening float

  const monthlyEstRevenue = 14850.0;
  const estimatedCogs = 5820.0; // 39.2% COGS (Water treatment, caps, electricity, labor)
  const monthlyExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0) + 2850.0;
  const netProfit = monthlyEstRevenue - estimatedCogs - monthlyExpenses;
  const netMarginPercent = ((netProfit / monthlyEstRevenue) * 100).toFixed(1);

  // Unit Cost breakdown for 1x 20L Gallon Water
  const unitCostBreakdown = [
    { name: lang === 'km' ? 'អគ្គិសនី & ចម្រោះ RO' : 'Electricity & RO Treatment', cost: 0.14, pct: 31 },
    { name: lang === 'km' ? 'គម្រប & ស្កុតកម្ដៅ' : 'Cap & Heat Shrink Seal', cost: 0.055, pct: 12 },
    { name: lang === 'km' ? 'ពលកម្មផលិតកម្ម' : 'Direct Production Labor', cost: 0.12, pct: 27 },
    { name: lang === 'km' ? 'ការរំលោះសំបកធុង' : 'Bottle Wear & Tear Depreciation', cost: 0.08, pct: 18 },
    { name: lang === 'km' ? 'ទឹកប្រភពដើម & សារធាតុរ៉ែ' : 'Raw Water & Minerals', cost: 0.055, pct: 12 },
  ];

  const totalCogsPerGallon = unitCostBreakdown.reduce((acc, item) => acc + item.cost, 0);

  // Monthly Sales Trend Data (Last 6 Months)
  const salesTrend = [
    { month: lang === 'km' ? 'ឧសភា' : 'May', sales: 11200, gallons: 9400 },
    { month: lang === 'km' ? 'មិថុនា' : 'Jun', sales: 12800, gallons: 10600 },
    { month: lang === 'km' ? 'កក្កដា' : 'Jul', sales: 13400, gallons: 11200 },
    { month: lang === 'km' ? 'សីហា' : 'Aug', sales: 14100, gallons: 11900 },
    { month: lang === 'km' ? 'កញ្ញា' : 'Sep', sales: 13900, gallons: 11700 },
    { month: lang === 'km' ? 'តុលា (បច្ចុប្បន្ន)' : 'Oct (Current)', sales: 14850, gallons: 12450 },
  ];

  // Top Delivery Routes Ranking
  const topRoutes = [
    { zone: lang === 'km' ? 'តំបន់ ១: បឹងកេងកង & ចំការមន' : 'Zone 1: BKK & Chamkarmon', bottles: 4850, revenue: 5820, pct: 39, color: 'bg-sky-500' },
    { zone: lang === 'km' ? 'តំបន់ ២: ទួលគោក & បឹងកក់' : 'Zone 2: Toul Kork & Boeung Kak', bottles: 3920, revenue: 4700, pct: 31, color: 'bg-emerald-500' },
    { zone: lang === 'km' ? 'តំបន់ ៣: ច្បារអំពៅ & ផ្លូវជាតិលេខ១' : 'Zone 3: Chbar Ampov & NR1', bottles: 2450, revenue: 2940, pct: 20, color: 'bg-indigo-500' },
    { zone: lang === 'km' ? 'តំបន់ ៤: សែនសុខ & ទឹកថ្លា' : 'Zone 4: Sen Sok & Teuk Thla', bottles: 1230, revenue: 1476, pct: 10, color: 'bg-amber-500' },
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    const newExp = {
      id: 'exp-' + Date.now(),
      expense_number: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      category: expenseCategory,
      amount: Number(expenseAmount),
      description: expenseDescription || expenseCategory,
      receipt_url: expenseReceiptUrl || undefined,
      expense_date: expenseDate,
      created_at: new Date().toISOString(),
    };

    addExpense(newExp);
    setShowExpenseModal(false);
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseReceiptUrl('');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-sky-600" />
            {t.finance.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {lang === 'km'
              ? 'របាយការណ៍ហិរញ្ញវត្ថុ តុល្យភាពបំណុល លំហូរសាច់ប្រាក់ និងថ្លៃដើមផលិតកម្ម'
              : 'Executive clarity: daily revenues, accounts receivable, bottle volume & cash in drawer'}
          </p>
        </div>

        {/* Primary Action Button: + ចំណាយថ្មី (Add Expense) */}
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-xs md:text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{lang === 'km' ? '+ ចំណាយថ្មី' : '+ New Expense'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {isSuccessToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="font-bold">
            {lang === 'km' ? 'បានកត់ត្រាការចំណាយដោយជោគជ័យ!' : 'Expense recorded successfully!'}
          </span>
        </div>
      )}

      {/* 4 PRIMARY STAT CARDS AS SPECIFIED IN MASTER PROMPT 3.D */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ចំណូលថ្ងៃនេះ (Today's Revenue) */}
        <MetricCard
          title={lang === 'km' ? 'ចំណូលថ្ងៃនេះ' : "Today's Revenue"}
          value={formatUSD(todayRevenue)}
          subValue={`≈ ${formatKHR(todayRevenue)}`}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          change={{
            value: '+12.5%',
            trend: 'up',
            label: lang === 'km' ? 'ធៀបម្សិលមិញ' : 'vs yesterday',
          }}
          highlight={true}
          badge="Today"
          badgeColor="bg-emerald-50 text-emerald-700"
        />

        {/* 2. ទឹកប្រាក់ត្រូវទារ (Pending Receivables / A/R) */}
        <MetricCard
          title={lang === 'km' ? 'ទឹកប្រាក់ត្រូវទារ (A/R)' : 'Pending Receivables'}
          value={formatUSD(totalReceivables)}
          subValue={`${customers.filter((c) => c.current_balance > 0).length} ${lang === 'km' ? 'អតិថិជនជំពាក់' : 'debtors'}`}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          change={{
            value: formatUSD(overdueOver60),
            trend: 'down',
            label: lang === 'km' ? 'ហានិភ័យ > ៦០ថ្ងៃ' : 'overdue > 60d',
          }}
          badge={lang === 'km' ? 'ឥណទាន' : 'Credit'}
          badgeColor="bg-amber-50 text-amber-700"
        />

        {/* 3. ធុងទឹកដឹកចេញសរុប (Total Gallons Delivered) */}
        <MetricCard
          title={lang === 'km' ? 'ធុងទឹកដឹកចេញសរុប' : 'Total Gallons Delivered'}
          value={`${totalGallonsDelivered} ធុង`}
          subValue={lang === 'km' ? 'ធុង ២០លីត្រ' : '20L Gallons'}
          icon={Truck}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-100"
          change={{
            value: '+85 ធុង',
            trend: 'up',
            label: lang === 'km' ? 'ថ្ងៃនេះ' : 'dispatched today',
          }}
          badge="Volume"
          badgeColor="bg-sky-50 text-sky-700"
        />

        {/* 4. លំហូរសាច់ប្រាក់ជាក់ស្តែង (Actual Cash in Drawer) */}
        <MetricCard
          title={lang === 'km' ? 'សាច់ប្រាក់ក្នុងថត' : 'Actual Cash in Drawer'}
          value={formatUSD(actualCashInDrawer)}
          subValue={`+ $120 Float`}
          icon={Wallet}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{
            value: 'Verified',
            trend: 'neutral',
            label: lang === 'km' ? 'ផ្ទៀងផ្ទាត់រួច' : 'Drawer reconciled',
          }}
          badge="Cash Float"
          badgeColor="bg-blue-50 text-blue-700"
        />
      </div>

      {/* MINIMAL CHARTS SECTION: Monthly Sales Trend & Top Delivery Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Sales Trend Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sky-600" />
                {lang === 'km' ? 'និន្នាការលក់ប្រចាំខែ (Monthly Sales Trend)' : 'Monthly Sales Trend (Last 6 Months)'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'km'
                  ? 'ស្ថិតិប្រាក់ចំណូល និងបរិមាណធុងទឹកដែលបានចែកចាយ'
                  : 'Total revenue and 20L bottle volume per calendar month'}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {formatUSD(monthlyEstRevenue)} (Oct)
            </span>
          </div>

          {/* Clean High-Resolution SVG Bar/Area Chart */}
          <div className="pt-2">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 pb-2">
              {salesTrend.map((item, idx) => {
                const maxVal = 16000;
                const heightPct = Math.round((item.sales / maxVal) * 100);
                const isCurrent = idx === salesTrend.length - 1;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatUSD(item.sales)}
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl relative overflow-hidden flex flex-col justify-end" style={{ height: '80%' }}>
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-md shadow-sky-500/20'
                            : 'bg-slate-300 group-hover:bg-sky-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold truncate max-w-full text-center ${isCurrent ? 'text-sky-700' : 'text-slate-500'}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 font-medium">
              <span>Min: $11,200</span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 inline-block"></span>
                {lang === 'km' ? 'ចំណូលលក់ទឹក' : 'Pure Water Revenue'}
              </span>
              <span>Max: $14,850</span>
            </div>
          </div>
        </div>

        {/* Right: Top Delivery Routes (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              {lang === 'km' ? 'ចំណាត់ថ្នាក់ផ្លូវដឹកជញ្ជូន (Top Routes)' : 'Top Delivery Routes Ranking'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'km'
                ? 'តំបន់ដែលចែកចាយទឹកច្រើនជាងគេប្រចាំខែ'
                : 'Top delivery zones by gallon volume & customer demand'}
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {topRoutes.map((route, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">
                    {route.zone}
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-black text-slate-900">{formatUSD(route.revenue)}</span>
                    <span className="text-[11px] text-slate-400">({route.bottles} ធុង)</span>
                  </div>
                </div>
                {/* Minimal Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${route.color} transition-all duration-500`}
                    style={{ width: `${route.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-xs flex justify-between items-center text-slate-600 mt-2">
            <span>{lang === 'km' ? 'បរិមាណចែកចាយសរុប:' : 'Total Route Gallons:'}</span>
            <span className="font-black text-slate-900 tabular-nums">12,450 ធុង</span>
          </div>
        </div>
      </div>

      {/* RECENT EXPENSES TABLE & LOGS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <Receipt className="h-5 w-5 text-rose-500" />
              {lang === 'km' ? 'កំណត់ត្រាចំណាយប្រតិបត្តិការ (Operating Expenses)' : 'Recent Operating Expenses'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'km'
                ? 'ថ្លៃភ្លើង ប្រេងឥន្ធនៈ គ្រឿងបន្លាស់ និងជួសជុលម៉ាស៊ីនចម្រោះ'
                : 'Electricity, fuel, filter media maintenance, and replacement spare parts'}
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'km' ? 'បន្ថែមចំណាយ' : 'Add Expense'}
          </button>
        </div>

        {/* Expenses List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5 rounded-l-xl">កាលបរិច្ឆេទ (Date)</th>
                <th className="px-3 py-2.5">លេខប័ណ្ណ</th>
                <th className="px-3 py-2.5">ប្រភេទចំណាយ (Category)</th>
                <th className="px-3 py-2.5">បរិយាយ (Description)</th>
                <th className="px-3 py-2.5 text-right rounded-r-xl">ទឹកប្រាក់ (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-3 text-slate-500 tabular-nums font-medium">
                    {exp.expense_date}
                  </td>
                  <td className="px-3 py-3 font-mono font-bold text-slate-800">
                    {exp.expense_number}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600 max-w-xs truncate">
                    {exp.description}
                  </td>
                  <td className="px-3 py-3 text-right font-black text-rose-600 tabular-nums">
                    -{formatUSD(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SIMPLIFIED EXPENSE LOGGER (+ ចំណាយថ្មី) */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-100 text-slate-800">
            {/* Close Button */}
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-sky-600" />
              {lang === 'km' ? 'កត់ត្រាការចំណាយថ្មី' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'km'
                ? 'បញ្ចូលទឹកប្រាក់ ប្រភេទចំណាយ និងរូបថតវិក្កយបត្រ (ភ្លើង, ប្រេង, ថ្លៃជួសជុល)'
                : 'Input expense amount, operational category, and upload receipt proof'}
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-4">
              {/* Amount Input (Large & Clear) */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {lang === 'km' ? 'ទឹកប្រាក់ចំណាយ (Amount in USD) *' : 'Expense Amount ($) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-lg font-black text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) =>
                      setExpenseAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2.5 text-xl font-black text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 tabular-nums"
                  />
                </div>
              </div>

              {/* Category Quick Select */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  {lang === 'km' ? 'ប្រភេទចំណាយ (Category) *' : 'Category *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'ភ្លើង & ថាមពល', icon: Lightbulb },
                    { label: 'ប្រេងឥន្ធនៈ', icon: Fuel },
                    { label: 'ថ្លៃជួសជុល', icon: Wrench },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setExpenseCategory(cat.label)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        expenseCategory === cat.label
                          ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-xs ring-1 ring-sky-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <cat.icon className="h-4 w-4 mb-1" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {lang === 'km' ? 'បរិយាយលម្អិត' : 'Description / Notes'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'km' ? 'ឧ. ចាក់ប្រេងឡានដឹក, ប្តូរស្នូលចម្រោះ...' : 'e.g., Truck fuel, filter cartridge...'}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {/* Receipt Photo Upload Simulation */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {lang === 'km' ? 'រូបថតវិក្កយបត្រ (Receipt Photo)' : 'Receipt Photo'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpenseReceiptUrl(
                        'https://images.unsplash.com/photo-1554415707-9e49fe832807?w=400'
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span>
                      {expenseReceiptUrl
                        ? lang === 'km'
                          ? '✓ បានភ្ជាប់រូបថតវិក្កយបត្រ'
                          : '✓ Receipt Attached'
                        : lang === 'km'
                        ? 'ថត ឬបញ្ចូលរូបវិក្កយបត្រ'
                        : 'Upload / Snap Receipt'}
                    </span>
                  </button>
                  {expenseReceiptUrl && (
                    <button
                      type="button"
                      onClick={() => setExpenseReceiptUrl('')}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                    >
                      {lang === 'km' ? 'លុប' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-sky-600 font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 active:scale-98 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{lang === 'km' ? 'រក្សាទុកការចំណាយ' : 'Save Expense'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="h-12 min-h-[48px] px-4 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
