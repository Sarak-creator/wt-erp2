'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Settings,
  Building,
  DollarSign,
  MapPin,
  Database,
  CheckCircle2,
  Save,
  Globe,
  Layers,
  Phone,
  Shield,
  RefreshCw,
} from 'lucide-react';

export default function SettingsView() {
  const {
    lang,
    companySettings,
    updateCompanySettings,
    deliveryZones,
    supabaseConnected,
    isSyncing,
    fetchFromSupabase,
  } = useAppStore();

  const [name, setName] = useState(companySettings.name);
  const [nameKh, setNameKh] = useState(companySettings.name_kh);
  const [phone, setPhone] = useState(companySettings.phone);
  const [address, setAddress] = useState(companySettings.address);
  const [khmerRate, setKhmerRate] = useState(companySettings.khmer_rate);
  const [bottleDepositRate, setBottleDepositRate] = useState(companySettings.bottle_deposit_rate);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    await updateCompanySettings({
      name,
      name_kh: nameKh,
      phone,
      address,
      khmer_rate: Number(khmerRate),
      bottle_deposit_rate: Number(bottleDepositRate),
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការកំណត់ប្រព័ន្ធ & រោងចក្រ' : 'System & Enterprise Settings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'ព័ត៌មានក្រុមហ៊ុន អត្រាប្តូរប្រាក់រៀល តម្លៃកក់សំបកដប និងការតភ្ជាប់ Supabase'
              : 'Company profile, KHR exchange rate, bottle deposit pricing, and database status'}
          </p>
        </div>

        <button
          onClick={() => fetchFromSupabase()}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-slate-600' : ''}`} />
          {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
        </button>
      </div>

      {/* Supabase Connection Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-emerald-600 text-white rounded-xl">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
            <span>{lang === 'km' ? 'មូលដ្ឋានទិន្នន័យ Supabase កំពុងដំណើរការ' : 'Supabase Database Connected & Live'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
              Active
            </span>
          </div>
          <p className="text-xs text-emerald-800/80 mt-1">
            Project: <code className="font-mono font-semibold">https://kopnjkdvvfnnbvtimyfl.supabase.co</code>
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {lang === 'km'
              ? 'ទិន្នន័យទាំងអស់ (ផលិតផល អតិថិជន បុគ្គលិក ស្តុក ការបញ្ជាទិញ បំណុល ចំណាយ) ត្រូវបានតភ្ជាប់ផ្ទាល់'
              : 'Zero demo data — all products, clients, staff, stock, orders, debts, and costs sync live.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            {lang === 'km' ? 'ព័ត៌មានរោងចក្រទឹកបរិសុទ្ធ' : 'Water Factory Profile'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Company Name (English)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ឈ្មោះរោងចក្រ (ភាសាខ្មែរ)
              </label>
              <input
                type="text"
                required
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'km' ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Company Phone'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'km' ? 'អាសយដ្ឋានរោងចក្រ' : 'Factory Location'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Deposit Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            {lang === 'km' ? 'អត្រាប្តូរប្រាក់ & តម្លៃកក់ដប' : 'Currency & Bottle Deposit Policy'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'km' ? 'អត្រាប្តូរប្រាក់រៀល (1 USD = ? KHR)' : 'Exchange Rate (1 USD to KHR)'}
              </label>
              <input
                type="number"
                required
                value={khmerRate}
                onChange={(e) => setKhmerRate(parseInt(e.target.value) || 4100)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'km' ? 'តម្លៃកក់ដប ២០លីត្រ ($/ដប)' : '20L Bottle Deposit Fee ($/bottle)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={bottleDepositRate}
                onChange={(e) => setBottleDepositRate(parseFloat(e.target.value) || 3.0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery Zones List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            {lang === 'km' ? 'តំបន់ដឹកជញ្ជូនដែលបានកំណត់' : 'Configured Delivery Zones'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryZones.map((z) => (
              <div
                key={z.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{z.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{z.code}</span>
                </div>
                {z.description && (
                  <span className="text-slate-500 text-[11px] text-right truncate max-w-[150px]">
                    {z.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'km' ? 'បានរក្សាទុកក្នុង Supabase ដោយជោគជ័យ!' : 'Settings successfully saved to Supabase!'}
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving
                ? lang === 'km'
                  ? 'កំពុងរក្សាទុក...'
                  : 'Saving...'
                : lang === 'km'
                ? 'រក្សាទុកការកំណត់'
                : 'Save System Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
