'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { InventoryItem } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function ProductsView() {
  const { lang, inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, fetchFromSupabase, isSyncing } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'finished_good' | 'raw_material' | 'packaging'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [nameKh, setNameKh] = useState('');
  const [type, setType] = useState<'finished_good' | 'raw_material' | 'packaging' | 'asset'>('finished_good');
  const [unit, setUnit] = useState('bottle');
  const [qtyOnHand, setQtyOnHand] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(20);
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setSku(`FG-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setNameKh('');
    setType('finished_good');
    setUnit('bottle');
    setQtyOnHand(50);
    setUnitCost(0.5);
    setRetailPrice(1.0);
    setWholesalePrice(0.8);
    setReorderLevel(20);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setSku(item.sku);
    setName(item.name);
    setNameKh(item.name_kh || '');
    setType(item.type);
    setUnit(item.unit);
    setQtyOnHand(item.qty_on_hand);
    setUnitCost(item.unit_cost);
    setRetailPrice(item.retail_price);
    setWholesalePrice(item.wholesale_price);
    setReorderLevel(item.reorder_level);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingItem) {
      await updateInventoryItem(editingItem.id, {
        sku,
        name,
        name_kh: nameKh,
        type,
        unit,
        qty_on_hand: Number(qtyOnHand),
        unit_cost: Number(unitCost),
        retail_price: Number(retailPrice),
        wholesale_price: Number(wholesalePrice),
        reorder_level: Number(reorderLevel),
      });
    } else {
      await addInventoryItem({
        sku,
        name,
        name_kh: nameKh,
        type,
        unit,
        qty_on_hand: Number(qtyOnHand),
        unit_cost: Number(unitCost),
        retail_price: Number(retailPrice),
        wholesale_price: Number(wholesalePrice),
        reorder_level: Number(reorderLevel),
        is_active: true,
      });
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, itemName: string) => {
    const confirmMsg =
      lang === 'km'
        ? `តើលោកអ្នកប្រាកដជាចង់លុបទំនិញ "${itemName}" នេះមែនទេ?`
        : `Are you sure you want to delete "${itemName}"?`;
    if (window.confirm(confirmMsg)) {
      await deleteInventoryItem(id);
    }
  };

  // Only finished goods for Product View, or all based on filter
  const products = inventory.filter((item) => {
    const matchesFilter = filterType === 'all' ? true : item.type === filterType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name_kh && item.name_kh.includes(searchTerm)) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការគ្រប់គ្រងផលិតផល' : 'Product Catalog & Pricing'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'គ្រប់គ្រងផលិតផលទឹកបរិសុទ្ធ បញ្ជីតម្លៃរាយ តម្លៃដុំ និងស្តុកក្នុងឃ្លាំង'
              : 'Manage bottled water products, retail & wholesale pricing, and stock levels'}
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
            {lang === 'km' ? 'បន្ថែមផលិតផលថ្មី' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខកូដ SKU...' : 'Search by name or SKU...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: lang === 'km' ? 'ទាំងអស់' : 'All' },
            { id: 'finished_good', label: lang === 'km' ? 'ផលិតផលសម្រេច' : 'Finished Goods' },
            { id: 'packaging', label: lang === 'km' ? 'សំបកដប/កេស' : 'Packaging' },
            { id: 'raw_material', label: lang === 'km' ? 'វត្ថុធាតុដើម' : 'Raw Materials' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((item) => {
          const isLowStock = item.qty_on_hand <= item.reorder_level;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.sku}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">
                    {lang === 'km' && item.name_kh ? item.name_kh : item.name}
                  </h3>
                  {lang === 'km' && item.name_kh && (
                    <p className="text-xs text-slate-400">{item.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, lang === 'km' && item.name_kh ? item.name_kh : item.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title={lang === 'km' ? 'លុប' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'តម្លៃរាយ' : 'Retail Price'}</span>
                  <span className="text-sm font-bold text-emerald-600 block">{formatKHR(item.retail_price)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'តម្លៃបោះដុំ' : 'Wholesale'}</span>
                  <span className="text-sm font-bold text-blue-600 block">{formatKHR(item.wholesale_price)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'ថ្លៃដើម' : 'Cost Unit'}</span>
                  <span className="font-semibold text-slate-700 block">{formatKHR(item.unit_cost)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'km' ? 'ឯកតា' : 'Unit'}</span>
                  <span className="font-semibold text-slate-700 capitalize block pt-1">{item.unit}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {lang === 'km' ? 'ស្តុកក្នុងដៃ:' : 'In Stock:'}{' '}
                    <strong className="text-slate-900">{item.qty_on_hand}</strong> {item.unit}
                  </span>
                </div>

                {isLowStock ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertTriangle className="w-3 h-3" />
                    {lang === 'km' ? 'ជិតអស់ស្តុក' : 'Low Stock'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'km' ? 'ធម្មតា' : 'Available'}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>{lang === 'km' ? 'មិនមានផលិតផលត្រូវនឹងការស្វែងរកទេ' : 'No products found'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {editingItem
                  ? lang === 'km'
                    ? 'កែប្រែផលិតផល'
                    : 'Edit Product'
                  : lang === 'km'
                  ? 'បន្ថែមផលិតផលថ្មី'
                  : 'Add New Product'}
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {lang === 'km' ? 'ប្រភេទ' : 'Category Type'}
                  </label>
                  <CustomSelect
                    value={type}
                    onChange={(val) => setType(val as any)}
                    options={[
                      {
                        value: 'finished_good',
                        label: lang === 'km' ? 'ទឹកបរិសុទ្ធ (Finished Good)' : 'Finished Good (ទឹកបរិសុទ្ធ)',
                        badge: 'Finished',
                        badgeColor: 'emerald',
                      },
                      {
                        value: 'packaging',
                        label: lang === 'km' ? 'សំបកដប/កេស (Packaging)' : 'Packaging (សំបកដប/កេស)',
                        badge: 'Packaging',
                        badgeColor: 'blue',
                      },
                      {
                        value: 'raw_material',
                        label: lang === 'km' ? 'វត្ថុធាតុដើម (Raw Material)' : 'Raw Material (វត្ថុធាតុដើម)',
                        badge: 'Raw Material',
                        badgeColor: 'amber',
                      },
                      {
                        value: 'asset',
                        label: lang === 'km' ? 'ឧបករណ៍/ទ្រព្យ (Asset)' : 'Asset (ឧបករណ៍)',
                        badge: 'Asset',
                        badgeColor: 'purple',
                      },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ឈ្មោះផលិតផល (English)' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 20L Water Gallon"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'km' ? 'ឈ្មោះផលិតផលជាភាសាខ្មែរ' : 'Product Name (Khmer)'}
                </label>
                <input
                  type="text"
                  value={nameKh}
                  onChange={(e) => setNameKh(e.target.value)}
                  placeholder="ឧ. ទឹកពិសារ ២០លីត្រ (ប៊ីដុង)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'តម្លៃរាយ (៛)' : 'Retail (៛)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'តម្លៃបោះដុំ (៛)' : 'Wholesale (៛)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ថ្លៃដើម (៛)' : 'Unit Cost (៛)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ឯកតា' : 'Unit'}
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="bottle, box, gallon"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ចំនួនស្តុក' : 'Qty on Hand'}
                  </label>
                  <input
                    type="number"
                    required
                    value={qtyOnHand}
                    onChange={(e) => setQtyOnHand(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'កម្រិតប្រកាសអាសន្ន' : 'Reorder Alert'}
                  </label>
                  <input
                    type="number"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
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
                    : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
