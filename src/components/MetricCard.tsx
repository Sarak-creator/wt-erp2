import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  highlight?: boolean;
  className?: string;
  badge?: string;
  badgeColor?: string;
}

export default function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-sky-600',
  iconBg = 'bg-sky-50 border-sky-100',
  change,
  highlight = false,
  className = '',
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
}: MetricCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md ${
        highlight
          ? 'border-sky-300/80 ring-1 ring-sky-500/10 shadow-sm shadow-sky-500/5'
          : 'border-slate-200/80 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-500 truncate">
              {title}
            </span>
            {badge && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 tabular-nums">
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg} ${iconColor} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="h-5 w-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold border-t border-slate-100/80 pt-3">
          {change.trend === 'up' && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="h-3.5 w-3.5" />
              {change.value}
            </span>
          )}
          {change.trend === 'down' && (
            <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md">
              <TrendingDown className="h-3.5 w-3.5" />
              {change.value}
            </span>
          )}
          {change.trend === 'neutral' && (
            <span className="inline-flex items-center gap-0.5 text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">
              <Minus className="h-3.5 w-3.5" />
              {change.value}
            </span>
          )}
          {change.label && (
            <span className="text-slate-400 font-normal truncate">
              {change.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
