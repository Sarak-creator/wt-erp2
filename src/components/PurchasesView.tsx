'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Purchase } from '@/types/database';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  PackageCheck,
  Building2,
  Calendar,
  X,
  RefreshCw,
  Boxes,
} from 'lucide-react';

export default function PurchasesView() {
  const { lang, purchases, inventory, addPurchase, fetchFromSupabase, isSyncing } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState(100);
  const [unitCost, setUnitCost] = useState(0.2);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setSupplierName('');
    setSupplierPhone('');
    setSelectedItemId(inventory[0]?.id || '');
    setQuantity(100);
    setUnitCost(inventory[0]?.unit_cost || 0.2);
    setPaymentStatus('paid');
    setPaymentMethod('cash');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || quantity <= 0) return;
    setIsSaving(true);

    const purchaseNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = Number(quantity) * Number(unitCost);

    await addPurchase(
      {
        purchase_number: purchaseNumber,
        supplier_name: supplierName,
        supplier_phone: supplierPhone,
        status: 'received',
        total_amount: totalAmount,
        paid_amount: paymentStatus === 'paid' ? totalAmount : 0,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        purchase_date: new Date().toISOString().slice(0, 10),
        notes,
      },
      [
        {
          inventory_item_id: selectedItemId,
          quantity: Number(quantity),
          unit_cost: Number(unitCost),
        },
      ]
    );

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total_amount, 0);

  const filtered = purchases.filter((p) => {
    return (
      p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchase_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការបញ្ជាទិញចូល & ផ្គត់ផ្គង់ (Purchasing)' : 'Procurement & Supplier Purchases'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'បញ្ជាទិញវត្ថុធាតុដើម សំបកដប គម្រប ស្លាកសញ្ញា និងបង្កើនចំនួនស្តុកស្វ័យប្រវត្តិ'
              : 'Purchase raw materials, caps, and preforms with automated warehouse stock updating'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFromSupabase()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-600' : ''}`} />
            {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {lang === 'km' ? 'បង្កើតការបញ្ជាទិញថ្មី' : 'New Purchase Order'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ទំហំបញ្ជាទិញសរុប' : 'Total Procurement Value'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {purchases.length} {lang === 'km' ? 'ការបញ្ជាទិញ' : 'purchase orders'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'ស្ថានភាពទទួលទំនិញ' : 'Fulfillment Status'}
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
          <span className="text-xs text-slate-500 mt-1 block">
            {lang === 'km' ? 'ទំនិញចូលស្តុកពេញលេញ' : 'All items received in stock'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">
            {lang === 'km' ? 'អ្នកផ្គត់ផ្គង់សកម្ម' : 'Active Suppliers'}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {new Set(purchases.map((p) => p.supplier_name)).size}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Verified vendors</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">PO #</th>
                <th className="px-6 py-4">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'អ្នកផ្គត់ផ្គង់' : 'Supplier'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment'}</th>
                <th className="px-6 py-4 text-right">{lang === 'km' ? 'ទឹកប្រាក់សរុប' : 'Total Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    {p.purchase_number}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {p.purchase_date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{p.supplier_name}</div>
                    {p.supplier_phone && (
                      <div className="text-xs text-slate-400">{p.supplier_phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <PackageCheck className="w-3 h-3" />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase text-slate-700">
                      {p.payment_status} ({p.payment_method})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 text-base">
                    ${p.total_amount.toFixed(2)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    {lang === 'km' ? 'មិនមានការបញ្ជាទិញចូលទេ' : 'No purchase orders recorded'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {lang === 'km' ? 'បង្កើតការបញ្ជាទិញចូល (PO)' : 'Create Purchase Order'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ឈ្មោះអ្នកផ្គត់ផ្គង់' : 'Supplier Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Cambodia Plastic Co., Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Supplier Phone'}
                  </label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="012 998 877"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ជ្រើសរើសទំនិញចូលស្តុក' : 'Select Inventory Item to Restock'}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const itm = inventory.find((i) => i.id === e.target.value);
                    if (itm) setUnitCost(itm.unit_cost);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Current: {item.qty_on_hand} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ចំនួនទិញចូល' : 'Quantity to Buy'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ថ្លៃដើម/ឯកតា ($)' : 'Unit Cost ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 flex items-center justify-between text-xs">
                <span className="text-cyan-800 font-medium">
                  {lang === 'km' ? 'សរុបតម្លៃបញ្ជាទិញ:' : 'Calculated Total:'}
                </span>
                <span className="text-base font-bold text-cyan-900">
                  ${(Number(quantity) * Number(unitCost)).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="paid">Paid (ទូទាត់រួច)</option>
                    <option value="unpaid">Unpaid (ជំពាក់អ្នកផ្គត់ផ្គង់)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">ABA / Bank</option>
                  </select>
                </div>
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
                  disabled={isSaving || quantity <= 0}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Processing...' : lang === 'km' ? 'បញ្ជាក់ការទិញ' : 'Create & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
