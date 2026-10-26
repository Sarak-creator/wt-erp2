'use client';

import React, { useState, useEffect } from 'react';
import { formatUSD, formatKHR } from '@/lib/utils';
import {
  QrCode,
  CheckCircle2,
  X,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Building,
} from 'lucide-react';

export interface KhqrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amountUSD: number;
  customerName?: string;
  invoiceNumber?: string;
  merchantName?: string;
}

export default function KhqrModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amountUSD,
  customerName = 'អតិថិជនទូទៅ',
  invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000),
  merchantName = 'សហគ្រាសទឹកបរិសុទ្ធ ខ្មែរ អង្គរ (KHMER ANGKOR PURE WATER)',
}: KhqrModalProps) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes expiration

  const amountKHR = Math.round(amountUSD * 4100);

  // Countdown timer for dynamic KHQR
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsVerifying(false);
      setCountdown(180);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1200);
    }, 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText?.(
      `00020101021229370016kh.gov.nbc.bakong0112purewater@aclb0208${amountKHR}5303840540${amountUSD}5802KH5925KHMER ANGKOR WATER6010PHNOM PENH62200716${invoiceNumber}6304`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-100 text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          /* Payment Success State */
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              ទូទាត់ជោគជ័យ!
            </h3>
            <p className="text-xs text-slate-500">
              Payment received successfully via Bakong KHQR
            </p>
            <div className="my-4 rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 block">
                ទឹកប្រាក់ទទួលបាន
              </span>
              <span className="text-2xl font-black text-emerald-800 tabular-nums">
                {formatKHR(amountUSD)}
              </span>
              <span className="text-xs text-emerald-600 block tabular-nums">
                ({formatUSD(amountUSD)})
              </span>
            </div>
          </div>
        ) : (
          /* Main KHQR Display */
          <div className="space-y-4">
            {/* Header / Merchant Header */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-black shadow-xs mb-2">
                <span>KHQR</span>
                <span className="text-[10px] font-normal opacity-90">Bakong</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {merchantName}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                វិក្កយបត្រ: <span className="font-mono font-semibold">{invoiceNumber}</span> • {customerName}
              </p>
            </div>

            {/* Price Banner */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                ទឹកប្រាក់ត្រូវទូទាត់ (Amount Due)
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="text-3xl font-black text-red-600 tracking-tight tabular-nums">
                  {formatKHR(amountUSD)}
                </span>
                <span className="text-sm font-bold text-slate-500 tabular-nums">
                  / {formatUSD(amountUSD)}
                </span>
              </div>
            </div>

            {/* QR Code Container with Bakong Center Icon */}
            <div className="relative mx-auto flex w-60 h-60 items-center justify-center rounded-2xl border-2 border-red-500/20 bg-white p-3 shadow-inner">
              {/* SVG QR Code Illustration */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-slate-900"
                fill="currentColor"
              >
                {/* Simulated high-fidelity QR Pattern with Positioning Markers */}
                <rect x="10" y="10" width="50" height="50" rx="6" fill="#D32F2F" />
                <rect x="20" y="20" width="30" height="30" rx="3" fill="#FFFFFF" />
                <rect x="26" y="26" width="18" height="18" rx="2" fill="#D32F2F" />

                <rect x="140" y="10" width="50" height="50" rx="6" fill="#D32F2F" />
                <rect x="150" y="20" width="30" height="30" rx="3" fill="#FFFFFF" />
                <rect x="156" y="26" width="18" height="18" rx="2" fill="#D32F2F" />

                <rect x="10" y="140" width="50" height="50" rx="6" fill="#D32F2F" />
                <rect x="20" y="150" width="30" height="30" rx="3" fill="#FFFFFF" />
                <rect x="26" y="156" width="18" height="18" rx="2" fill="#D32F2F" />

                {/* Data modules grid mockup */}
                <g fill="#1E293B">
                  <rect x="70" y="15" width="8" height="8" rx="1" />
                  <rect x="85" y="15" width="8" height="8" rx="1" />
                  <rect x="100" y="15" width="8" height="8" rx="1" />
                  <rect x="115" y="15" width="8" height="8" rx="1" />
                  <rect x="70" y="30" width="8" height="8" rx="1" />
                  <rect x="90" y="30" width="8" height="8" rx="1" />
                  <rect x="110" y="30" width="8" height="8" rx="1" />
                  <rect x="75" y="45" width="8" height="8" rx="1" />
                  <rect x="105" y="45" width="8" height="8" rx="1" />
                  <rect x="15" y="70" width="8" height="8" rx="1" />
                  <rect x="30" y="70" width="8" height="8" rx="1" />
                  <rect x="50" y="70" width="8" height="8" rx="1" />
                  <rect x="70" y="70" width="8" height="8" rx="1" />
                  <rect x="95" y="70" width="8" height="8" rx="1" />
                  <rect x="125" y="70" width="8" height="8" rx="1" />
                  <rect x="155" y="70" width="8" height="8" rx="1" />
                  <rect x="175" y="70" width="8" height="8" rx="1" />
                  <rect x="15" y="90" width="8" height="8" rx="1" />
                  <rect x="40" y="90" width="8" height="8" rx="1" />
                  <rect x="145" y="90" width="8" height="8" rx="1" />
                  <rect x="175" y="90" width="8" height="8" rx="1" />
                  <rect x="15" y="110" width="8" height="8" rx="1" />
                  <rect x="35" y="110" width="8" height="8" rx="1" />
                  <rect x="55" y="110" width="8" height="8" rx="1" />
                  <rect x="140" y="110" width="8" height="8" rx="1" />
                  <rect x="165" y="110" width="8" height="8" rx="1" />
                  <rect x="70" y="130" width="8" height="8" rx="1" />
                  <rect x="90" y="130" width="8" height="8" rx="1" />
                  <rect x="120" y="130" width="8" height="8" rx="1" />
                  <rect x="140" y="130" width="8" height="8" rx="1" />
                  <rect x="170" y="130" width="8" height="8" rx="1" />
                  <rect x="70" y="150" width="8" height="8" rx="1" />
                  <rect x="100" y="150" width="8" height="8" rx="1" />
                  <rect x="130" y="150" width="8" height="8" rx="1" />
                  <rect x="160" y="150" width="8" height="8" rx="1" />
                  <rect x="70" y="170" width="8" height="8" rx="1" />
                  <rect x="90" y="170" width="8" height="8" rx="1" />
                  <rect x="110" y="170" width="8" height="8" rx="1" />
                  <rect x="140" y="170" width="8" height="8" rx="1" />
                  <rect x="175" y="170" width="8" height="8" rx="1" />
                </g>

                {/* Center Red KHQR Logo */}
                <rect x="76" y="76" width="48" height="48" rx="8" fill="#D32F2F" />
                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  KHQR
                </text>
              </svg>

              {/* Status Overlay if verifying */}
              {isVerifying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xs">
                  <RefreshCw className="h-8 w-8 animate-spin text-red-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    កំពុងផ្ទៀងផ្ទាត់...
                  </span>
                </div>
              )}
            </div>

            {/* Live Status and Timer */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                រង់ចាំស្កេន...
              </span>
              <span className="font-mono text-slate-400">
                សុពលភាព: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isVerifying}
                className="w-full flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>ក្លែងធ្វើការស្កេនជោគជ័យ (Simulate Paid)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">បានចម្លងកូដ KHQR</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>ចម្លងកូដ KHQR String</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
