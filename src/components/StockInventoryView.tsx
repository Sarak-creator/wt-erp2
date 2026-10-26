'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { InventoryItem } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  DollarSign,
} from 'lucide-react';

export default function StockInventoryView() {
  const { lang, inventory, addInventory, deductInventory, fetchFromSupabase, isSyncing } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const totalStockValue = inventory.reduce((sum, item) => sum + item.qty_on_hand * item.unit_cost, 0);
  const lowStockCount = inventory.filter((item) => item.qty_on_hand <= item.reorder_level).length;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustQty <= 0) return;
    setIsAdjusting(true);

    if (adjustType === 'in') {
      await addInventory(adjustingItem.sku, Number(adjustQty));
    } else {
      await deductInventory(adjustingItem.sku, Number(adjustQty));
    }

    setIsAdjusting(false);
    setAdjustingItem(null);
  };

  const filtered = inventory.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name_kh && item.name_kh.includes(searchTerm)) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Boxes className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ឃ្លាំងស្តុកទំនិញ & វត្ថុធាតុដើម' : 'Stock Inventory & Warehousing'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'តាមដានស្តុកវត្ថុធាតុដើម សំបកដប គម្រប ប្លាស្ទិក និងទឹកបរិសុទ្ធសម្រេច'
              : 'Monitor raw materials, bottle caps, preforms, labels, and finished goods stock'}
          </p>
        </div>

        <button
          onClick={() => fetchFromSupabase()}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'តម្លៃស្តុកសរុប' : 'Total Stock Value'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatKHR(totalStockValue)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {inventory.length} {lang === 'km' ? 'មុខទំនិញ' : 'tracked items'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ទំនិញជិតអស់ស្តុក' : 'Low Stock Items'}
          </span>
          <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {lang === 'km' ? 'ត្រូវការបញ្ជាទិញបន្ថែម' : 'Requires reordering'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ប្រភេទមុខទំនិញ' : 'Item Categories'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4</div>
          <span className="text-xs text-slate-500 mt-1 block">
            Raw, Packaging, Finished, Asset
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខកូដ SKU...' : 'Search stock item or SKU...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: lang === 'km' ? 'ទាំងអស់' : 'All' },
            { id: 'raw_material', label: lang === 'km' ? 'វត្ថុធាតុដើម' : 'Raw Materials' },
            { id: 'packaging', label: lang === 'km' ? 'សំបកវេចខ្ចប់' : 'Packaging' },
            { id: 'finished_good', label: lang === 'km' ? 'ផលិតផលសម្រេច' : 'Finished Goods' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">SKU / Item</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ប្រភេទ' : 'Type'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ចំនួនក្នុងស្តុក' : 'On Hand'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ថ្លៃដើម/ឯកតា (៛)' : 'Unit Cost (៛)'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'តម្លៃស្តុកសរុប (៛)' : 'Total Value (៛)'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{lang === 'km' ? 'កែសម្រួល' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isLow = item.qty_on_hand <= item.reorder_level;
                const totalValue = item.qty_on_hand * item.unit_cost;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {lang === 'km' && item.name_kh ? item.name_kh : item.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold capitalize">
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.qty_on_hand}{' '}
                      <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {formatKHR(item.unit_cost)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatKHR(totalValue)}
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          {lang === 'km' ? 'ជិតអស់' : 'Low Stock'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {lang === 'km' ? 'គ្រប់គ្រាន់' : 'Optimal'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustType('in');
                          setAdjustQty(10);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {lang === 'km' ? 'កែសម្រួលស្តុក' : 'Adjust Stock'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    {lang === 'km' ? 'មិនមានទំនិញក្នុងស្តុកទេ' : 'No inventory items found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {lang === 'km' ? 'កែសម្រួលបរិមាណស្តុក' : 'Adjust Stock Quantity'}
              </h2>
              <button
                onClick={() => setAdjustingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block">Item:</span>
                <strong className="text-slate-900 text-sm">
                  {adjustingItem.name} ({adjustingItem.sku})
                </strong>
                <div className="mt-1 text-slate-600">
                  Current on hand: <strong>{adjustingItem.qty_on_hand}</strong> {adjustingItem.unit}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ប្រភេទប្រតិបត្តិការ' : 'Action Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('in')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'in'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    {lang === 'km' ? 'នាំចូលស្តុក (Stock In)' : 'Stock In (+)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('out')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'out'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {lang === 'km' ? 'នាំចេញស្តុក (Stock Out)' : 'Stock Out (-)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ចំនួនកែសម្រួល' : 'Quantity'} ({adjustingItem.unit})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'មូលហេតុ / កំណត់សម្គាល់' : 'Reason / Note'}
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Received new shipment, Damaged, Warehouse count"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting || adjustQty <= 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isAdjusting ? 'Adjusting...' : lang === 'km' ? 'បញ្ជាក់ការកែប្រែ' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
