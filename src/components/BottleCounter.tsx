'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface BottleCounterProps {
  label: string;
  subLabel?: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  variant?: 'sky' | 'emerald' | 'amber' | 'slate';
  presets?: number[];
  disabled?: boolean;
}

export default function BottleCounter({
  label,
  subLabel,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit = 'ធុង',
  variant = 'sky',
  presets = [5, 10, 20, 50],
  disabled = false,
}: BottleCounterProps) {
  const handleDecrement = () => {
    if (disabled) return;
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const colorStyles = {
    sky: {
      border: 'border-sky-200/80 focus-within:border-sky-500 ring-sky-500/10',
      btn: 'bg-sky-50 text-sky-700 hover:bg-sky-100 active:bg-sky-200',
      text: 'text-sky-950',
      badge: 'bg-sky-100 text-sky-800',
    },
    emerald: {
      border: 'border-emerald-200/80 focus-within:border-emerald-500 ring-emerald-500/10',
      btn: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200',
      text: 'text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
      border: 'border-amber-200/80 focus-within:border-amber-500 ring-amber-500/10',
      btn: 'bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200',
      text: 'text-amber-950',
      badge: 'bg-amber-100 text-amber-800',
    },
    slate: {
      border: 'border-slate-200/80 focus-within:border-slate-500 ring-slate-500/10',
      btn: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
      text: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-700',
    },
  }[variant];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs md:text-sm font-bold text-slate-800 block">
            {label}
          </span>
          {subLabel && (
            <span className="text-[11px] text-slate-400 block font-normal">
              {subLabel}
            </span>
          )}
        </div>
        {unit && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${colorStyles.badge}`}>
            {unit}
          </span>
        )}
      </div>

      {/* Stepper with Large 48px+ touch targets */}
      <div
        className={`flex items-center rounded-2xl border bg-white p-1.5 shadow-sm transition-all focus-within:ring-2 ${colorStyles.border}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease"
          className={`flex h-12 w-14 min-h-[48px] items-center justify-center rounded-xl font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 ${colorStyles.btn}`}
        >
          <Minus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <div className="flex-1 text-center">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange(isNaN(val) ? 0 : Math.max(min, Math.min(max, val)));
            }}
            className={`w-full bg-transparent text-center text-2xl md:text-3xl font-black tabular-nums tracking-tight outline-none ${colorStyles.text}`}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase"
          className={`flex h-12 w-14 min-h-[48px] items-center justify-center rounded-xl font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 ${colorStyles.btn}`}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Quick Tap Presets */}
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
            រហ័ស:
          </span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all active:scale-95 ${
                value === preset
                  ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              +{preset}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled || value === 0}
            onClick={() => onChange(0)}
            className="ml-auto text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
          >
            ជម្រះ
          </button>
        </div>
      )}
    </div>
  );
}
