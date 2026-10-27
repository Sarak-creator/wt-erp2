'use client';

import React, { useState } from 'react';
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

  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculations
  const subtotal = cart.reduce((acc, ci) => acc + ci.lineTotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const depositRate = 12000; // 12,000 KHR per returnable 20L bottle
  const totalDeposit = depositBottlesCount * depositRate;
  const grandTotal = subtotal - discountAmount + totalDeposit;

  // Credit limit evaluation
  const remainingCredit = selectedCustomer
    ? selectedCustomer.credit_limit - selectedCustomer.current_balance
    : 0;
  const isCreditExceeded =
    paymentMethod === 'credit' && grandTotal > remainingCredit;

  // Filter finished goods
  const availableItems = inventory.filter(
    (item) =>
      (item.type === 'finished_good' || item.type === 'asset') &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.name_kh && item.name_kh.includes(searchTerm)))
  );

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
    setShowReceiptModal(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-3 sm:p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
      {/* Mobile / Tablet Segmented Switcher (< lg) */}
      <div className="lg:hidden col-span-1 flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'catalog'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{lang === 'km' ? 'ទំនិញលក់ (Catalog)' : 'Products'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all relative ${
            mobileTab === 'cart'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{lang === 'km' ? 'កន្ត្រកទំនិញ (Cart)' : 'Cart'}</span>
          {cart.length > 0 && (
            <span className="rounded-full bg-sky-600 text-white text-[10px] px-1.5 py-0.2 font-black ml-1 animate-pulse">
              {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* LEFT COLUMN: Product Catalog (7 cols on desktop) */}
      <div
        className={`lg:col-span-7 flex flex-col space-y-3 sm:space-y-4 ${
          mobileTab === 'catalog' ? 'block' : 'hidden lg:flex'
        }`}
      >
        {/* Search & Customer Selection Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
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
                  className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Customer Credit Status Widget */}
          {selectedCustomer && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <CustomerDebtBadge
                currentBalance={selectedCustomer.current_balance}
                creditLimit={selectedCustomer.credit_limit}
                bottlesHeld={selectedCustomer.empty_bottles_held}
              />
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-3">
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
                    <span className="rounded-md bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-300">
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
                    ? 'ប្រាក់កក់ធុងទឹកថ្មី (12,000 ៛/ធុង)'
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

      {/* RIGHT COLUMN: POS Cart & Checkout Terminal (5 cols on desktop, sticky) */}
      <div
        className={`lg:col-span-5 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3.5 sm:p-4 md:p-5 justify-between lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto ${
          mobileTab === 'cart' ? 'block' : 'hidden lg:flex'
        }`}
      >
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {lang === 'km' ? 'កន្ត្រកទំនិញ' : 'Current Sale Cart'}
              </h2>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                {cart.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileTab('catalog')}
                className="lg:hidden text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
              >
                ← {lang === 'km' ? 'បន្ថែមទំនិញ' : 'Add Items'}
              </button>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {lang === 'km' ? 'សម្អាត' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* Cart Line Items */}
          <div className="my-3 max-h-[260px] sm:max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 sm:py-10 text-slate-400">
                <ShoppingCart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs sm:text-sm">{t.pos.cartEmpty}</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div
                  key={ci.item.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2 sm:p-2.5 text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                      {lang === 'km' && ci.item.name_kh ? ci.item.name_kh : ci.item.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {formatKHR(ci.unitPrice)} / {ci.item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQty(ci.item.id, ci.quantity - 1)}
                        className="px-1.5 sm:px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 sm:w-7 text-center font-bold text-slate-800 dark:text-slate-100 text-xs">
                        {ci.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(ci.item.id, ci.quantity + 1)}
                        className="px-1.5 sm:px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="w-16 sm:w-20 text-right font-bold text-slate-900 dark:text-white text-xs">
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
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Subtotal & Deposit summary */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
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
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>{t.pos.discount} ({discountPercent}%):</span>
                <span>-{formatKHR(discountAmount)}</span>
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
            <div className="grid grid-cols-3 gap-2">
              {/* Button 1: Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[56px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-base sm:text-lg mb-0.5">💵</span>
                <span className="text-[11px] sm:text-xs truncate">{t.pos.payCash}</span>
              </button>

              {/* Button 2: KHQR */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('khqr');
                  setShowKhqrModal(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[56px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'khqr'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 shadow-sm ring-2 ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-base sm:text-lg mb-0.5">📱</span>
                <span className="text-[11px] sm:text-xs truncate">ស្កេន KHQR</span>
              </button>

              {/* Button 3: Credit */}
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`flex flex-col items-center justify-center min-h-[50px] sm:min-h-[56px] py-2 px-1 rounded-xl sm:rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'credit'
                    ? isCreditExceeded
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-base sm:text-lg mb-0.5">📝</span>
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
            className="w-full flex h-12 md:h-14 items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-sky-600 text-xs sm:text-sm md:text-base font-black text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
          >
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>✓ {t.pos.checkout} ({formatKHR(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile when on Catalog (< lg) */}
      {mobileTab === 'catalog' && cart.length > 0 && (
        <div className="fixed bottom-20 left-3 right-3 z-30 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="w-full flex items-center justify-between bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-sky-600/40 font-bold active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {cart.reduce((sum, ci) => sum + ci.quantity, 0)}
              </span>
              <span className="text-xs">{lang === 'km' ? 'មើលកន្ត្រកទំនិញ' : 'View Cart & Checkout'}</span>
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
