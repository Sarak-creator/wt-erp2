'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { formatUSD, formatKHR } from '@/lib/utils';
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
} from 'lucide-react';
import CustomerDebtBadge from '@/components/CustomerDebtBadge';
import KhqrModal from '@/components/KhqrModal';

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
  const depositRate = 3.0; // $3 per returnable 20L bottle
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* LEFT COLUMN: Product Catalog (7 cols on desktop) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Search & Customer Selection Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Customer Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                {t.pos.searchCustomer}
              </label>
              <select
                value={selectedCustomerId || ''}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.business_name || c.phone} ({c.price_tier})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Search */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                {t.pos.searchProduct}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.pos.searchProduct}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Customer Credit Status Widget */}
          {selectedCustomer && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <CustomerDebtBadge
                currentBalance={selectedCustomer.current_balance}
                creditLimit={selectedCustomer.credit_limit}
                bottlesHeld={selectedCustomer.empty_bottles_held}
              />
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                onClick={() => addToCart(item)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                      {item.sku}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.qty_on_hand} {item.unit}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 line-clamp-1">
                    {lang === 'km' && item.name_kh ? item.name_kh : item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.name}
                  </p>
                </div>

                <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-base font-black text-slate-900">
                      {formatKHR(price)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatUSD(price)}
                    </span>
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 20L Bottle Deposit Modifier Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-300" />
                <h4 className="font-bold text-sm">
                  {lang === 'km'
                    ? 'ប្រាក់កក់ធុងទឹកថ្មី ($3.00/ធុង)'
                    : 'New 20L Gallon Cash Deposit ($3.00/bottle)'}
                </h4>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {lang === 'km'
                  ? 'គិតប្រាក់កក់បន្ថែមសម្រាប់អតិថិជនដែលពុំមានសំបកធុងដោះដូរ'
                  : 'Charge refundable deposit if customer has no empty exchange gallon'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1.5 self-start sm:self-auto">
              <button
                onClick={() => setDepositBottlesCount(Math.max(0, depositBottlesCount - 1))}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold text-base">
                {depositBottlesCount}
              </span>
              <button
                onClick={() => setDepositBottlesCount(depositBottlesCount + 1)}
                className="h-8 w-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center font-bold"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold pl-1 text-cyan-200">
                = {formatUSD(totalDeposit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart & Checkout Terminal (5 cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 justify-between">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">
                {lang === 'km' ? 'កន្ត្រកទំនិញ' : 'Current Sale Cart'}
              </h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {cart.length}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {lang === 'km' ? 'សម្អាត' : 'Clear'}
              </button>
            )}
          </div>

          {/* Cart Line Items */}
          <div className="my-3 max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <ShoppingCart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">{t.pos.cartEmpty}</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div
                  key={ci.item.id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-slate-800 block">
                      {lang === 'km' && ci.item.name_kh ? ci.item.name_kh : ci.item.name}
                    </span>
                    <span className="text-slate-500">
                      {formatUSD(ci.unitPrice)} / {ci.item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => updateCartQty(ci.item.id, ci.quantity - 1)}
                        className="px-2 py-1 hover:bg-slate-100 text-slate-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-slate-800">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(ci.item.id, ci.quantity + 1)}
                        className="px-2 py-1 hover:bg-slate-100 text-slate-700"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="w-20 text-right font-bold text-slate-900">
                      {formatKHR(ci.lineTotal)}
                    </span>

                    <button
                      onClick={() => removeFromCart(ci.item.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Bottom Summary & Checkout */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          {/* Subtotal & Deposit summary */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>{t.pos.subtotal}:</span>
              <span className="font-semibold text-slate-800">{formatKHR(subtotal)}</span>
            </div>
            {depositBottlesCount > 0 && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span>
                  {t.pos.depositCharge} ({depositBottlesCount}):
                </span>
                <span>+{formatKHR(totalDeposit)}</span>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>{t.pos.discount} ({discountPercent}%):</span>
                <span>-{formatKHR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-black text-slate-900">
              <span>{t.pos.totalPayable}:</span>
              <div className="text-right">
                <span className="text-blue-600">{formatKHR(grandTotal)}</span>
                <span className="text-xs text-slate-400 block font-normal">
                  {formatUSD(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              {lang === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Button 1: Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center min-h-[56px] py-2.5 px-2 rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg mb-0.5">💵</span>
                <span className="text-xs">{t.pos.payCash}</span>
              </button>

              {/* Button 2: KHQR */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('khqr');
                  setShowKhqrModal(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[56px] py-2.5 px-2 rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'khqr'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-sm ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg mb-0.5">📱</span>
                <span className="text-xs">ស្កេន KHQR</span>
              </button>

              {/* Button 3: Credit */}
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`flex flex-col items-center justify-center min-h-[56px] py-2.5 px-2 rounded-2xl border font-bold transition-all active:scale-95 ${
                  paymentMethod === 'credit'
                    ? isCreditExceeded
                      ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg mb-0.5">📝</span>
                <span className="text-xs">{t.pos.payCredit}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {(errorMessage || isCreditExceeded) && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage || t.pos.insufficientCredit}</span>
            </div>
          )}

          {/* Primary Action Button: Complete Sale */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCreditExceeded}
            className="w-full flex h-14 min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-sky-600 text-sm md:text-base font-black text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>✓ {t.pos.checkout} ({formatKHR(grandTotal)})</span>
          </button>
        </div>
      </div>

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
                    <span>@ {formatKHR(3)}</span>
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
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>USD EQUIV:</span>
                  <span>{formatUSD(receiptData.grandTotal)}</span>
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
