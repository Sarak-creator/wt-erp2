'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  BookOpen,
  Search,
  ShoppingCart,
  Package,
  Truck,
  Factory,
  BarChart3,
  Users,
  Boxes,
  CreditCard,
  Receipt,
  UserCheck,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Tag,
  Gift,
  QrCode,
  DollarSign,
  Printer,
  Database,
  ArrowRight,
  Info,
  HelpCircle,
  Smartphone,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface GuideSection {
  id: string;
  category: string;
  titleKh: string;
  titleEn: string;
  badge: string;
  badgeColor: string;
  icon: any;
  targetRoles: string[];
  summaryKh: string;
  stepsKh: string[];
  keyFeaturesKh: { title: string; desc: string }[];
  proTipsKh?: string[];
}

export default function UserGuideView() {
  const { lang, currentRole } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const categories = [
    { id: 'all', labelKh: 'ទាំងអស់ (All Modules)', labelEn: 'All Modules' },
    { id: 'sales', labelKh: '🛒 ការលក់ & POS', labelEn: 'Sales & POS' },
    { id: 'production', labelKh: '🏭 ផលិតកម្ម & សំបកធុង', labelEn: 'Production & Bottles' },
    { id: 'logistics', labelKh: '🚚 ដឹកជញ្ជូន & Dispatch', labelEn: 'Logistics' },
    { id: 'finance', labelKh: '💰 ហិរញ្ញវត្ថុ បំណុល & ចំណាយ', labelEn: 'Finance & Debts' },
    { id: 'warehouse', labelKh: '📦 ឃ្លាំង & វត្ថុធាតុដើម', labelEn: 'Warehouse & Stock' },
    { id: 'system', labelKh: '⚙️ ការកំណត់ & សុវត្ថិភាព', labelEn: 'System & Cloud' },
  ];

  const guideData: GuideSection[] = [
    {
      id: 'pos',
      category: 'sales',
      titleKh: 'ប្រព័ន្ធលក់ទំនិញរហ័ស (Point of Sale - POS)',
      titleEn: 'Point of Sale (POS)',
      badge: 'Core Sale',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      icon: ShoppingCart,
      targetRoles: ['admin', 'cashier', 'accountant'],
      summaryKh:
        'ម៉ូឌុលលក់ទំនិញរហ័សនៅបញ្ជររោងចក្រ គាំទ្រការស្កេន KHQR, សាច់ប្រាក់, ការជំពាក់, ប្រាក់កក់ធុងទឹក ២០L, បញ្ចុះតម្លៃ ៣ ជម្រើស និងការចេញវិក្កយបត្រកម្ដៅ 80mm ESC/POS ភ្លាមៗ។',
      stepsKh: [
        'ជ្រើសរើសអតិថិជនពីបញ្ជី (ដើម្បីឱ្យប្រព័ន្ធកំណត់តម្លៃដុំ/រាយស្វ័យប្រវត្តិ) ឬទុកចោលជាអតិថិជនទូទៅ។',
        'ចុចលើមុខទំនិញក្នុង Catalog ដើម្បីបញ្ចូលទៅក្នុងកន្ត្រក។ អាចស្វែងរកតាមឈ្មោះ ឬ Filter តាមប្រភេទ។',
        'ប្រសិនបើអតិថិជនជាវធុង ២០L ថ្មីដោយគ្មានសំបកដោះដូរ សូមចុច `+` លើ "ប្រាក់កក់ធុងទឹក ២០L ថ្មី (12,000 ៛/ធុង)"។',
        'កំណត់ការបញ្ចុះតម្លៃបើមាន៖ ភាគរយ (%) ឬ សាច់ប្រាក់រៀល (៛) ឬ ឥតគិតថ្លៃ (100% Free)។',
        'ជ្រើសរើសវិធីសាស្ត្រទូទាត់ (លុយសុទ្ធ, ស្កេន KHQR Bakong, ឬ ជំពាក់) រួចចុច "✓ គិតប្រាក់" ដើម្បីបញ្ចប់ និងបោះពុម្ពវិក្កយបត្រ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ប្រព័ន្ធបញ្ចុះតម្លៃពហុទម្រង់ ៣ បែប',
          desc: 'គាំទ្រការបញ្ចុះតម្លៃជា % (0-100%), ជាលុយរៀលសុទ្ធ (500៛, 1,000៛...) ឬឥតគិតថ្លៃ ១០០% សម្រាប់កម្មវិធីឧបត្ថម្ភ។',
        },
        {
          title: 'ស្កេន KHQR ស្វ័យប្រវត្តិ',
          desc: 'បង្កើត QR Code តាមស្ដង់ដារបាគង (KHQR) អតិថិជនអាចស្កេនពីគ្រប់ធនាគារ (ABA, Acleda, Wing, etc.) ជាមួយការផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ។',
        },
        {
          title: 'កន្ត្រកទំនិញ Scroll ពេញលេញ',
          desc: 'រចនាឡើងឱ្យ Scroll ឡើងចុះលើផ្ទាំង Cart ទាំងមូលបានយ៉ាងរលូន មិនបាំងប៊ូតុង Checkout និងគ្មានការរំខាន Scroll ឆ្វេងស្ដាំ។',
        },
      ],
      proTipsKh: [
        'ប្រើ Keyboard Shortcut ឬប៉ះបញ្ជាលើ Touchscreen ងាយស្រួល និងរហ័សបំផុត។',
        'ប្រសិនបើអតិថិជនជំពាក់លើសពីកំណត់ឥណទាន (Credit Limit) ប្រព័ន្ធនឹង Lock ប៊ូតុងគិតលុយ ដើម្បីការពារបំណុលវណ្ឌក។',
      ],
    },
    {
      id: 'bottles',
      category: 'production',
      titleKh: 'គ្រប់គ្រងចរាចរណ៍សំបកធុង ២០L (Bottle Ledger)',
      titleEn: '20L Bottle Circulation & Ledger',
      badge: 'Asset Security',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
      icon: Package,
      targetRoles: ['admin', 'inventory_manager', 'cashier', 'driver'],
      summaryKh:
        'ការពារការបាត់បង់សំបកធុងទឹក ២០L របស់រោងចក្រ តាមដានចរាចរណ៍ធុងចេញ-ចូល ធុងនៅជាមួយអតិថិជន ធុងលើរថយន្ត និងប្រាក់កក់សំបកធុង។',
      stepsKh: [
        'ពិនិត្យសមតុល្យធុងសរុបទាំង ៤ ផ្នែក៖ នៅក្នុងរោងចក្រ, នៅជាមួយអតិថិជន, នៅលើឡានដឹក, និងធុងបែកបាក់។',
        'នៅពេលអតិថិជនយកសំបកធុងចាស់មកដោះដូរ កត់ត្រាជា "ធុងចូល (Incoming Empty)"។',
        'នៅពេលអតិថិជនដឹកទឹកចេញ កត់ត្រាជា "ធុងពេញចេញ (Outgoing Full)"។',
        'កត់ត្រាការសងប្រាក់កក់វិញនៅពេលអតិថិជនឈប់ប្រើប្រាស់ និងប្រគល់សំបកធុងមកវិញគ្រប់ចំនួន។',
      ],
      keyFeaturesKh: [
        {
          title: 'បញ្ជីសមតុល្យធុងតាមអតិថិជន',
          desc: 'មើលឃើញច្បាស់ថាតើអតិថិជនណា ឬដេប៉ូណា កំពុងកាន់កាប់សំបកធុងរោងចក្រចំនួនប៉ុន្មាន។',
        },
        {
          title: 'ប្រព័ន្ធគណនាប្រាក់កក់ 12,000 ៛/ធុង',
          desc: 'ផ្សារភ្ជាប់ដោយស្វ័យប្រវត្តជាមួយ POS និងវិក្កយបត្រលក់។',
        },
        {
          title: 'តាមដានការខូចខាត & បែកបាក់',
          desc: 'កត់ត្រាធុងដែលខូចគុណភាព ឬបែកបាក់ ដើម្បីដកចេញពីបញ្ជីទ្រព្យសកម្មសកម្ម។',
        },
      ],
      proTipsKh: [
        'រៀងរាល់ចុងសប្តាហ៍ គួរផ្ទៀងផ្ទាត់ចំនួនសំបកធុងដែលអ្នកដឹកជញ្ជូនយកមកវិញ ធៀបនឹងចំនួនទឹកដែលបានដឹកចេញ។',
      ],
    },
    {
      id: 'manufacturing',
      category: 'production',
      titleKh: 'សង្វាក់ផលិតកម្មទឹកបរិសុទ្ធ (Manufacturing & QC)',
      titleEn: 'Manufacturing & Quality Control',
      badge: 'Production',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      icon: Factory,
      targetRoles: ['admin', 'inventory_manager'],
      summaryKh:
        'គ្រប់គ្រងការផលិតទឹកបរិសុទ្ធប្រចាំថ្ងៃ ចាប់ពីការបន្សុទ្ធទឹកតាមប្រព័ន្ធ RO, ការលាងសម្អាតធុង, ការច្រក និងការត្រួតពិនិត្យគុណភាព (TDS, pH, Ozone) តាមស្ដង់ដារក្រសួងឧស្សាហកម្ម។',
      stepsKh: [
        'ចុច "បង្កើតបាច់ផលិតកម្មថ្មី (New Batch)" រួចជ្រើសរើសប្រភេទទឹក (ធុង ២០L, ដប ៣៥០ml, ដប ៥០០ml)។',
        'បញ្ចូលចំនួនគ្រោងផលិត និងពិនិត្យស្តុកវត្ថុធាតុដើម (គម្រប, ផ្លាកសញ្ញា, ខ្សែប្លាស្ទិក)។',
        'កត់ត្រាសន្ទស្សន៍គុណភាពទឹក (TDS, pH, Ozone) មុនពេលអនុញ្ញាតឱ្យច្រក។',
        'ចុច "បញ្ចប់ការផលិត" ដើម្បីបញ្ចូលបរិមាណទឹកសម្រេចចូលក្នុងឃ្លាំងស្តុកទំនិញស្វ័យប្រវត្តិ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ការកាត់ស្តុកវត្ថុធាតុដើមស្វ័យប្រវត្តិ',
          desc: 'ផលិតទឹក ២០L ចំនួន ៥០០ ធុង នឹងកាត់គម្របធុង ៥០០ និងផ្លាកសញ្ញា ៥០០ ចេញពីស្តុកភ្លាមៗ។',
        },
        {
          title: 'កត់ត្រាសន្ទស្សន៍ QC តាមបាច់ផលិត',
          desc: 'រក្សាប្រវត្តិ TDS, pH តាមកាលបរិច្ឆេទ ធានាបាននូវសុវត្ថិភាពទឹកតាមស្ដង់ដារជាតិ។',
        },
      ],
    },
    {
      id: 'logistics',
      category: 'logistics',
      titleKh: 'ចាត់ចែងរថយន្តដឹកជញ្ជូន & អ្នកបើកបរ (Driver Dispatch)',
      titleEn: 'Driver Dispatch & Route Logistics',
      badge: 'Logistics',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
      icon: Truck,
      targetRoles: ['admin', 'driver', 'inventory_manager'],
      summaryKh:
        'គ្រប់គ្រងការចាត់ចែងរថយន្តដឹកទឹកតាមតម្រាយផ្លូវ ការផ្ទៀងផ្ទាត់ទំនិញលើឡាន សាច់ប្រាក់ដែលប្រមូលបាន និងសំបកធុងដែលយកត្រឡប់មកវិញ។',
      stepsKh: [
        'ជ្រើសរើសរថយន្ត និងអ្នកបើកបរ រួចបញ្ចូលចំនួនទឹកពេញដែលត្រូវផ្ទុកឡើងឡាន។',
        'ចាត់ចែងតម្រាយផ្លូវដឹកជញ្ជូន (ឧ. ខណ្ឌទួលគោក, ខណ្ឌបឹងកេងកង) ជាមួយបញ្ជីវិក្កយបត្រដែលត្រូវទម្លាក់។',
        'នៅពេលអ្នកបើកបរត្រឡប់មកវិញ ធ្វើការផ្ទៀងផ្ទាត់ (Reconciliation)៖ ទឹកលក់អស់, សាច់ប្រាក់ប្រមូលបាន, និងសំបកធុងត្រឡប់មកវិញ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ផ្ទៀងផ្ទាត់សាច់ប្រាក់ប្រចាំថ្ងៃ',
          desc: 'ការពារការបាត់បង់លុយតាមរយៈការផ្ទៀងផ្ទាត់ចំនួនទឹកដែលបានដឹកចេញ ធៀបនឹងលុយប្រមូលបានជាក់ស្តែង។',
        },
        {
          title: 'តាមដានការប្រមូលសំបកធុង',
          desc: 'ធានាថាអ្នកដឹកជញ្ជូនមិនភ្លេចប្រមូលសំបកធុងទទេពីអតិថិជនមកវិញឡើយ។',
        },
      ],
    },
    {
      id: 'finance',
      category: 'finance',
      titleKh: 'ផ្ទាំងគ្រប់គ្រងហិរញ្ញវត្ថុ & ចំណូលចំណាយ (Financial Dashboard & P&L)',
      titleEn: 'Finance & Profit & Loss Statement',
      badge: 'Executive',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: DollarSign,
      targetRoles: ['admin', 'accountant'],
      summaryKh:
        'បង្ហាញរបាយការណ៍ហិរញ្ញវត្ថុជាក់ស្តែង (Real-time Financial P&L)៖ ចំណូលសរុប (Revenue), ថ្លៃដើមទំនិញ (COGS), ចំណាយប្រតិបត្តិការ (OPEX), និងប្រាក់ចំណេញសុទ្ធ (Net Profit)។',
      stepsKh: [
        'ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ (ថ្ងៃនេះ, សប្តាហ៍នេះ, ខែនេះ, ឬឆ្នាំនេះ)។',
        'ពិនិត្យមើលចំណូលសរុប (បែងចែករវាងសាច់ប្រាក់សុទ្ធ, ស្កេន KHQR, និងបំណុលជំពាក់)។',
        'ពិនិត្យការវិភាគថ្លៃដើម និងប្រាក់ចំណេញដុល (Gross Margin % ស្វ័យប្រវត្តិ)។',
        'តាមដានលំហូរសាច់ប្រាក់ (Cash Flow) ក្នុងដៃ និងក្នុងគណនីធនាគារ។',
      ],
      keyFeaturesKh: [
        {
          title: 'គណនា P&L ស្វ័យប្រវត្តិ',
          desc: 'មិនបាច់ធ្វើតារាង Excel ដោយដៃ ប្រព័ន្ធគណនាប្រាក់ចំណេញសុទ្ធដោយដកចំណាយ និងថ្លៃដើមស្វ័យប្រវត្តិ។',
        },
        {
          title: 'តារាងក្រាហ្វិកប្រៀបធៀបចំណូល-ចំណាយ',
          desc: 'មើលឃើញនិន្នាការហិរញ្ញវត្ថុរោងចក្រយ៉ាងច្បាស់លាស់។',
        },
      ],
    },
    {
      id: 'debts',
      category: 'finance',
      titleKh: 'គ្រប់គ្រងបំណុល & ការទូទាត់ (Debts & Accounts Receivable)',
      titleEn: 'Customer Debt & Accounts Receivable',
      badge: 'Cash Recovery',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
      icon: CreditCard,
      targetRoles: ['admin', 'accountant', 'cashier'],
      summaryKh:
        'គ្រប់គ្រងបញ្ជីអតិថិជនជំពាក់ប្រាក់ តាមដានអាយុកាលបំណុល (Debt Aging) កត់ត្រាការទូទាត់សងបំណុល (សងដាច់ ឬសងមួយផ្នែក) និងចេញបង្កាន់ដៃបង់ប្រាក់។',
      stepsKh: [
        'ស្វែងរកឈ្មោះអតិថិជនដែលមានបំណុលជំពាក់ក្នុងបញ្ជី។',
        'ចុចលើប៊ូតុង "កត់ត្រាការទូទាត់បំណុល (Record Payment)"។',
        'បញ្ចូលចំនួនទឹកប្រាក់ដែលអតិថិជនសង (អាចសងដាច់ ឬសងមួយផ្នែក) និងជ្រើសរើសវិធីសាស្ត្រទូទាត់ (លុយសុទ្ធ ឬ KHQR)។',
        'ចុចរក្សាទុក និងបោះពុម្ពបង្កាន់ដៃទូទាត់បំណុលជូនអតិថិជន។',
      ],
      keyFeaturesKh: [
        {
          title: 'ដែនកំណត់ឥណទាន (Credit Limit Guard)',
          desc: 'ការពារមិនឱ្យអតិថិជនទិញជំពាក់លើសពីកម្រិតដែលម្ចាស់រោងចក្រអនុញ្ញាត។',
        },
        {
          title: 'ប្រវត្តិសងបំណុលលម្អិត',
          desc: 'កត់ត្រាកាលបរិច្ឆេទ ម៉ោង និងអ្នកទទួលលុយយ៉ាងច្បាស់លាស់ ងាយស្រួលផ្ទៀងផ្ទាត់។',
        },
      ],
    },
    {
      id: 'costs',
      category: 'finance',
      titleKh: 'គ្រប់គ្រងការចំណាយប្រតិបត្តិការ (Costs & Expenses)',
      titleEn: 'Operating Costs & Expenses',
      badge: 'Cost Control',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      icon: Receipt,
      targetRoles: ['admin', 'accountant'],
      summaryKh:
        'កត់ត្រារាល់ការចំណាយប្រចាំថ្ងៃរបស់រោងចក្រ (ថ្លៃភ្លើង, ទឹកស្អាតរដ្ឋ, ប្រេងឡាន, ថ្លៃជួសជុល, ប្រាក់ខែបុគ្គលិក) ដើម្បីឆ្លុះបញ្ចាំងចូលរបាយការណ៍ហិរញ្ញវត្ថុពិតប្រាកដ។',
      stepsKh: [
        'ចុច "កត់ត្រាការចំណាយថ្មី (Add Expense)"។',
        'ជ្រើសរើសប្រភេទចំណាយ (ភ្លើង, ទឹក, ប្រេង, ជួសជុល, បៀវត្សរ៍, ផ្សេងៗ)។',
        'បញ្ចូលចំនួនទឹកប្រាក់ (រៀល ឬ ដុល្លារ) និងកំណត់ចំណាំលម្អិត។',
        'ចុចរក្សាទុកដើម្បីបញ្ចូលទៅក្នុងតារាងចំណាយ និង P&L ភ្លាមៗ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ចំណាត់ថ្នាក់ចំណាយច្បាស់លាស់',
          desc: 'ជួយឱ្យម្ចាស់រោងចក្រដឹងថាតើផ្នែកណាដែលស៊ីចំណាយច្រើនជាងគេក្នុងខែនីមួយៗ។',
        },
      ],
    },
    {
      id: 'inventory',
      category: 'warehouse',
      titleKh: 'គ្រប់គ្រងស្តុកឃ្លាំងទំនិញ (Warehouse & Stock Management)',
      titleEn: 'Inventory & Stock Management',
      badge: 'Warehouse',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: Boxes,
      targetRoles: ['admin', 'inventory_manager'],
      summaryKh:
        'តាមដានបរិមាណទំនិញសម្រេច និងវត្ថុធាតុដើមនៅក្នុងឃ្លាំង ប្រព័ន្ធផ្តល់សញ្ញាអាសន្នពេលស្តុកជិតអស់ និងការកែតម្រូវស្តុកជាក់ស្តែង។',
      stepsKh: [
        'ពិនិត្យតារាងទំនិញក្នុងឃ្លាំង៖ បរិមាណក្នុងដៃ (Qty On Hand), ខ្នាត (ធុង/យួរ/កេស)។',
        'តាមដានស្លាកពណ៌៖ បៃតង (ស្តុកគ្រប់គ្រាន់), លឿង (ស្តុកទាប <= 10), ក្រហម (អស់ស្តុក = 0)។',
        'ធ្វើការកែតម្រូវស្តុក (Stock Adjust) នៅពេលរាប់ស្តុកចុងខែឃើញលើស ឬខ្វះ។',
      ],
      keyFeaturesKh: [
        {
          title: 'កាត់ស្តុកស្វ័យប្រវត្តិតាម POS & ផលិតកម្ម',
          desc: 'លក់ចេញតាម POS កាត់ទំនិញសម្រេច, ផលិតទឹកកាត់វត្ថុធាតុដើម មិនបាច់កត់សៀវភៅដោយដៃ។',
        },
      ],
    },
    {
      id: 'purchases',
      category: 'warehouse',
      titleKh: 'បញ្ជាទិញវត្ថុធាតុដើមចូល (Purchases & POs)',
      titleEn: 'Purchase Orders & Raw Material Sourcing',
      badge: 'Procurement',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
      icon: Truck,
      targetRoles: ['admin', 'inventory_manager', 'accountant'],
      summaryKh:
        'គ្រប់គ្រងការទិញវត្ថុធាតុដើមពីអ្នកផ្គត់ផ្គង់ (Suppliers) ដូចជាសំបកធុង ២០L ថ្មី, ដប PET ទទេ, គម្រប, ផ្លាកសញ្ញា និងការបញ្ចូលស្តុកពេលទំនិញមកដល់។',
      stepsKh: [
        'ចុច "បង្កើតប័ណ្ណបញ្ជាទិញ (New PO)" រួចជ្រើសរើសអ្នកផ្គត់ផ្គង់។',
        'ជ្រើសរើសវត្ថុធាតុដើមដែលត្រូវទិញចូល បញ្ចូលចំនួន និងតម្លៃទិញ។',
        'នៅពេលអ្នកផ្គត់ផ្គង់ដឹកទំនិញមកដល់ឃ្លាំង ចុច "ទទួលទំនិញ (Receive Goods)" ដើម្បីបញ្ចូលចំនួនទៅក្នុងស្តុកឃ្លាំងដោយស្វ័យប្រវត្តិ។',
      ],
      keyFeaturesKh: [
        {
          title: 'គ្រប់គ្រងអ្នកផ្គត់ផ្គង់ (Supplier Directory)',
          desc: 'រក្សាទុកព័ត៌មានអ្នកផ្គត់ផ្គង់ លេខទូរស័ព្ទ និងប្រវត្តិតម្លៃទិញចាស់ៗ។',
        },
      ],
    },
    {
      id: 'orders',
      category: 'sales',
      titleKh: 'ការបញ្ជាទិញ & បញ្ជីវិក្កយបត្រ (Sales Orders & Invoices)',
      titleEn: 'Sales Orders & Invoices',
      badge: 'Billing',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
      icon: ShoppingCart,
      targetRoles: ['admin', 'cashier', 'accountant', 'driver'],
      summaryKh:
        'រក្សាទុកប្រវត្តិវិក្កយបត្រលក់ទាំងអស់ ស្វែងរកតាមលេខវិក្កយបត្រ ឈ្មោះអតិថិជន ឬកាលបរិច្ឆេទ ព្រមទាំងអាចបោះពុម្ពវិក្កយបត្រឡើងវិញបានគ្រប់ពេល។',
      stepsKh: [
        'ស្វែងរកវិក្កយបត្រតាមលេខកូដ (INV-xxxxxx) ឬឈ្មោះអតិថិជន។',
        'ពិនិត្យស្ថានភាព៖ Completed (បានបញ្ចប់), Pending (រង់ចាំដឹក), ឬ Cancelled (បោះបង់)។',
        'ចុចមើលព័ត៌មានលម្អិត ឬចុច Print ដើម្បីបោះពុម្ពវិក្កយបត្រឡើងវិញ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ស្វែងរក និងច្រោះទិន្នន័យរហ័ស',
          desc: 'អាច Filter តាមថ្ងៃលក់ តាមវិធីសាស្ត្រទូទាត់ (លុយសុទ្ធ/KHQR/ជំពាក់) យ៉ាងងាយស្រួល។',
        },
      ],
    },
    {
      id: 'customers',
      category: 'sales',
      titleKh: 'គ្រប់គ្រងអតិថិជន & កម្រិតតម្លៃ (Customers & Price Tiers)',
      titleEn: 'Customer Relationship & Price Tiers',
      badge: 'CRM',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: Users,
      targetRoles: ['admin', 'cashier', 'accountant', 'driver'],
      summaryKh:
        'គ្រប់គ្រងព័ត៌មានអតិថិជន បែងចែកកម្រិតតម្លៃ (Distributor / Wholesale / Retail) កំណត់ដែនកំណត់ឥណទានជំពាក់ (Credit Limit) និងតម្រាយផ្លូវដឹកជញ្ជូន។',
      stepsKh: [
        'ចុច "បន្ថែមអតិថិជនថ្មី" រួចបញ្ចូលឈ្មោះ លេខទូរស័ព្ទ និងទីតាំងអាជីវកម្ម។',
        'កំណត់កម្រិតតម្លៃ (Price Tier)៖ Retail (រាយ), Wholesale (ដុំ), ឬ Distributor (តំណាងចែកចាយ)។',
        'កំណត់ដែនកំណត់ឥណទាន (Credit Limit) ឧ. ៥០០,០០០ ៛។',
        'កំណត់តម្រាយផ្លូវដឹកជញ្ជូន (Delivery Route) ដើម្បីងាយស្រួលចាត់ចែងឡានដឹក។',
      ],
      keyFeaturesKh: [
        {
          title: 'ប្រព័ន្ធចងភ្ជាប់បំណុល & សំបកធុង',
          desc: 'ចុចលើឈ្មោះអតិថិជនម្នាក់ អាចមើលដឹងភ្លាមនូវប្រវត្តិទិញ សមតុល្យបំណុលជំពាក់ និងចំនួនសំបកធុង ២០L ដែលគាត់កំពុងកាន់កាប់។',
        },
      ],
    },
    {
      id: 'products',
      category: 'sales',
      titleKh: 'គ្រប់គ្រងមុខទំនិញ & តម្លៃ (Products & Pricing Catalog)',
      titleEn: 'Products & 3-Tier Pricing Catalog',
      badge: 'Catalog',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      icon: Package,
      targetRoles: ['admin', 'inventory_manager', 'cashier', 'accountant'],
      summaryKh:
        'បង្កើត និងកែប្រែបញ្ជីផលិតផលទឹកបរិសុទ្ធ និងសម្ភារៈ កំណត់តម្លៃលក់ ៣ កម្រិត (Retail, Wholesale, Distributor) និងថ្លៃដើមផលិត។',
      stepsKh: [
        'ចុច "បន្ថែមមុខទំនិញថ្មី" បញ្ចូលឈ្មោះជាភាសាខ្មែរ និងអង់គ្លេស។',
        'កំណត់ខ្នាត (ធុង ២០L, យួរ ២៤ដប, កេស, ដប)។',
        'បញ្ចូលតម្លៃលក់ ៣ កម្រិត៖ តម្លៃរាយ, តម្លៃដុំ, តម្លៃតំណាងចែកចាយ។',
        'បញ្ចូលថ្លៃដើមផលិត (Cost) ដើម្បីឱ្យប្រព័ន្ធគណនាប្រាក់ចំណេញដុលបានត្រឹមត្រូវ។',
      ],
      keyFeaturesKh: [
        {
          title: 'គាំទ្រតម្លៃពហុកម្រិត (Multi-tier Pricing)',
          desc: 'ផលិតផលមួយមុខមានតម្លៃ ៣ កម្រិតស្វ័យប្រវត្ត មិនបាច់ចាំតម្លៃដោយដៃ។',
        },
      ],
    },
    {
      id: 'employers',
      category: 'system',
      titleKh: 'គ្រប់គ្រងបុគ្គលិក & ប្រាក់បៀវត្សរ៍ (Employees & Staff Directory)',
      titleEn: 'Staff & Employee Directory',
      badge: 'HR',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      icon: UserCheck,
      targetRoles: ['admin', 'accountant'],
      summaryKh:
        'កត់ត្រាព័ត៌មានបុគ្គលិករោងចក្រ តួនាទីការងារ (ផ្នែកលក់, ផ្នែកផលិត, អ្នកបើកបរ, គណនេយ្យ) ប្រាក់បៀវត្សរ៍មូលដ្ឋាន និងលេខទូរស័ព្ទ។',
      stepsKh: [
        'ចុច "បន្ថែមបុគ្គលិកថ្មី" បញ្ចូលឈ្មោះ តួនាទី លេខទូរស័ព្ទ និងប្រាក់ខែមូលដ្ឋាន។',
        'តាមដានស្ថានភាពការងារ និងកាលបរិច្ឆេទចូលបម្រើការងារ។',
      ],
      keyFeaturesKh: [
        {
          title: 'តភ្ជាប់ជាមួយសិទ្ធិប្រព័ន្ធ (Role Permissions)',
          desc: 'កំណត់សិទ្ធិប្រើប្រាស់កម្មវិធីឱ្យសមស្របតាមតួនាទីជាក់ស្តែងរបស់បុគ្គលិក។',
        },
      ],
    },
    {
      id: 'reports',
      category: 'finance',
      titleKh: 'របាយការណ៍សង្ខេប & ការវិភាគ (Reports & Live Analytics)',
      titleEn: 'Reports & Live Business Analytics',
      badge: 'Analytics',
      badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300',
      icon: BarChart3,
      targetRoles: ['admin', 'accountant'],
      summaryKh:
        'ទាញយករបាយការណ៍សង្ខេបលក់ប្រចាំថ្ងៃ/ខែ ចំណាត់ថ្នាក់ផលិតផលលក់ដាច់បំផុត ចំណាត់ថ្នាក់អតិថិជន VIP និងរបាយការណ៍ដឹកជញ្ជូន។',
      stepsKh: [
        'ជ្រើសរើសប្រភេទរបាយការណ៍ដែលចង់មើល (ការលក់, ស្តុក, បំណុល, អ្នកដឹក)។',
        'ជ្រើសរើសចន្លោះកាលបរិច្ឆេទដើម្បីច្រោះទិន្នន័យ។',
        'ពិនិត្យតារាងក្រាហ្វិក និងទាញយកទិន្នន័យតាមតម្រូវការ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ចំណាត់ថ្នាក់ផលិតផលកំពូល (Top Products)',
          desc: 'ដឹងច្បាស់ថាផលិតផលណាដែលនាំចំណូលច្រើនជាងគេជូនរោងចក្រ។',
        },
      ],
    },
    {
      id: 'settings',
      category: 'system',
      titleKh: 'ការកំណត់ប្រព័ន្ធ & Cloud Database (Settings & Supabase Sync)',
      titleEn: 'System Settings & Cloud Database',
      badge: 'Cloud Sync',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: Settings,
      targetRoles: ['admin'],
      summaryKh:
        'កំណត់ព័ត៌មានរោងចក្រលើក្បាលវិក្កយបត្រ, អត្រាប្តូរប្រាក់ KHR/USD, ការភ្ជាប់ Supabase Cloud Database និងការបម្រុងទុកទិន្នន័យ (Backup/Restore)។',
      stepsKh: [
        'បញ្ចូលឈ្មោះសហគ្រាស អាសយដ្ឋាន និងលេខទូរស័ព្ទ ដែលត្រូវបង្ហាញលើក្បាលវិក្កយបត្រ។',
        'កំណត់អត្រាប្តូរប្រាក់រៀល/ដុល្លារ (ឧ. 1 USD = 4,100 KHR)។',
        'បញ្ចូល Supabase URL និង Anon Key ដើម្បីភ្ជាប់ទៅកាន់ Cloud Database ធានាថាទិន្នន័យមិនបាត់បង់ និង Sync លើគ្រប់ឧបករណ៍។',
        'ចុច "Backup JSON" ដើម្បីទាញយកទិន្នន័យទុកក្នុងកុំព្យូទ័រជាប្រចាំ។',
      ],
      keyFeaturesKh: [
        {
          title: 'ដំណើរការពេលដាច់អ៊ីនធឺណិត (Offline-First)',
          desc: 'ពេលដាច់អ៊ីនធឺណិត ប្រព័ន្ធរក្សាទុកក្នុង Local Storage ហើយ Sync ទៅ Cloud ស្វ័យប្រវត្តនៅពេលមានអ៊ីនធឺណិតវិញ។',
        },
      ],
    },
  ];

  // Filter guides based on search, category, and role
  const filteredGuides = useMemo(() => {
    return guideData.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.titleKh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summaryKh.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const matchRole =
        selectedRoleFilter === 'all' || item.targetRoles.includes(selectedRoleFilter);

      return matchSearch && matchCategory && matchRole;
    });
  }, [searchTerm, selectedCategory, selectedRoleFilter]);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-5 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>{lang === 'km' ? 'សៀវភៅណែនាំផ្លូវការ v2.5' : 'Official Master User Guide v2.5'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
            {lang === 'km'
              ? 'របៀបប្រើប្រាស់ប្រព័ន្ធ ERP & POS ទាំងមូល'
              : 'Complete ERP & POS System User Guide'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {lang === 'km'
              ? 'ការពន្យល់លម្អិតពីមុខងារនីមួយៗនៃសហគ្រាសផលិតទឹកបរិសុទ្ធ ខ្មែរ អង្គរ៖ ចាប់ពីសង្វាក់ផលិតកម្ម, ស្តុកឃ្លាំង, ការលក់ POS, ការចាត់ចែងដឹកជញ្ជូន, ចរាចរណ៍សំបកធុង ២០L, បំណុល និងរបាយការណ៍ហិរញ្ញវត្ថុ P&L។'
              : 'Complete operational breakdown for all 15 modules: Production, Inventory, POS Terminal, Logistics, 20L Bottle Ledger, Accounts Receivable, and Real-time Financial P&L.'}
          </p>
        </div>

        {/* Decorative Water Droplet */}
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Droplet className="h-64 w-64 text-white fill-white" />
        </div>
      </div>

      {/* Quick Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                lang === 'km'
                  ? 'ស្វែងរកមុខងារ (ឧ. គិតលុយ, សំបកធុង, KHQR, បំណុល, ថ្លៃភ្លើង, P&L...)'
                  : 'Search feature (e.g. POS, Bottle Ledger, KHQR, Debts, Expenses, P&L...)'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 pl-9 pr-8 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-5 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {lang === 'km' ? 'តួនាទី:' : 'Role:'}
            </span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">{lang === 'km' ? 'គ្រប់តួនាទីទាំងអស់' : 'All User Roles'}</option>
              <option value="admin">👑 Admin (អ្នកគ្រប់គ្រង)</option>
              <option value="cashier">💵 Cashier (បេឡា/គិតលុយ)</option>
              <option value="driver">🚚 Driver (អ្នកដឹកជញ្ជូន)</option>
              <option value="accountant">📊 Accountant (គណនេយ្យ)</option>
              <option value="inventory_manager">🏭 Inventory (ប្រធានឃ្លាំង/ផលិត)</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {lang === 'km' ? c.labelKh : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {filteredGuides.map((guide, idx) => {
          const Icon = guide.icon;
          return (
            <div
              key={guide.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="space-y-3.5">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                          {guide.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">
                        {lang === 'km' ? guide.titleKh : guide.titleEn}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {guide.summaryKh}
                </p>

                {/* 4-Step Instructions */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    {lang === 'km' ? '👉 ជំហានអនុវត្តជាក់ស្តែង:' : '👉 Step-by-Step Instructions:'}
                  </span>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal pl-4">
                    {guide.stepsKh.map((st, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Key Features */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {lang === 'km' ? '✨ ចំណុចពិសេសសំខាន់ៗ:' : '✨ Key Highlights:'}
                  </span>
                  <div className="space-y-1 text-xs">
                    {guide.keyFeaturesKh.map((kf, kIdx) => (
                      <div key={kIdx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-900 dark:text-slate-100">{kf.title}:</strong> {kf.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips if available */}
                {guide.proTipsKh && guide.proTipsKh.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[11px] block">{lang === 'km' ? '💡 គន្លឹះប្រតិបត្តិការ:' : '💡 Pro Tip:'}</span>
                      {guide.proTipsKh.map((pt, pIdx) => (
                        <p key={pIdx} className="text-[11px] leading-relaxed">{pt}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Roles Badge Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>{lang === 'km' ? 'សិទ្ធិប្រើប្រាស់:' : 'Permitted Roles:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {guide.targetRoles.join(', ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results notice */}
      {filteredGuides.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            {lang === 'km' ? 'រកមិនឃើញមុខងារដែលអ្នកស្វែងរកឡើយ' : 'No matching guide found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'km' ? 'សូមសាកល្បងវាយពាក្យគន្លឹះផ្សេងទៀត ឬចុចប្តូរទៅ "ទាំងអស់"' : 'Try different keywords or select "All Modules"'}
          </p>
        </div>
      )}

      {/* Daily Workflow Sequence Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center font-black">
            🔄
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base">
              {lang === 'km' ? 'ដ្យាក្រាមលំហូរការងាររោងចក្រប្រចាំថ្ងៃ (Daily Factory Operations Flow)' : 'Daily Operations Workflow'}
            </h3>
            <p className="text-[11px] text-blue-200">
              {lang === 'km' ? 'ការតភ្ជាប់គ្នាដោយស្វ័យប្រវត្តរវាងផ្នែកផលិតកម្ម, ឃ្លាំង, ការលក់, ការដឹកជញ្ជូន និងគណនេយ្យ' : 'Seamless end-to-end integration across production, warehouse, POS, drivers and finance'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase text-cyan-300">ដំណាក់កាលទី ១</span>
            <h4 className="font-bold text-white text-sm">🏭 ផលិតកម្ម & QC</h4>
            <p className="text-[11px] text-slate-300">បន្សុទ្ធទឹក RO, លាងធុង, ច្រកទឹក និងវាស់ TDS/pH មុនបញ្ជូនចូលឃ្លាំងស្តុក។</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-300">ដំណាក់កាលទី ២</span>
            <h4 className="font-bold text-white text-sm">🛒 លក់ POS & បញ្ជាទិញ</h4>
            <p className="text-[11px] text-slate-300">ចេញវិក្កយបត្រ, ទទួលប្រាក់កក់ធុង, ស្កេន KHQR ឬកត់ត្រាជំពាក់ចូល Debts។</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-300">ដំណាក់កាលទី ៣</span>
            <h4 className="font-bold text-white text-sm">🚚 ដឹកជញ្ជូន & សំបកធុង</h4>
            <p className="text-[11px] text-slate-300">ចាត់ចែងឡានដឹក, ទម្លាក់ទឹកជូនអតិថិជន និងប្រមូលសំបកធុងទទេយកមកវិញ។</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-300">ដំណាក់កាលទី ៤</span>
            <h4 className="font-bold text-white text-sm">📈 ផ្ទៀងផ្ទាត់ & ហិរញ្ញវត្ថុ</h4>
            <p className="text-[11px] text-slate-300">ផ្ទៀងផ្ទាត់សាច់ប្រាក់, កត់ត្រាចំណាយប្រតិបត្តិការ និងពិនិត្យប្រាក់ចំណេញសុទ្ធ P&L។</p>
          </div>
        </div>
      </div>
    </div>
  );
}
