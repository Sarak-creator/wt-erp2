'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, OrderStatus } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  DollarSign,
  Package,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';

export default function OrdersView() {
  const { lang, orders, customers, deliveryZones, updateOrderStatus, fetchFromSupabase, isSyncing } =
    useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {lang === 'km' ? 'បានប្រគល់' : 'Delivered'}
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Truck className="w-3 h-3" />
            {lang === 'km' ? 'កំពុងដឹកជញ្ជូន' : 'Dispatched'}
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            {lang === 'km' ? 'បានបញ្ជាក់' : 'Confirmed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3" />
            {lang === 'km' ? 'បានលុបចោល' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const cust = customers.find((c) => c.id === order.customer_id);
    const matchesSearch =
      order.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust && cust.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការគ្រប់គ្រងការបញ្ជាទិញ' : 'Customer Orders & Sales History'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'តាមដានវិក្កយបត្រ ស្ថានភាពដឹកជញ្ជូន និងការប្រមូលសំបកដបទូទាំងរាជធានី'
              : 'Track invoices, logistics status, empty bottle returns, and payments'}
          </p>
        </div>

        <button
          onClick={() => fetchFromSupabase()}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកលេខវិក្កយបត្រ ឬឈ្មោះ...' : 'Search invoice # or customer...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: lang === 'km' ? 'ទាំងអស់' : 'All' },
            { id: 'confirmed', label: lang === 'km' ? 'បានបញ្ជាក់' : 'Confirmed' },
            { id: 'dispatched', label: lang === 'km' ? 'កំពុងដឹក' : 'Dispatched' },
            { id: 'delivered', label: lang === 'km' ? 'បានប្រគល់' : 'Delivered' },
            { id: 'cancelled', label: lang === 'km' ? 'លុបចោល' : 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">{lang === 'km' ? 'វិក្កយបត្រ' : 'Invoice'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'អតិថិជន' : 'Customer'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'តំបន់' : 'Zone'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ដបប្រគល់/យកមកវិញ' : 'Bottles Out/In'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'សរុបទឹកប្រាក់' : 'Total'}</th>
                <th className="px-6 py-4">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const cust = customers.find((c) => c.id === order.customer_id);
                const zone = deliveryZones.find((z) => z.id === order.zone_id);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.invoice_number}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(order.created_at || order.delivery_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{cust?.name || 'Walk-in Customer'}</div>
                      {cust?.phone && <div className="text-xs text-slate-400">{cust.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {zone?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <span className="text-blue-600 font-bold">{order.bottles_delivered || 0} Out</span>
                      {' / '}
                      <span className="text-emerald-600 font-bold">{order.bottles_returned || 0} In</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{formatKHR(order.total_amount)}</div>
                      <span className="text-[11px] text-slate-400 block">${order.total_amount.toFixed(2)}</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          order.payment_status === 'paid'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'dispatched' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition mr-2"
                        >
                          {lang === 'km' ? 'ប្រគល់រួច' : 'Mark Delivered'}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'dispatched')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition mr-2"
                        >
                          {lang === 'km' ? 'បញ្ជូនដឹក' : 'Dispatch'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    {lang === 'km' ? 'មិនមានការបញ្ជាទិញទេ' : 'No orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
