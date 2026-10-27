'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Customer, CustomerPriceTier } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Edit2,
  DollarSign,
  Package,
  ShieldAlert,
  X,
  RefreshCw,
  Building2,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function CustomersView() {
  const {
    lang,
    customers,
    deliveryZones,
    addCustomer,
    updateCustomer,
    fetchFromSupabase,
    isSyncing,
    addDebtPayment,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [priceTier, setPriceTier] = useState<CustomerPriceTier>('wholesale');
  const [creditLimit, setCreditLimit] = useState(200);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Debt Payment Modal State
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setBusinessName('');
    setPhone('');
    setAddress('');
    setZoneId(deliveryZones[0]?.id || '');
    setPriceTier('wholesale');
    setCreditLimit(200);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setBusinessName(c.business_name || '');
    setPhone(c.phone);
    setAddress(c.address || '');
    setZoneId(c.zone_id || '');
    setPriceTier(c.price_tier);
    setCreditLimit(c.credit_limit);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, {
        name,
        business_name: businessName,
        phone,
        address,
        zone_id: zoneId ? zoneId : null,
        price_tier: priceTier,
        credit_limit: Number(creditLimit),
        notes,
      });
    } else {
      await addCustomer({
        name,
        business_name: businessName,
        phone,
        address,
        zone_id: zoneId ? zoneId : null,
        price_tier: priceTier,
        credit_limit: Number(creditLimit),
        current_balance: 0,
        deposit_balance: 0,
        empty_bottles_held: 0,
        active: true,
        notes,
      });
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer || paymentAmount <= 0) return;
    setIsPaying(true);

    await addDebtPayment(payingCustomer.id, Number(paymentAmount), paymentMethod, paymentNotes);

    setIsPaying(false);
    setPayingCustomer(null);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesZone = filterZone === 'all' || c.zone_id === filterZone;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm);
    return matchesZone && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'បញ្ជីអតិថិជន & ដៃគូអាជីវកម្ម' : 'Customer & Partner Directory'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'គ្រប់គ្រងព័ត៌មានអតិថិជន ទីតាំងដឹកជញ្ជូន ដែនកំណត់ឥណទាន និងតុល្យភាពដប'
              : 'Manage customer accounts, delivery routes, credit limits, and bottle holdings'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFromSupabase()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {lang === 'km' ? 'បន្ថែមអតិថិជនថ្មី' : 'Add New Customer'}
          </button>
        </div>
      </div>

      {/* Search & Zone Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ អាជីវកម្ម ឬលេខទូរស័ព្ទ...' : 'Search name, business or phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto min-w-[200px]">
          <CustomSelect
            value={filterZone}
            onChange={(val) => setFilterZone(val)}
            icon={MapPin}
            options={[
              { value: 'all', label: lang === 'km' ? 'តំបន់ទាំងអស់' : 'All Delivery Zones', badge: 'All' },
              ...deliveryZones.map((z) => ({
                value: z.id,
                label: z.name,
                sublabel: z.code,
              })),
            ]}
            className="w-full"
            buttonClassName="py-2 px-3 text-xs"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((c) => {
          const zone = deliveryZones.find((z) => z.id === c.zone_id);
          const hasDebt = c.current_balance > 0;
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {c.price_tier}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{c.name}</h3>
                  {c.business_name && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.business_name}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openEditModal(c)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </div>
                {c.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
                {zone && (
                  <div className="text-[11px] text-blue-600 font-medium">
                    {zone.name}
                  </div>
                )}
              </div>

              {/* Balances & Bottles */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'ជំពាក់ប្រាក់' : 'Outstanding Debt'}</span>
                  <span className={`font-bold block ${hasDebt ? 'text-rose-600 text-sm' : 'text-slate-700'}`}>
                    {formatKHR(c.current_balance)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'ដបកាន់កាប់' : 'Bottles Held'}</span>
                  <span className="font-bold text-blue-600 text-sm block">
                    {c.empty_bottles_held} {lang === 'km' ? 'ដប' : 'pcs'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {hasDebt && (
                  <button
                    onClick={() => {
                      setPayingCustomer(c);
                      setPaymentAmount(c.current_balance);
                    }}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {lang === 'km' ? 'ទារបំណុល / បង់ប្រាក់' : 'Collect Debt'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>{lang === 'km' ? 'មិនមានអតិថិជនទេ' : 'No customers found'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {editingCustomer
                  ? lang === 'km'
                    ? 'កែប្រែព័ត៌មានអតិថិជន'
                    : 'Edit Customer'
                  : lang === 'km'
                  ? 'បន្ថែមអតិថិជនថ្មី'
                  : 'Add New Customer'}
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
                    {lang === 'km' ? 'ឈ្មោះអតិថិជន' : 'Contact Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. លោក សុខ ចិន្តា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ឈ្មោះអាជីវកម្ម / ហាង' : 'Business / Store Name'}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. ហាងកាហ្វេ អាម៉ាហ្សូន"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'កម្រិតតម្លៃ' : 'Price Tier'}
                  </label>
                  <CustomSelect
                    value={priceTier}
                    onChange={(val) => setPriceTier(val as any)}
                    options={[
                      { value: 'retail', label: 'Retail (លក់រាយ)', badge: 'Standard' },
                      { value: 'wholesale', label: 'Wholesale (បោះដុំ)', badge: 'Discount', badgeColor: 'bg-blue-100 text-blue-700' },
                      { value: 'distributor', label: 'Distributor (តំណាងចែកចាយ)', badge: 'VIP', badgeColor: 'bg-purple-100 text-purple-700' },
                      { value: 'subscription', label: 'Subscription (ប្រចាំខែ)', badge: 'Monthly', badgeColor: 'bg-amber-100 text-amber-700' },
                    ]}
                    className="w-full"
                    buttonClassName="w-full py-2 px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'តំបន់ដឹកជញ្ជូន' : 'Delivery Route / Zone'}
                </label>
                <CustomSelect
                  value={zoneId}
                  onChange={(val) => setZoneId(val)}
                  placeholder={lang === 'km' ? '-- ជ្រើសរើសតំបន់ --' : '-- Select Zone --'}
                  icon={MapPin}
                  options={[
                    { value: '', label: lang === 'km' ? '-- គ្មានតំបន់ (None) --' : '-- None --' },
                    ...deliveryZones.map((z) => ({
                      value: z.id,
                      label: z.name,
                      sublabel: z.code,
                    })),
                  ]}
                  className="w-full"
                  buttonClassName="w-full py-2 px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Sangkat, Khan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ដែនកំណត់ជំពាក់ (៛)' : 'Credit Limit (៛)'}
                  </label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'កំណត់សម្គាល់' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving
                    ? lang === 'km'
                      ? 'កំពុងរក្សាទុក...'
                      : 'Saving...'
                    : lang === 'km'
                    ? 'រក្សាទុក'
                    : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Debt Payment Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {lang === 'km' ? 'ទទួលប្រាក់ទូទាត់បំណុល' : 'Record Debt Payment'}
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
                  <span className="font-bold text-rose-600">
                    {formatKHR(payingCustomer.current_balance)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    {lang === 'km' ? 'ចំនួនប្រាក់ត្រូវបង់ (៛)' : 'Payment Amount (៛)'}
                  </label>
                  <span className="text-xs font-bold text-emerald-600">
                    {formatKHR(paymentAmount)}
                  </span>
                </div>
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
                  placeholder="e.g. Receipt #1042"
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
