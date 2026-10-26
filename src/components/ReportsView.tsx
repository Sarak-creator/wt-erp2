'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Users,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { formatKHR, formatUSD } from '@/lib/utils';

export default function ReportsView() {
  const {
    lang,
    orders,
    expenses,
    inventory,
    customers,
    deliveryZones,
    bottleLedger,
    fetchFromSupabase,
    isSyncing,
  } = useAppStore();

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);

  const gallonItem = inventory.find((i) => i.sku === 'FG-GAL-20L');
  const unitCostGallon = gallonItem?.unit_cost || 0.45;
  const totalBottlesDelivered = deliveredOrders.reduce((sum, o) => sum + (o.bottles_delivered || 0), 0);
  const estimatedCogs = totalBottlesDelivered * unitCostGallon;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossRevenue - estimatedCogs - totalExpenses;
  const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const totalBottlesOut = bottleLedger.reduce((sum, b) => sum + (b.bottles_out || 0), 0);
  const totalBottlesIn = bottleLedger.reduce((sum, b) => sum + (b.bottles_in || 0), 0);
  const returnRate = totalBottlesOut > 0 ? Math.round((totalBottlesIn / totalBottlesOut) * 100) : 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'របាយការណ៍អាជីវកម្ម & ហិរញ្ញវត្ថុ' : 'Executive Reports & Analytics'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'ទិន្នន័យជាក់ស្តែងពី Supabase៖ ចំណូល ថ្លៃដើម ប្រាក់ចំណេញសុទ្ធ និងអត្រាបង្វិលសំបកដប'
              : 'Live analytics directly from Supabase: Revenue, COGS, Net Profit, and Bottle Return Ratio'}
          </p>
        </div>

        <button
          onClick={() => fetchFromSupabase()}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-violet-600' : ''}`} />
          {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ចំណូលដុល' : 'Gross Revenue'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatKHR(grossRevenue)}
          </div>
          <span className="text-xs text-slate-500 font-semibold mt-1 block">
            USD: ${grossRevenue.toFixed(2)} • {deliveredOrders.length} {lang === 'km' ? 'ការបញ្ជាទិញ' : 'orders'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ថ្លៃដើម & ចំណាយ' : 'COGS & OpEx'}
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {formatKHR(estimatedCogs + totalExpenses)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            USD: ${(estimatedCogs + totalExpenses).toFixed(2)} (COGS: {formatKHR(estimatedCogs)} | Exp: {formatKHR(totalExpenses)})
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ប្រាក់ចំណេញសុទ្ធ' : 'Net Profit'}
          </span>
          <div className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatKHR(netProfit)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            USD: ${netProfit.toFixed(2)} • {netMargin.toFixed(1)}% {lang === 'km' ? 'ផលចំណេញ' : 'margin'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'អត្រាបង្វិលសំបកដប' : 'Bottle Return Rate'}
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{returnRate}%</div>
          <span className="text-xs text-slate-500 mt-1 block">
            {totalBottlesIn} / {totalBottlesOut} 20L bottles returned
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Zone Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">
            {lang === 'km' ? 'ការលក់តាមតំបន់ដឹកជញ្ជូន' : 'Performance by Delivery Zone'}
          </h2>
          <div className="space-y-3">
            {deliveryZones.map((zone) => {
              const zoneOrders = deliveredOrders.filter((o) => o.zone_id === zone.id);
              const zoneRev = zoneOrders.reduce((sum, o) => sum + o.total_amount, 0);
              const pct = grossRevenue > 0 ? (zoneRev / grossRevenue) * 100 : 0;
              return (
                <div key={zone.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{zone.name}</span>
                    <span className="text-slate-900">{formatKHR(zoneRev)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-violet-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Concentration Report */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">
            {lang === 'km' ? 'អតិថិជនឆ្នើមទាំង ៥' : 'Top Customers by Volume'}
          </h2>
          <div className="space-y-3">
            {customers.slice(0, 5).map((cust) => {
              const custOrders = deliveredOrders.filter((o) => o.customer_id === cust.id);
              const custRev = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
              return (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900">{cust.name}</span>
                    {cust.business_name && (
                      <span className="text-[11px] text-slate-400 block">{cust.business_name}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-emerald-600">${custRev.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {cust.empty_bottles_held} bottles held
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
