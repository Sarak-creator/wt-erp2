'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Share,
  PlusSquare,
  Compass,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');

  useEffect(() => {
    // Check if app is already running in standalone/installed mode
    if (typeof window !== 'undefined') {
      const isAppStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isAppStandalone);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    }
  };

  const copyStartCommand = () => {
    navigator.clipboard.writeText('npm run dev');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 px-5 py-4 sm:p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner text-white">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold">ដំឡើង Shortcut App (Install App)</h3>
                <span className="rounded-full bg-emerald-400/20 border border-emerald-300/30 px-2 py-0.5 text-xs font-medium text-emerald-200">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100 mt-0.5">
                ដំឡើងកម្មវិធីនៅលើ Desktop, Android, ឬ iPhone ដើម្បីបើកប្រើប្រាស់រហ័ស គ្មានរបារ Browser
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Status Alert if Already Installed */}
          {isStandalone && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>ប្រព័ន្ធកំពុងដំណើរការក្នុងទម្រង់ **Standalone App** រួចជាស្រេច!</span>
            </div>
          )}

          {/* 1-Click Native Install Prompt (When available from browser) */}
          {deferredPrompt && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    អាចដំឡើងបានភ្លាមៗ (One-Click Install)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ចុចប៊ូតុងខាងក្រោមដើម្បីដំឡើង Shortcut លើអេក្រង់ឧបករណ៍របស់អ្នក
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all shrink-0 flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                ដំឡើងឥឡូវនេះ
              </button>
            </div>
          )}

          {/* Device Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Monitor className="h-4 w-4" />
              Windows / Mac
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Android
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              iPhone / iPad
            </button>
          </div>

          {/* Tab Content: Windows / Desktop */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Shortcut លើ Windows Desktop ត្រូវបានបង្កើតរួចរាល់៖</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-6 list-disc">
                  <li>
                    <span className="font-semibold text-slate-900 dark:text-white">Water-ERP.lnk</span> : បើកប្រព័ន្ធទឹកក្នុងទម្រង់ App លើ Chrome/Edge (គ្មានរបារ Browser)
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900 dark:text-white">Start-Water-ERP.lnk</span> : ដំណើរការ Server និងបើក App ក្នុងពេលតែមួយដោយស្វ័យប្រវត្តិ
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900 dark:text-white">Water Factory ERP.url</span> : Web Shortcut ផ្ទាល់លើ Desktop
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2 text-xs">
                <div className="font-semibold text-blue-900 dark:text-blue-300">
                  💡 របៀបដំឡើងតាម Google Chrome ឬ Microsoft Edge៖
                </div>
                <ol className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-4 list-decimal">
                  <li>សង្កេតមើលខាងស្ដាំនៃរបារ URL (Address bar) នឹងឃើញរូបតំណាង ⊕ ឬកុំព្យូទ័រដំឡើង</li>
                  <li>ចុចលើប៊ូតុងនោះ ហើយជ្រើសរើស <strong>«Install»</strong> ឬ <strong>«ដំឡើង»</strong></li>
                  <li>ឬចុចលើចុច ៣ (Menu ➔ Save and share / More tools ➔ <strong>Create shortcut...</strong> ហើយគូសធីក <i>Open as window</i>)</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab Content: Android */}
          {activeTab === 'android' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-500" />
                <span>របៀបដំឡើងលើទូរស័ព្ទ ឬ Tablet Android (Samsung, Xiaomi, Oppo, etc.)</span>
              </div>
              <ol className="space-y-2 text-slate-700 dark:text-slate-300 pl-4 list-decimal">
                <li>បើកកម្មវិធី <strong>Google Chrome</strong> នៅលើទូរស័ព្ទរបស់អ្នក</li>
                <li>ចុចលើសញ្ញាចុច ៣ (Menu) នៅជ្រុងខាងស្ដាំខាងលើបង្អស់</li>
                <li>
                  ជ្រើសរើសយក <strong>«Add to Home screen»</strong> (ឬ <strong>«Install app»</strong>)
                </li>
                <li>ចុច <strong>Install</strong> — កម្មវិធីនឹងបង្ហាញរូបតំណាងទឹកបរិសុទ្ធលើអេក្រង់ដើមទូរស័ព្ទភ្លាម!</li>
              </ol>
            </div>
          )}

          {/* Tab Content: iOS (iPhone / iPad) */}
          {activeTab === 'ios' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Share className="h-4 w-4 text-blue-500" />
                <span>របៀបដំឡើងលើ Apple iPhone ឬ iPad (iOS Safari)</span>
              </div>
              <ol className="space-y-2 text-slate-700 dark:text-slate-300 pl-4 list-decimal">
                <li>បើកវេបសាយនេះនៅលើ Browser <strong>Safari</strong> (នៅលើ iPhone/iPad)</li>
                <li>
                  ចុចលើប៊ូតុង <strong>Share</strong> (រូបសញ្ញាប្រអប់ដែលមានព្រួញចង្អុលឡើងលើ ⎋ នៅខាងក្រោម)
                </li>
                <li>
                  អូសចុះក្រោមបន្តិច រួចចុចលើពាក្យ <strong>«Add to Home Screen»</strong> (បន្ថែមទៅអេក្រង់ដើម ➕)
                </li>
                <li>ចុចពាក្យ <strong>Add</strong> នៅជ្រុងខាងស្ដាំលើ — រួចរាល់!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Version: PWA v2.4 Standalone Ready
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            យល់ព្រម / បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
