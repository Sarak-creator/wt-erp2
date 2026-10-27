import { create } from 'zustand';
import {
  Customer,
  InventoryItem,
  Order,
  UserRole,
  BottleLedger,
  ProductionBatch,
  Expense,
  BomRecipe,
  DeliveryZone,
  Employee,
  Purchase,
  CustomerDebt,
  CompanySettings,
} from '@/types/database';
import { Language } from './i18n';

export interface CartItem {
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const defaultCompanySettings: CompanySettings = {
  name: 'Water Pure ERP',
  name_kh: 'រោងចក្រទឹកបរិសុទ្ធ វ៉ធើ ព្យួរ',
  phone: '012 345 678',
  address: 'Phnom Penh, Cambodia',
  currency: 'KHR',
  khmer_rate: 4100,
  bottle_deposit_rate: 3.0,
};

interface AppState {
  // Locale, Theme & RBAC
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Supabase Connection Status
  isSyncing: boolean;
  supabaseConnected: boolean;
  syncError: string | null;
  fetchFromSupabase: () => Promise<void>;

  // Settings & System
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  deliveryZones: DeliveryZone[];
  bomRecipes: BomRecipe[];

  // 1. Customers
  customers: Customer[];
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer | null>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<Customer | null>;
  updateCustomerBalance: (
    customerId: string,
    balanceDelta: number,
    bottleDelta: number,
    depositDelta: number
  ) => Promise<void>;

  // 2. Products & Stock Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<InventoryItem | null>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deductInventory: (sku: string, quantity: number) => Promise<void>;
  addInventory: (sku: string, quantity: number) => Promise<void>;

  // 3. POS & Cart
  cart: CartItem[];
  addToCart: (item: InventoryItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  depositBottlesCount: number;
  setDepositBottlesCount: (count: number) => void;

  // 4. Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<Order | null>;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    proofUrl?: string,
    bottlesDelivered?: number,
    bottlesReturned?: number
  ) => Promise<void>;

  // 5. Bottle Ledger
  bottleLedger: BottleLedger[];
  addBottleMovement: (entry: Omit<BottleLedger, 'id' | 'created_at'>) => Promise<BottleLedger | null>;

  // 6. Employees / Employers
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'created_at'>) => Promise<Employee | null>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<Employee | null>;

  // 7. Costs / Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'> & { id?: string }) => Promise<Expense | null>;

  // 8. Purchases (Procurement)
  purchases: Purchase[];
  addPurchase: (
    purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>,
    items: Array<{ inventory_item_id: string; quantity: number; unit_cost: number }>
  ) => Promise<Purchase | null>;

  // 9. Debts
  customerDebts: CustomerDebt[];
  addDebtPayment: (
    customerId: string,
    amount: number,
    paymentMethod: string,
    notes?: string
  ) => Promise<CustomerDebt | null>;

  // 10. Production Batches
  batches: ProductionBatch[];
  addBatch: (batch: Omit<ProductionBatch, 'id' | 'produced_at'> & { id?: string }) => Promise<ProductionBatch | null>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Locale, Theme & Role
  lang: 'km',
  setLang: (lang) => set({ lang }),
  theme: 'light',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_preference', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  currentRole: 'admin',
  setCurrentRole: (currentRole) => set({ currentRole }),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

  // Status - Strictly connected to Supabase
  isSyncing: false,
  supabaseConnected: false,
  syncError: null,

  // Datasets initialized strictly empty (hydrated directly from Supabase)
  companySettings: defaultCompanySettings,
  deliveryZones: [],
  bomRecipes: [],
  customers: [],
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  inventory: [],
  cart: [],
  depositBottlesCount: 0,
  setDepositBottlesCount: (depositBottlesCount) => set({ depositBottlesCount }),

  orders: [],
  bottleLedger: [],
  employees: [],
  expenses: [],
  purchases: [],
  customerDebts: [],
  batches: [],

  // Live Supabase Fetcher: fetches all real data directly from Supabase
  fetchFromSupabase: async () => {
    set({ isSyncing: true, syncError: null });
    try {
      const apiRes = await fetch('/api/data', { cache: 'no-store' });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && json.data) {
          const loadedCustomers: Customer[] = json.data.customers || [];
          const currentSelected = get().selectedCustomerId;
          const selectedCustomerId =
            currentSelected && loadedCustomers.some((c) => c.id === currentSelected)
              ? currentSelected
              : loadedCustomers.length > 0
              ? loadedCustomers[0].id
              : null;

          const savedSettings = json.data.settings?.company_profile || defaultCompanySettings;

          set({
            supabaseConnected: true,
            isSyncing: false,
            syncError: null,
            customers: loadedCustomers,
            selectedCustomerId,
            inventory: json.data.inventory || [],
            orders: json.data.orders || [],
            bottleLedger: json.data.bottleLedger || [],
            batches: json.data.batches || [],
            expenses: json.data.expenses || [],
            bomRecipes: json.data.bomRecipes || [],
            deliveryZones: json.data.deliveryZones || [],
            employees: json.data.employees || [],
            purchases: json.data.purchases || [],
            customerDebts: json.data.customerDebts || [],
            companySettings: savedSettings,
          });
          return;
        }
      }
      throw new Error('Supabase /api/data returned non-ok status');
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      set({
        supabaseConnected: false,
        isSyncing: false,
        syncError: err?.message || 'Error connecting to Supabase database',
      });
    }
  },

  // 1. Customer Operations
  addCustomer: async (custData) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_customer', payload: custData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newCustomer: Customer = json.data;
          set((state) => ({ customers: [newCustomer, ...state.customers] }));
          return newCustomer;
        }
      }
    } catch (e) {
      console.error('Failed to add customer to Supabase:', e);
    }
    return null;
  },

  updateCustomer: async (id, updates) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_customer', payload: { id, ...updates } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated: Customer = json.data;
          set((state) => ({
            customers: state.customers.map((c) => (c.id === id ? { ...c, ...updated } : c)),
          }));
          return updated;
        }
      }
    } catch (e) {
      console.error('Failed to update customer in Supabase:', e);
    }
    return null;
  },

  updateCustomerBalance: async (customerId, balanceDelta, bottleDelta, depositDelta) => {
    const cust = get().customers.find((c) => c.id === customerId);
    if (!cust) return;

    const newBalance = Math.max(0, cust.current_balance + balanceDelta);
    const newBottles = Math.max(0, cust.empty_bottles_held + bottleDelta);
    const newDeposit = Math.max(0, cust.deposit_balance + depositDelta);

    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              current_balance: newBalance,
              empty_bottles_held: newBottles,
              deposit_balance: newDeposit,
            }
          : c
      ),
    }));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer_balance',
          payload: {
            customerId,
            current_balance: newBalance,
            empty_bottles_held: newBottles,
            deposit_balance: newDeposit,
          },
        }),
      });
    } catch (e) {
      console.error('Failed to sync customer balance with Supabase:', e);
    }
  },

  // 2. Inventory & Product Operations
  addInventoryItem: async (itemData) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_inventory_item', payload: itemData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newItem: InventoryItem = json.data;
          set((state) => ({ inventory: [newItem, ...state.inventory] }));
          return newItem;
        }
      }
    } catch (e) {
      console.error('Failed to add inventory item to Supabase:', e);
    }
    return null;
  },

  updateInventoryItem: async (id, updates) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_inventory_item', payload: { id, ...updates } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated: InventoryItem = json.data;
          set((state) => ({
            inventory: state.inventory.map((item) => (item.id === id ? { ...item, ...updated } : item)),
          }));
          return updated;
        }
      }
    } catch (e) {
      console.error('Failed to update inventory item in Supabase:', e);
    }
    return null;
  },

  deductInventory: async (sku, quantity) => {
    const item = get().inventory.find((i) => i.sku === sku);
    if (!item) return;
    const newQty = Math.max(0, item.qty_on_hand - quantity);

    set((state) => ({
      inventory: state.inventory.map((i) => (i.sku === sku ? { ...i, qty_on_hand: newQty } : i)),
    }));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_inventory',
          payload: { sku, qty_on_hand: newQty },
        }),
      });
    } catch (e) {
      console.error('Failed to sync inventory deduction with Supabase:', e);
    }
  },

  addInventory: async (sku, quantity) => {
    const item = get().inventory.find((i) => i.sku === sku);
    if (!item) return;
    const newQty = item.qty_on_hand + quantity;

    set((state) => ({
      inventory: state.inventory.map((i) => (i.sku === sku ? { ...i, qty_on_hand: newQty } : i)),
    }));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_inventory',
          payload: { sku, qty_on_hand: newQty },
        }),
      });
    } catch (e) {
      console.error('Failed to sync inventory addition with Supabase:', e);
    }
  },

  // 3. POS & Cart
  addToCart: (item, qty = 1) => {
    const { cart } = get();
    const existing = cart.find((c) => c.item.id === item.id);
    const unitPrice = item.retail_price;

    if (existing) {
      set({
        cart: cart.map((c) =>
          c.item.id === item.id
            ? {
                ...c,
                quantity: c.quantity + qty,
                lineTotal: (c.quantity + qty) * unitPrice,
              }
            : c
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            item,
            quantity: qty,
            unitPrice,
            lineTotal: qty * unitPrice,
          },
        ],
      });
    }
  },

  removeFromCart: (itemId) => {
    set({ cart: get().cart.filter((c) => c.item.id !== itemId) });
  },

  updateCartQty: (itemId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set({
      cart: get().cart.map((c) =>
        c.item.id === itemId
          ? {
              ...c,
              quantity: qty,
              lineTotal: qty * c.unitPrice,
            }
          : c
      ),
    });
  },

  clearCart: () => set({ cart: [], depositBottlesCount: 0 }),

  // 4. Orders
  addOrder: async (orderData) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_order', payload: orderData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newOrder: Order = json.data;
          set((state) => ({ orders: [newOrder, ...state.orders] }));
          return newOrder;
        }
      }
    } catch (e) {
      console.error('Failed to add order to Supabase:', e);
    }
    return null;
  },

  updateOrderStatus: async (orderId, status, proofUrl, bottlesDelivered, bottlesReturned) => {
    const updates: Partial<Order> = {
      status,
      delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
      proof_of_delivery_url: proofUrl,
      bottles_delivered: bottlesDelivered,
      bottles_returned: bottlesReturned,
    };

    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
    }));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order_status',
          payload: { orderId, ...updates },
        }),
      });
    } catch (e) {
      console.error('Failed to sync order status update with Supabase:', e);
    }
  },

  // 5. Bottle Ledger
  addBottleMovement: async (entry) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_bottle_movement', payload: entry }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newMovement: BottleLedger = json.data;
          set((state) => ({ bottleLedger: [newMovement, ...state.bottleLedger] }));
          return newMovement;
        }
      }
    } catch (e) {
      console.error('Failed to add bottle movement to Supabase:', e);
    }
    return null;
  },

  // 6. Employees / Employers
  addEmployee: async (empData) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_employee', payload: empData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newEmp: Employee = json.data;
          set((state) => ({ employees: [newEmp, ...state.employees] }));
          return newEmp;
        }
      }
    } catch (e) {
      console.error('Failed to add employee to Supabase:', e);
    }
    return null;
  },

  updateEmployee: async (id, updates) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_employee', payload: { id, ...updates } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated: Employee = json.data;
          set((state) => ({
            employees: state.employees.map((e) => (e.id === id ? { ...e, ...updated } : e)),
          }));
          return updated;
        }
      }
    } catch (e) {
      console.error('Failed to update employee in Supabase:', e);
    }
    return null;
  },

  // 7. Costs / Expenses
  addExpense: async (expense) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_expense', payload: expense }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newExpense: Expense = json.data;
          set((state) => ({ expenses: [newExpense, ...state.expenses] }));
          return newExpense;
        }
      }
    } catch (e) {
      console.error('Failed to add expense to Supabase:', e);
    }
    return null;
  },

  // 8. Purchases & Procurement
  addPurchase: async (purchaseData, items) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_purchase', payload: purchaseData }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newPurchase: Purchase = json.data;
          set((state) => ({ purchases: [newPurchase, ...state.purchases] }));

          // Automatically increment inventory for purchased items
          for (const item of items) {
            const inv = get().inventory.find((i) => i.id === item.inventory_item_id);
            if (inv) {
              await get().addInventory(inv.sku, Number(item.quantity));
            }
          }
          return newPurchase;
        }
      }
    } catch (e) {
      console.error('Failed to add purchase to Supabase:', e);
    }
    return null;
  },

  // 9. Debts & Payment Collection
  addDebtPayment: async (customerId, amount, paymentMethod, notes) => {
    const cust = get().customers.find((c) => c.id === customerId);
    if (!cust) return null;

    const newBalance = Math.max(0, cust.current_balance - amount);

    try {
      const payload = {
        customer_id: customerId,
        amount,
        type: 'payment',
        payment_method: paymentMethod,
        balance_after: newBalance,
        notes: notes || 'Debt payment collection',
      };

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_debt_payment', payload }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const createdDebt: CustomerDebt = json.data;
          set((state) => ({
            customerDebts: [createdDebt, ...state.customerDebts],
            customers: state.customers.map((c) =>
              c.id === customerId ? { ...c, current_balance: newBalance } : c
            ),
          }));

          // Sync new customer balance to Supabase
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_customer_balance',
              payload: {
                customerId,
                current_balance: newBalance,
                empty_bottles_held: cust.empty_bottles_held,
                deposit_balance: cust.deposit_balance,
              },
            }),
          });

          return createdDebt;
        }
      }
    } catch (e) {
      console.error('Failed to record debt payment in Supabase:', e);
    }
    return null;
  },

  // 10. Production Batches
  addBatch: async (batch) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_batch', payload: batch }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newBatch: ProductionBatch = json.data;
          set((state) => ({ batches: [newBatch, ...state.batches] }));
          return newBatch;
        }
      }
    } catch (e) {
      console.error('Failed to add production batch to Supabase:', e);
    }
    return null;
  },

  // Settings
  updateCompanySettings: async (settings) => {
    const updated = { ...get().companySettings, ...settings };
    set({ companySettings: updated });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: { key: 'company_profile', value: updated },
        }),
      });
    } catch (e) {
      console.error('Failed to update company settings in Supabase:', e);
    }
  },
}));
