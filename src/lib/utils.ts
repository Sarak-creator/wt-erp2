import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKHR(amountUSD: number, rate = 4100): string {
  const khr = Math.round(amountUSD * rate);
  return `${new Intl.NumberFormat('km-KH').format(khr)} ៛`;
}

export function formatRielAmount(riel: number): string {
  return `${new Intl.NumberFormat('km-KH').format(Math.round(riel))} ៛`;
}

export function formatMoney(amountUSD: number, rate = 4100): string {
  // Default currency is Khmer Riel (៛)
  return formatKHR(amountUSD, rate);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
