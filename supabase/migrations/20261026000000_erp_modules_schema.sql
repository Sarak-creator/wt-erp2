-- ==============================================================================
-- ERP EXTENSION MODULES FOR WATER FACTORY SYSTEM
-- Modules: Employees, Purchases, Customer Debts, Company Settings
-- ==============================================================================

-- 1. Employees & Staff
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'driver', -- 'driver', 'operator', 'manager', 'cashier', 'admin'
    phone VARCHAR(50),
    email VARCHAR(100),
    salary_type VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'daily', 'commission'
    base_salary NUMERIC(10,2) DEFAULT 0.00,
    commission_rate NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'on_leave'
    hired_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Purchases & Purchase Items (Procurement for Stock & Raw Materials)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'received', -- 'pending', 'received', 'cancelled'
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'paid', -- 'paid', 'partial', 'unpaid'
    payment_method VARCHAR(50) DEFAULT 'cash',
    purchase_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id),
    item_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customer Debts / Debt Payments Log
CREATE TABLE IF NOT EXISTS public.customer_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'charge', -- 'charge' (order unpaid), 'payment' (paid debt)
    payment_method VARCHAR(50) DEFAULT 'cash',
    reference_no VARCHAR(100),
    balance_after NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. System Settings
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security & Policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to employees" ON public.employees;
    CREATE POLICY "Public access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public access to purchases" ON public.purchases;
    CREATE POLICY "Public access to purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to purchase_items" ON public.purchase_items;
    CREATE POLICY "Public access to purchase_items" ON public.purchase_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to customer_debts" ON public.customer_debts;
    CREATE POLICY "Public access to customer_debts" ON public.customer_debts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to settings" ON public.settings;
    CREATE POLICY "Public access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public access to customers" ON public.customers;
    CREATE POLICY "Public access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to inventory_items" ON public.inventory_items;
    CREATE POLICY "Public access to inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to orders" ON public.orders;
    CREATE POLICY "Public access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to order_items" ON public.order_items;
    CREATE POLICY "Public access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to expenses" ON public.expenses;
    CREATE POLICY "Public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to bottle_ledger" ON public.bottle_ledger;
    CREATE POLICY "Public access to bottle_ledger" ON public.bottle_ledger FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to production_batches" ON public.production_batches;
    CREATE POLICY "Public access to production_batches" ON public.production_batches FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 6. Initial Company Profile Settings
INSERT INTO public.settings (key, value, description)
VALUES 
('company_profile', '{"name": "Water Pure ERP", "name_kh": "រោងចក្រទឹកបរិសុទ្ធ វ៉ធើ ព្យួរ", "phone": "012 345 678", "address": "Phnom Penh, Cambodia", "currency": "USD", "khmer_rate": 4100, "bottle_deposit_rate": 3.0}'::jsonb, 'Company General Information')
ON CONFLICT (key) DO NOTHING;
