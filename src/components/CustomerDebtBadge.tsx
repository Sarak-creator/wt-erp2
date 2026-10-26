import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatUSD, formatKHR } from '@/lib/utils';

export interface CustomerDebtBadgeProps {
  currentBalance: number;
  creditLimit: number;
  bottlesHeld?: number;
  showBottleCount?: boolean;
  compact?: boolean;
  className?: string;
}

export default function CustomerDebtBadge({
  currentBalance,
  creditLimit,
  bottlesHeld = 0,
  showBottleCount = true,
  compact = false,
  className = '',
}: CustomerDebtBadgeProps) {
  const isOverdue = currentBalance > creditLimit;
  const isNearLimit = !isOverdue && creditLimit > 0 && currentBalance >= creditLimit * 0.85;
  const hasDebt = currentBalance > 0;

  // Determine badge styling
  let badgeStyle = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    labelKm: 'គ្មានជំពាក់ (០ ៛)',
    labelEn: 'No Debt',
    status: 'good',
  };

  if (isOverdue) {
    badgeStyle = {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 ring-1 ring-rose-500/20',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      labelKm: `លើសកំណត់ ${formatKHR(currentBalance - creditLimit)}`,
      labelEn: `Over Limit ${formatKHR(currentBalance - creditLimit)}`,
      status: 'danger',
    };
  } else if (isNearLimit) {
    badgeStyle = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      labelKm: `ជិតពេញកំណត់ (${Math.round((currentBalance / creditLimit) * 100)}%)`,
      labelEn: `Near Limit (${Math.round((currentBalance / creditLimit) * 100)}%)`,
      status: 'warning',
    };
  } else if (hasDebt) {
    badgeStyle = {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      labelKm: `ជំពាក់ ${formatKHR(currentBalance)}`,
      labelEn: `Balance ${formatKHR(currentBalance)}`,
      status: 'info',
    };
  }

  const Icon = badgeStyle.icon;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle.bg} ${className}`}
        title={`Balance: ${formatKHR(currentBalance)} (${formatUSD(currentBalance)}) / Limit: ${formatKHR(creditLimit)}`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${badgeStyle.iconColor}`} />
        <span className="tabular-nums font-mono">
          {hasDebt ? formatKHR(currentBalance) : '0 ៛'}
        </span>
        {showBottleCount && bottlesHeld > 0 && (
          <span className="ml-1 pl-1 border-l border-current/20 text-[10px] font-normal">
            💧 {bottlesHeld} ធុង
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-2.5 text-xs transition-all ${badgeStyle.bg} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold">
          <Icon className={`h-4 w-4 shrink-0 ${badgeStyle.iconColor}`} />
          <span>{badgeStyle.labelKm}</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs font-black tabular-nums block">
            {formatKHR(currentBalance)}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            {formatUSD(currentBalance)}
          </span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium border-t border-current/10 pt-1.5">
        <span>កម្រិតឥណទាន (Limit): {formatKHR(creditLimit)}</span>
        {showBottleCount && (
          <span className="font-semibold text-slate-700">
            សំបកធុងនៅផ្ទះ: <span className="font-bold text-sky-700">{bottlesHeld}</span> ធុង
          </span>
        )}
      </div>
    </div>
  );
}
