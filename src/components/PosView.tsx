'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { formatKHR } from '@/lib/utils';
import { InventoryItem, PaymentMethod } from '@/types/database';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  Building,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Printer,
  X,
  Search,
  Package,
  Layers,
  Users,
  Droplets,
  ArrowLeft,
  Tag,
  Gift,
  Percent,
  Coins,
  HelpCircle,
  BookOpen,
  Info,
  ShieldCheck,
} from 'lucide-react';
import CustomerDebtBadge from '@/components/CustomerDebtBadge';
import KhqrModal from '@/components/KhqrModal';
import CustomSelect from '@/components/ui/CustomSelect';

export default function PosView() {
  const {
    lang,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    inventory,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    depositBottlesCount,
    setDepositBottlesCount,
    updateCustomerBalance,
    addOrder,
    addBottleMovement,
    deductInventory,
  } = useAppStore();

  const t = translations[lang];
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const [posMobileTab, setPosMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pure_water' | 'asset'>('all');
  type DiscountType = 'percent' | 'amount' | 'free';
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmountInput, setDiscountAmountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculations
  const subtotal = cart.reduce((acc, ci) => acc + ci.lineTotal, 0);
  const discountAmount = useMemo(() => {
    if (discountType === 'free') {
      return subtotal;
    }
    if (discountType === 'amount') {
      return Math.min(subtotal, Math.max(0, discountAmountInput || 0));
    }
    const validPct = Math.min(100, Math.max(0, discountPercent || 0));
    return Math.round((subtotal * validPct) / 100);
  }, [discountType, subtotal, discountAmountInput, discountPercent]);

  const depositRate = 12000; // 12,000 KHR per returnable 20L bottle
  const totalDeposit = depositBottlesCount * depositRate;
  const grandTotal = Math.max(0, subtotal - discountAmount + totalDeposit);

  // Credit limit evaluation
  const remainingCredit = selectedCustomer
    ? selectedCustomer.credit_limit - selectedCustomer.current_balance
    : 0;
  const isCreditExceeded =
    paymentMethod === 'credit' && grandTotal > remainingCredit;

  // Filter items by category & search
  const availableItems = inventory.filter((item) => {
    const isEligible = item.type === 'finished_good' || item.type === 'asset';
    if (!isEligible) return false;

    if (categoryFilter === 'pure_water' && item.type !== 'finished_good') return false;
    if (categoryFilter === 'asset' && item.type !== 'asset') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(term);
      const matchSku = item.sku.toLowerCase().includes(term);
      const matchKh = item.name_kh ? item.name_kh.includes(term) : false;
      return matchName || matchSku || matchKh;
    }

    return true;
  });

  const handleCheckout = async () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage(t.pos.cartEmpty);
      return;
    }

    if (!selectedCustomer) {
      setErrorMessage(t.pos.searchCustomer);
      return;
    }

    if (paymentMethod === 'credit' && grandTotal > remainingCredit) {
      setErrorMessage(t.pos.insufficientCredit);
      return;
    }

    // Process checkout
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      invoice_number: invoiceNumber,
      customer_id: selectedCustomer.id,
      status: 'delivered' as const,
      payment_status: paymentMethod === 'credit' ? ('unpaid' as const) : ('paid' as const),
      payment_method: paymentMethod,
      subtotal,
      discount: discountAmount,
      total_amount: grandTotal,
      paid_amount: paymentMethod === 'credit' ? 0 : grandTotal,
      bottles_delivered: depositBottlesCount,
      bottles_returned: 0,
      deposit_charge: totalDeposit,
      deposit_refund: 0,
      delivery_date: new Date().toISOString().split('T')[0],
    };

    const createdOrder = await addOrder(orderData);

    // Update customer balance & bottle count
    const balanceDelta = paymentMethod === 'credit' ? grandTotal : 0;
    await updateCustomerBalance(
      selectedCustomer.id,
      balanceDelta,
      depositBottlesCount,
      totalDeposit
    );

    // If bottles were issued, add to bottle ledger
    if (depositBottlesCount > 0) {
      await addBottleMovement({
        customer_id: selectedCustomer.id,
        order_id: createdOrder?.id,
        bottles_out: depositBottlesCount,
        bottles_in: 0,
        deposit_collected: totalDeposit,
        deposit_refunded: 0,
        breakage_qty: 0,
        notes: `POS sale deposit (${depositBottlesCount} bottles)`,
      });
    }

    // Deduct inventory items
    cart.forEach((ci) => {
      deductInventory(ci.item.sku, ci.quantity);
    });

    setReceiptData({
      invoiceNumber,
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      deposit: totalDeposit,
      depositCount: depositBottlesCount,
      grandTotal,
      paymentMethod,
      date: new Date().toLocaleString(),
    });

    clearCart();
    setDiscountPercent(0);
    setDiscountAmountInput(0);
    setDiscountType('percent');
    setShowReceiptModal(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] pb-24 md:pb-6">
      {/* POS Top Header & User Guide Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-slate-700 shadow-sm mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <span>{lang === 'km' ? 'ប្រព័ន្ធលក់ទំនិញរហ័ស (POS)' : 'Point of Sale (POS)'}</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'km' ? 'ចេញវិក្កយបត្រ, ស្កេន KHQR, កាត់ស្តុក & គ្រប់គ្រងប្រាក់កក់' : 'Instant billing, KHQR payment, stock auto-deduct & deposits'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{lang === 'km' ? '📖 របៀបប្រើប្រាស់ & មុខងារ' : '📖 How to Use & Features'}</span>
        </button>
      </div>

      {/* Mobile Segment Switcher (< md) */}
      <div className="md:hidden flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl shadow-inner mb-3">
        <button
          type="button"
          onClick={() => setPosMobileTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            posMobileTab === 'catalog'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{lang === 'km' ? 'ទំនិញលក់' : 'Products'} ({availableItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setPosMobileTab('cart')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all relative ${
            posMobileTab === 'cart'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{lang === 'km' ? 'កន្ត្រក' : 'Cart'}</span>
          {cart.length > 0 && (
            <span className="rounded-full bg-blue-600 text-white text-[10px] px-1.5 py-0.2 font-black ml-1">
              {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog (7 cols on md, 8 on xl) */}
        <div
          className={`md:col-span-7 xl:col-span-8 flex flex-col space-y-3 sm:space-y-4 ${
            posMobileTab === 'catalog' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Search, Customer Picker & Category Filter Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Customer Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  {t.pos.searchCustomer}
                </label>
                <CustomSelect
                  value={selectedCustomerId || ''}
                  onChange={(val) => setSelectedCustomerId(val)}
                  placeholder={lang === 'km' ? 'ជ្រើសរើសអតិថិជន...' : 'Select a customer...'}
                  searchable={true}
                  size="sm"
                  icon={Users}
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                    sublabel: c.business_name ? `${c.business_name} • ${c.phone}` : c.phone,
                    badge: c.price_tier.toUpperCase(),
                    badgeColor:
                      c.price_tier === 'distributor'
                        ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                        : c.price_tier === 'wholesale'
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
                  }))}
                  className="w-full"
                  buttonClassName="h-8 px-2.5 text-xs rounded-lg"
                />
              </div>

              {/* Product Search */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  {t.pos.searchProduct}
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t.pos.searchProduct}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-7 text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {lang === 'km' ? 'ទាំងអស់ (All)' : 'All Items'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('pure_water')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-colors shrink-0 ${
                  categoryFilter === 'pure_water'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Droplets className="h-3.5 w-3.5" />
                <span>{lang === 'km' ? 'ទឹកបរិសុទ្ធ' : 'Pure Water'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('asset')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs transition-colors shrink-0 ${
                  categoryFilter === 'asset'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>{lang === 'km' ? 'សំបកធុង & សម្ភារៈ' : 'Bottles & Assets'}</span>
              </button>
            </div>

            {/* Customer Credit Status Widget */}
            {selectedCustomer && (
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700">
                <CustomerDebtBadge
                  currentBalance={selectedCustomer.current_balance}
                  creditLimit={selectedCustomer.credit_limit}
                  bottlesHeld={selectedCustomer.empty_bottles_held}
                />
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {availableItems.map((item) => {
              const customerTier = selectedCustomer?.price_tier || 'retail';
              const price =
                customerTier === 'wholesale' || customerTier === 'distributor'
                  ? item.wholesale_price
                  : item.retail_price;

              const isLowStock = item.qty_on_hand <= item.reorder_level;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-3.5 text-left shadow-sm hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-300 truncate max-w-[80px]">
                        {item.sku}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isLowStock
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.qty_on_hand} {item.unit}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                      {lang === 'km' && item.name_kh ? item.name_kh : item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.name}
                    </p>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {formatKHR(price)}
                      </span>
                    </div>
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 20L Bottle Deposit Modifier Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-3.5 sm:p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-cyan-300 shrink-0" />
                  <h4 className="font-bold text-xs sm:text-sm">
                    {lang === 'km'
                      ? 'ប្រាក់កក់ធុងទឹក ២០L ថ្មី (12,000 ៛/ធុង)'
                      : 'New 20L Gallon Cash Deposit (12,000 ៛/bottle)'}
                  </h4>
                </div>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  {lang === 'km'
                    ? 'គិតប្រាក់កក់បន្ថែមសម្រាប់អតិថិជនដែលពុំមានសំបកធុងដោះដូរ'
                    : 'Charge refundable deposit if customer has no empty exchange gallon'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1.5 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setDepositBottlesCount(Math.max(0, depositBottlesCount - 1))}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm sm:text-base">
                  {depositBottlesCount}
                </span>
                <button
                  type="button"
                  onClick={() => setDepositBottlesCount(depositBottlesCount + 1)}
                  className="h-8 w-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center font-bold"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold pl-1 text-cyan-200">
                  = {formatKHR(totalDeposit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POS Cart & Checkout Terminal (Entire Cart container scrolls vertically) */}
        <div
          className={`pos-cart-container md:col-span-5 xl:col-span-4 flex flex-col [&>*]:shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3.5 sm:p-4 pb-10 sm:pb-12 space-y-3.5 ${
            posMobileTab === 'cart' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="shrink-0">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {/* On mobile, allow quick back to catalog */}
                <button
                  type="button"
                  onClick={() => setPosMobileTab('catalog')}
                  className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  title={lang === 'km' ? 'ត្រឡប់ទៅទំនិញ' : 'Back to Products'}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {lang === 'km' ? 'កន្ត្រកទំនិញ' : 'Current Sale Cart'}
                </h2>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                  {cart.length}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setDiscountPercent(0);
                    setDiscountAmountInput(0);
                    setDiscountType('percent');
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {lang === 'km' ? 'សម្អាត' : 'Clear'}
                </button>
              )}
            </div>

            {/* Cart Line Items Header */}
            {cart.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 px-0.5">
                <span>{lang === 'km' ? 'មុខទំនិញក្នុងកន្ត្រក' : 'Cart Items'} ({cart.length})</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {cart.reduce((sum, ci) => sum + ci.quantity, 0)} {lang === 'km' ? 'ចំនួនសរុប' : 'total items'}
                </span>
              </div>
            )}

            {/* Cart Line Items (Rendered naturally - The ENTIRE Cart container scrolls) */}
            <div className="my-2 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs sm:text-sm">{t.pos.cartEmpty}</p>
                </div>
              ) : (
                cart.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2 sm:p-2.5 text-xs border border-slate-100 dark:border-slate-700/60 overflow-hidden"
                  >
                    <div className="flex-1 min-w-0 pr-1.5 overflow-hidden">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                        {lang === 'km' && ci.item.name_kh ? ci.item.name_kh : ci.item.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block truncate">
                        {formatKHR(ci.unitPrice)} / {ci.item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQty(ci.item.id, ci.quantity - 1)}
                          className="px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 sm:w-6 text-center font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {ci.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(ci.item.id, ci.quantity + 1)}
                          className="px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="w-14 sm:w-16 text-right font-bold text-slate-900 dark:text-white text-xs truncate">
                        {formatKHR(ci.lineTotal)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(ci.item.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Summary & Checkout */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
            {/* Multi-mode Discount Selector: Percent (%) | Cash Riel (៛) | 100% Free (ឥតគិតថ្លៃ) */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700 space-y-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{lang === 'km' ? 'បញ្ចុះតម្លៃ (Discount)' : 'Discount'}</span>
                </div>
                {discountAmount > 0 && (
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    -{formatKHR(discountAmount)}
                  </span>
                )}
              </div>

              {/* 3-Mode Tab Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md transition-all text-[11px] ${
                    discountType === 'percent'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Percent className="h-3 w-3" />
                  <span>{lang === 'km' ? 'ភាគរយ (%)' : 'Percent'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('amount')}
                  className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md transition-all text-[11px] ${
                    discountType === 'amount'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Coins className="h-3 w-3" />
                  <span>{lang === 'km' ? 'លុយរៀល (៛)' : 'KHR (៛)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('free')}
                  className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md transition-all text-[11px] ${
                    discountType === 'free'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                  }`}
                >
                  <Gift className="h-3 w-3" />
                  <span>{lang === 'km' ? 'ឥតគិតថ្លៃ' : 'Free'}</span>
                </button>
              </div>

              {/* MODE 1: Percent Discount */}
              {discountType === 'percent' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="grid grid-cols-5 gap-1 text-xs">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`py-1 rounded-md font-bold text-[11px] transition-all ${
                          discountPercent === pct
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pct === 0 ? (lang === 'km' ? 'គ្មាន' : '0%') : `${pct}%`}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                      {lang === 'km' ? 'ឬកំណត់ % ផ្ទាល់:' : 'Or custom %:'}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent || ''}
                        onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                        placeholder="0"
                        className="w-full h-7 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 pr-6 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: Cash Amount Discount (KHR) */}
              {discountType === 'amount' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="grid grid-cols-5 gap-1 text-xs">
                    {[
                      { label: lang === 'km' ? 'គ្មាន' : '0៛', val: 0 },
                      { label: '500៛', val: 500 },
                      { label: '1,000៛', val: 1000 },
                      { label: '2,000៛', val: 2000 },
                      { label: '5,000៛', val: 5000 },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setDiscountAmountInput(item.val)}
                        className={`py-1 px-0.5 rounded-md font-bold text-[10px] truncate transition-all ${
                          discountAmountInput === item.val
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                      {lang === 'km' ? 'ឬបញ្ចូលចំនួនទឹកប្រាក់:' : 'Or custom amount:'}
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={discountAmountInput || ''}
                        onChange={(e) => setDiscountAmountInput(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full h-7 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 pr-6 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">៛</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: 100% Free / Complimentary */}
              {discountType === 'free' && (
                <div className="bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-lg p-2 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                  <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block text-[11px]">
                      {lang === 'km' ? '🎁 កម្មវិធីថែមជូន / ឥតគិតថ្លៃ ១០០%' : '🎁 Complimentary / 100% Free'}
                    </span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {lang === 'km'
                        ? `បញ្ចុះតម្លៃ ១០០% លើថ្លៃទឹក/ទំនិញសរុប (-${formatKHR(subtotal)})`
                        : `100% discount applied to all cart products (-${formatKHR(subtotal)})`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Subtotal & Deposit summary */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400 overflow-hidden">
              <div className="flex justify-between">
                <span>{t.pos.subtotal}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatKHR(subtotal)}</span>
              </div>
              {depositBottlesCount > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                  <span>
                    {t.pos.depositCharge} ({depositBottlesCount}):
                  </span>
                  <span>+{formatKHR(totalDeposit)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>
                    {discountType === 'free'
                      ? (lang === 'km' ? 'ឥតគិតថ្លៃ (100% Free):' : 'Complimentary (100%):')
                      : discountType === 'amount'
                      ? (lang === 'km' ? 'បញ្ចុះតម្លៃជាសាច់ប្រាក់:' : 'Cash Discount:')
                      : `${t.pos.discount} (${discountPercent}%):`}
                  </span>
                  <span className="font-bold">-{formatKHR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700 text-sm sm:text-base font-black text-slate-900 dark:text-white">
                <span>{t.pos.totalPayable}:</span>
                <div className="text-right">
                  <span className="text-blue-600 dark:text-blue-400 text-base sm:text-lg font-black">{formatKHR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* Button 1: Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[54px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                    paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Banknote className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] sm:text-xs truncate">{t.pos.payCash}</span>
                </button>

                {/* Button 2: KHQR */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('khqr');
                    setShowKhqrModal(true);
                  }}
                  className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[54px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                    paymentMethod === 'khqr'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 shadow-sm ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <QrCode className="h-4 w-4 mb-1 text-red-600 dark:text-red-400" />
                  <span className="text-[11px] sm:text-xs truncate">ស្កេន KHQR</span>
                </button>

                {/* Button 3: Credit */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[54px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                    paymentMethod === 'credit'
                      ? isCreditExceeded
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                        : 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] sm:text-xs truncate">{t.pos.payCredit}</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {(errorMessage || isCreditExceeded) && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 p-2.5 sm:p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage || t.pos.insufficientCredit}</span>
              </div>
            )}

            {/* Primary Action Button: Complete Sale */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCreditExceeded}
              className="w-full flex h-12 md:h-14 items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm md:text-base font-black text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
            >
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>✓ {t.pos.checkout} ({formatKHR(grandTotal)})</span>
            </button>

            {/* Generous bottom buffer ensuring the checkout button is never cut off when scrolled */}
            <div className="h-8 sm:h-10 shrink-0" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile when on Catalog (< md) */}
      {posMobileTab === 'catalog' && cart.length > 0 && (
        <div className="fixed bottom-16 left-3 right-3 z-30 md:hidden">
          <button
            type="button"
            onClick={() => setPosMobileTab('cart')}
            className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-blue-600/40 font-bold active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
              </span>
              <span className="text-xs">{lang === 'km' ? 'មើលកន្ត្រក & គិតលុយ' : 'View Cart & Checkout'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-black">
              <span>{formatKHR(grandTotal)}</span>
              <span>➔</span>
            </div>
          </button>
        </div>
      )}

      {/* MODAL 1: Bakong KHQR Component */}
      <KhqrModal
        isOpen={showKhqrModal}
        onClose={() => setShowKhqrModal(false)}
        onPaymentSuccess={handleCheckout}
        amountUSD={grandTotal}
        customerName={selectedCustomer?.name}
      />

      {/* MODAL 2: ESC/POS Thermal Receipt (80mm/58mm format) */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Thermal Receipt Paper Layout */}
            <div className="border border-dashed border-slate-300 p-5 font-mono text-xs text-slate-800 bg-amber-50/30 rounded-lg">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                <h2 className="font-bold text-sm tracking-wider uppercase">
                  សហគ្រាសផលិតទឹកបរិសុទ្ធ ខ្មែរ អង្គរ
                </h2>
                <p className="text-[10px] text-slate-600">
                  KHMER ANGKOR PURE WATER CO., LTD.
                </p>
                <p className="text-[10px] text-slate-500">
                  #128, St 271, Phnom Penh | Tel: 012 334 556
                </p>
                <div className="mt-2 text-[10px]">
                  <span>INV: {receiptData.invoiceNumber}</span> |{' '}
                  <span>{receiptData.date}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  Cust: {receiptData.customer.name} ({receiptData.customer.phone})
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 mb-3">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>ITEM</span>
                  <span>QTY x PRICE</span>
                  <span>TOTAL</span>
                </div>
                {receiptData.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[140px]">{it.item.name}</span>
                    <span>
                      {it.quantity} x {formatKHR(it.unitPrice)}
                    </span>
                    <span className="font-semibold">{formatKHR(it.lineTotal)}</span>
                  </div>
                ))}
                {receiptData.depositCount > 0 && (
                  <div className="flex justify-between text-[11px] text-blue-700">
                    <span>20L Gallon Deposit x {receiptData.depositCount}</span>
                    <span>@ {formatKHR(12000)}</span>
                    <span className="font-semibold">+{formatKHR(receiptData.deposit)}</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3 mb-3">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatKHR(receiptData.subtotal)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>DISCOUNT:</span>
                    <span>-{formatKHR(receiptData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300 text-slate-900">
                  <span>សរុប (KHR ៛):</span>
                  <span>{formatKHR(receiptData.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PAYMENT METHOD:</span>
                  <span className="uppercase">{receiptData.paymentMethod}</span>
                </div>
              </div>

              {/* Thermal Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-1">
                <p>សូមពិនិត្យទំនិញ និងសំបកធុងមុនចាកចេញ!</p>
                <p>Thank you for choosing Khmer Angkor Pure Water</p>
                <p className="mt-2 text-[8px] text-slate-400">--- ESC/POS 80mm ---</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-md"
              >
                <Printer className="h-4 w-4" />
                {t.pos.printReceipt}
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 3: POS Comprehensive User Guide & Features Explanation */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {lang === 'km' ? 'សៀវភៅណែនាំរបៀបប្រើប្រាស់ & មុខងារ POS' : 'POS User Guide & Feature Breakdown'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'km' ? 'ការពន្យល់លម្អិតពីមុខងារនីមួយៗក្នុងប្រព័ន្ធលក់ទំនិញរហ័ស' : 'Complete instructions for cashiers and sales operators'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1 scroll-smooth">
              {/* Feature 1: Quick 4-Step Sales Flow */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>{lang === 'km' ? 'ជំហានលក់ទំនិញរហ័ស (៤ ជំហាន)' : 'Quick 4-Step Sales Flow'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">ជំហានទី ១: ជ្រើសរើសអតិថិជន</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ជ្រើសរើសអតិថិជនពីបញ្ជីដើម្បីទទួលបានតម្លៃពិសេស ឬទុកចោលជាអតិថិជនទូទៅ។</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">ជំហានទី ២: ជ្រើសរើសទំនិញ</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ចុចលើផលិតផលក្នុង Catalog ឬស្វែងរកតាមឈ្មោះដើម្បីបញ្ចូលក្នុងកន្ត្រក។</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">ជំហានទី ៣: បញ្ចុះតម្លៃ & ប្រាក់កក់</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">កំណត់ប្រាក់កក់ធុងទឹក ២០L ថ្មី និងជ្រើសរើសការបញ្ចុះតម្លៃ (% / ៛ / ឥតគិតថ្លៃ)។</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">ជំហានទី ៤: ទូទាត់ & បោះពុម្ព</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ជ្រើសរើសវិធីសាស្ត្រទូទាត់ (លុយសុទ្ធ, KHQR, ជំពាក់) រួចចុច "✓ គិតប្រាក់"។</p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Customer Price Tier System */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>{lang === 'km' ? 'ប្រព័ន្ធបែងចែកកម្រិតតម្លៃអតិថិជន (Price Tiers)' : 'Customer Price Tiers'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  ប្រព័ន្ធនឹងកំណត់តម្លៃទំនិញស្វ័យប្រវត្តិតាមកម្រិតរបស់អតិថិជននីមួយៗ៖
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-purple-100 dark:border-purple-900/50">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">DISTRIBUTOR</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">តម្លៃពិសេសទាបបំផុតសម្រាប់តំណាងចែកចាយប្រចាំតំបន់។</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">WHOLESALE</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">តម្លៃបោះដុំសម្រាប់ម៉ាត, ភោជនីយដ្ឋាន និងដេប៉ូ។</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">RETAIL</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">តម្លៃលក់រាយស្ដង់ដារសម្រាប់អតិថិជនទូទៅ។</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: New 20L Bottle Deposit Modifier */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
                  <span>{lang === 'km' ? 'ប្រាក់កក់ធុងទឹក ២០L ថ្មី (12,000 ៛/ធុង)' : '20L Bottle Cash Deposit (12,000 KHR)'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  ប្រើប្រាស់នៅពេលដែលអតិថិជនជាវទឹកបរិសុទ្ធធុង ២០L ថ្មីដោយគ្មានសំបកធុងមកដោះដូរ។ ប្រព័ន្ធនឹងបន្ថែមប្រាក់កក់ ១២,០០០ ៛ ក្នុងមួយធុងចូលក្នុងវិក្កយបត្រ និងកត់ត្រាចំនួនធុងចូលក្នុងបញ្ជីចរាចរណ៍សំបកធុង (Bottle Ledger) របស់រោងចក្រដោយស្វ័យប្រវត្តិ។
                </p>
              </div>

              {/* Feature 4: Multi-mode Discounts */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">4</span>
                  <span>{lang === 'km' ? 'ជម្រើសបញ្ចុះតម្លៃ ៣ បែប (Multi-mode Discount)' : '3 Discount Modes'}</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-blue-600 dark:text-blue-400 shrink-0">១. ភាគរយ (%) :</span>
                    <span>ចុចប៊ូតុង 5%, 10%, 15%, 20% ឬវាយបញ្ចូល % ដោយផ្ទាល់។</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-blue-600 dark:text-blue-400 shrink-0">២. លុយរៀល (៛) :</span>
                    <span>ចុចជ្រើសរើស 500៛, 1000៛, 2000៛, 5000៛ ឬវាយបញ្ចូលចំនួនសាច់ប្រាក់រៀលដែលត្រូវកាត់បន្ថយ។</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">៣. ឥតគិតថ្លៃ (100% Free) :</span>
                    <span>បញ្ចុះតម្លៃ ១០០% លើថ្លៃទឹក/ទំនិញសរុប សម្រាប់កម្មវិធីឧបត្ថម្ភ បរិច្ចាគ ឬថែមជូនពិសេស។</span>
                  </div>
                </div>
              </div>

              {/* Feature 5: 3 Payment Methods & Bakong KHQR */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-black">5</span>
                  <span>{lang === 'km' ? 'វិធីសាស្ត្រទូទាត់ប្រាក់ ៣ បែប' : '3 Payment Methods'}</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">💵 សាច់ប្រាក់ (Cash) :</span>
                    <span>ទទួលប្រាក់សុទ្ធពីអតិថិជន និងកត់ត្រាការលក់ភ្លាមៗ។</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-red-600 dark:text-red-400 shrink-0">📱 ស្កេន KHQR (Bakong) :</span>
                    <span>បង្កើត QR Code ស្តង់ដារបាគងភ្លាមៗ អតិថិជនអាចស្កេនពីគ្រប់ធនាគារ (ABA, Acleda, Canadia, Wing, etc.) ជាមួយការផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ។</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-black text-amber-600 dark:text-amber-400 shrink-0">💳 ជំពាក់ / ឥណទាន (Credit) :</span>
                    <span>កត់ត្រាបំណុលចូលសមតុល្យរបស់អតិថិជន។ ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់មិនឱ្យជំពាក់លើសកំណត់ឥណទាន (Credit Limit) ឡើយ។</span>
                  </div>
                </div>
              </div>

              {/* Feature 6: Stock Auto-Deduct & Thermal Receipt Printing */}
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">6</span>
                  <span>{lang === 'km' ? 'ការកាត់ស្តុក & បោះពុម្ពវិក្កយបត្រ' : 'Stock Deduction & Receipt Printing'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  ក្រោយពេលចុច "✓ គិតប្រាក់" ប្រព័ន្ធនឹងកាត់ស្តុកទំនិញចេញពីឃ្លាំងដោយស្វ័យប្រវត្តិ និងបង្ហាញផ្ទាំងវិក្កយបត្រស្ដង់ដារកម្ដៅ (ESC/POS 80mm Receipt) ដែលអាចចុចបោះពុម្ពភ្លាមៗ ឬរក្សាទុកជា PDF។
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {lang === 'km' ? 'យល់ព្រម (បិទ)' : 'Got it (Close)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QrColorIcon() {
  return (
    <div className="h-4 w-4 rounded-sm bg-red-600 flex items-center justify-center text-white text-[9px] font-black">
      QR
    </div>
  );
}
