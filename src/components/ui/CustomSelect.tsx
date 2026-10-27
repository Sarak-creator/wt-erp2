'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  searchable?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  icon: LeftIcon,
  searchable = false,
  size = 'sm',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options if searchable
  const filteredOptions = searchable && searchTerm
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  // Size styling maps
  const sizeStyles = {
    xs: {
      button: 'h-6 px-2 py-0.5 text-[11px] rounded-md',
      icon: 'h-3 w-3',
      item: 'px-1.5 py-0.5 text-[11px] rounded',
      badge: 'text-[8px] px-1 py-0.2',
    },
    sm: {
      button: 'h-8 px-2.5 py-1 text-xs rounded-lg',
      icon: 'h-3.5 w-3.5',
      item: 'px-2 py-1 text-xs rounded-md',
      badge: 'text-[9px] px-1.5 py-0.2',
    },
    md: {
      button: 'h-8 md:h-9 px-3 py-1.5 text-xs md:text-sm rounded-lg',
      icon: 'h-3.5 w-3.5',
      item: 'px-2.5 py-1.5 text-xs md:text-sm rounded-lg',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      button: 'h-10 px-3.5 py-2 text-sm rounded-xl',
      icon: 'h-4 w-4',
      item: 'px-3 py-2 text-sm rounded-lg',
      badge: 'text-xs px-2 py-0.5',
    },
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 font-medium text-slate-800 dark:text-slate-100 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles.button} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon ? (
            <selectedOption.icon className={`${sizeStyles.icon} shrink-0 text-blue-600 dark:text-blue-400`} />
          ) : LeftIcon ? (
            <LeftIcon className={`${sizeStyles.icon} shrink-0 text-slate-400 dark:text-slate-500`} />
          ) : null}

          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span
              className={`rounded-md font-semibold ${sizeStyles.badge} ${
                selectedOption.badgeColor || 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`${sizeStyles.icon} shrink-0 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Floating Menu Card */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1 w-full min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xl backdrop-blur-xl z-50 transition-all animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {/* Search box if searchable */}
          {searchable && (
            <div className="p-1 mb-1">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរក / Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md bg-slate-100 dark:bg-slate-800 pl-7 pr-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 py-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xs text-slate-400">
                រកមិនឃើញទិន្នន័យ / No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 text-left transition-all ${sizeStyles.item} ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && (
                        <OptIcon
                          className={`${sizeStyles.icon} shrink-0 ${
                            isSelected
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span
                          className={`rounded-md font-semibold ${sizeStyles.badge} ${
                            opt.badgeColor ||
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
