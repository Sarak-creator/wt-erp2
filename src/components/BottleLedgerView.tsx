'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { formatUSD } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  AlertOctagon,
  DollarSign,
  PlusCircle,
  Filter,
  CheckCircle,
  Calendar,
  Building2,
  X,
  Droplet,
} from 'lucide-react';

export default function BottleLedgerView() {
  const {
    lang,
    customers,
    bottleLedger,
    addBottleMovement,
    updateCustomerBalance,
    inventory,
  } = useAppStore();

  const t = translations[lang];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [targetCustomerId, setTargetCustomerId] = useState<string>(customers[0]?.id || '');
  const [bottlesOut, setBottlesOut] = useState<number>(0);
  const [bottlesIn, setBottlesIn] = useState<number>(0);
  const [depositCollected, setDepositCollected] = useState<number>(0);
  const [depositRefunded, setDepositRefunded] = useState<number>(0);
  const [breakageQty, setBreakageQty] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Aggregated bottle counts
  const totalHeldByCustomers = customers.reduce(
    (acc, c) => acc + (c.empty_bottles_held || 0),
    0
  );
  const totalDepositsHeld = customers.reduce(
    (acc, c) => acc + (c.deposit_balance || 0),
    0
  );
  const warehouseAssetBottles =
    inventory.find((i) => i.sku === 'AST-EMPTY-20L')?.qty_on_hand || 1400;
  const fullWarehouseGallons =
    inventory.find((i) => i.sku === 'FG-GAL-20L')?.qty_on_hand || 850;
  const totalCirculation =
    totalHeldByCustomers + warehouseAssetBottles + fullWarehouseGallons;

  // Filtered transactions
  const filteredLedger =
    selectedCustomerId === 'all'
      ? bottleLedger
      : bottleLedger.filter((b) => b.customer_id === selectedCustomerId);

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();

    addBottleMovement({
      customer_id: targetCustomerId,
      bottles_out: bottlesOut,
      bottles_in: bottlesIn,
      deposit_collected: depositCollected,
      deposit_refunded: depositRefunded,
      breakage_qty: breakageQty,
      notes,
    });

    // Update customer's held bottles & deposit balance
    const bottleDelta = bottlesOut - bottlesIn - breakageQty;
    const depositDelta = depositCollected - depositRefunded;
    updateCustomerBalance(targetCustomerId, 0, bottleDelta, depositDelta);

    // Reset & close
    setBottlesOut(0);
    setBottlesIn(0);
    setDepositCollected(0);
    setDepositRefunded(0);
    setBreakageQty(0);
    setNotes('');
    setShowLogModal(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            {t.bottles.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {t.bottles.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          {t.bottles.recordMovement}
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. សំបកនៅខាងក្រៅ (Bottles in Market) */}
        <MetricCard
          title={lang === 'km' ? 'សំបកនៅខាងក្រៅ (In Market)' : 'Bottles in Market'}
          value={`${totalHeldByCustomers.toLocaleString()} ធុង`}
          subValue={lang === 'km' ? 'នៅតាមផ្ទះអតិថិជន' : 'with clients'}
          icon={ArrowUpRight}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          change={{
            value: `${customers.length} អតិថិជន`,
            trend: 'neutral',
            label: lang === 'km' ? 'កំពុងកាន់កាប់' : 'holding bottles',
          }}
          highlight={true}
          badge={lang === 'km' ? 'នៅខាងក្រៅ' : 'Out'}
          badgeColor="bg-amber-50 text-amber-700"
        />

        {/* 2. សំបកនៅក្នុងឃ្លាំង (Bottles in Warehouse) */}
        <MetricCard
          title={lang === 'km' ? 'សំបកនៅក្នុងឃ្លាំង (In Factory)' : 'Bottles in Warehouse'}
          value={`${(warehouseAssetBottles + fullWarehouseGallons).toLocaleString()} ធុង`}
          subValue={`${fullWarehouseGallons} ពេញ / ${warehouseAssetBottles} សំបក`}
          icon={ArrowDownLeft}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          change={{
            value: 'Ready',
            trend: 'up',
            label: lang === 'km' ? 'ត្រៀមច្រកទឹក' : 'ready for refill',
          }}
          badge={lang === 'km' ? 'ក្នុងស្តុក' : 'Stock'}
          badgeColor="bg-emerald-50 text-emerald-700"
        />

        {/* 3. ប្រាក់កក់សរុប (Held Deposit Amount) */}
        <MetricCard
          title={lang === 'km' ? 'ប្រាក់កក់សរុប (Held Deposits)' : 'Held Deposit Amount'}
          value={formatUSD(totalDepositsHeld)}
          subValue={`@ $3.00/ធុង`}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{
            value: 'Reserve',
            trend: 'neutral',
            label: lang === 'km' ? 'បម្រុងសងវិញ' : 'refundable cash reserve',
          }}
          badge="Deposit"
          badgeColor="bg-blue-50 text-blue-700"
        />

        {/* 4. សរុបចរន្ត (Total in Circulation) */}
        <MetricCard
          title={lang === 'km' ? 'ធុងចរន្តសរុប (Circulation)' : 'Total in Circulation'}
          value={`${totalCirculation.toLocaleString()} ធុង`}
          subValue={lang === 'km' ? 'ទ្រព្យសកម្មសរុប' : 'Total 20L asset'}
          icon={Package}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-100"
          change={{
            value: '100% Asset',
            trend: 'up',
            label: lang === 'km' ? 'ត្រួតពិនិត្យរួច' : 'accounted for',
          }}
          badge="Asset"
          badgeColor="bg-sky-50 text-sky-700"
        />
      </div>

      {/* Customer Balances Quick Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-600" />
            {lang === 'km' ? 'សមតុល្យធុងតាមអតិថិជន' : 'Customer Bottle & Deposit Ledger Balance'}
          </h3>
          {/* Customer filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">{t.common.all} ({customers.length})</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Mini Cards with Visual Bottle Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className={`rounded-2xl border p-4 transition-all ${
                selectedCustomerId === cust.id
                  ? 'border-sky-600 bg-sky-50/40 shadow-sm ring-1 ring-sky-500/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                  {cust.name}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {cust.price_tier}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {cust.business_name || cust.phone}
              </p>

              {/* Visual Bottle Indicator (as requested in Section 3.C) */}
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-sky-700">
                    <span className="text-base">💧</span> x {cust.empty_bottles_held} Gallons Out
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    {formatUSD(cust.deposit_balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottle Movement History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">{t.common.date}</th>
                <th className="py-3 px-3">{lang === 'km' ? 'អតិថិជន' : 'Customer'}</th>
                <th className="py-3 px-3 text-center">{t.bottles.bottlesOut} (▲)</th>
                <th className="py-3 px-3 text-center">{t.bottles.bottlesIn} (▼)</th>
                <th className="py-3 px-3 text-center">{t.bottles.breakage}</th>
                <th className="py-3 px-3">{t.bottles.depositCollected}</th>
                <th className="py-3 px-3">{t.bottles.depositRefunded}</th>
                <th className="py-3 px-3">{t.bottles.notes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.map((row) => {
                const customer = customers.find((c) => c.id === row.customer_id);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {customer ? customer.name : row.customer_id}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.bottles_out > 0 ? (
                        <span className="rounded-md bg-amber-100 text-amber-800 font-bold px-2 py-0.5">
                          +{row.bottles_out}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.bottles_in > 0 ? (
                        <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5">
                          -{row.bottles_in}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.breakage_qty > 0 ? (
                        <span className="rounded-md bg-rose-100 text-rose-800 font-bold px-2 py-0.5">
                          {row.breakage_qty}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-emerald-700">
                      {row.deposit_collected > 0 ? `+${formatUSD(row.deposit_collected)}` : '-'}
                    </td>
                    <td className="py-3 px-3 font-medium text-rose-700">
                      {row.deposit_refunded > 0 ? `-${formatUSD(row.deposit_refunded)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">
                      {row.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Bottle Movement */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {t.bottles.recordMovement}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'km'
                ? 'កត់ត្រាចំនួនធុងចេញ ធុងសំបកត្រឡប់ និងប្រាក់កក់'
                : 'Log returnable bottle exchange and security deposits'}
            </p>

            <form onSubmit={handleSaveMovement} className="mt-4 space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {lang === 'km' ? 'អតិថិជន' : 'Customer'}
                </label>
                <select
                  value={targetCustomerId}
                  onChange={(e) => setTargetCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 font-medium focus:border-blue-500"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.business_name || c.phone} (បច្ចុប្បន្ន: {c.empty_bottles_held} ធុង)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantities Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {t.bottles.bottlesOut} (Full)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bottlesOut}
                    onChange={(e) => setBottlesOut(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {t.bottles.bottlesIn} (Empty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bottlesIn}
                    onChange={(e) => setBottlesIn(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-600 mb-1 block">
                    {t.bottles.breakage}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={breakageQty}
                    onChange={(e) => setBreakageQty(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-rose-300 bg-rose-50/50 p-2 font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Deposit Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {t.bottles.depositCollected} ($3/ea)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={depositCollected}
                    onChange={(e) => setDepositCollected(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {t.bottles.depositRefunded}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={depositRefunded}
                    onChange={(e) => setDepositRefunded(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  {t.bottles.notes}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broken during transit, replaced on site"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700"
                >
                  {t.common.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
