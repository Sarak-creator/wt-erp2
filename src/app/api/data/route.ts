import { NextResponse } from 'next/server';

const DEFAULT_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const DEFAULT_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getTarget = (request?: Request) => {
  const customUrl = request?.headers.get('x-custom-url');
  const customKey = request?.headers.get('x-custom-key');
  const url = (customUrl && customUrl.trim()) || DEFAULT_SUPABASE_URL;
  const key = (customKey && customKey.trim()) || DEFAULT_SERVICE_KEY;
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  };
};

export async function GET(request: Request) {
  try {
    const { url, headers } = getTarget(request);

    const [
      custRes,
      invRes,
      ordRes,
      blRes,
      batchRes,
      expRes,
      bomRes,
      zoneRes,
      empRes,
      purRes,
      debtRes,
      setRes,
    ] = await Promise.all([
      fetch(`${url}/rest/v1/customers?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/inventory_items?select=*&order=type.asc,name.asc`, { headers }),
      fetch(`${url}/rest/v1/orders?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/bottle_ledger?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/production_batches?select=*&order=produced_at.desc`, { headers }),
      fetch(`${url}/rest/v1/expenses?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/bom_recipes?select=*`, { headers }),
      fetch(`${url}/rest/v1/delivery_zones?select=*&order=code.asc`, { headers }),
      fetch(`${url}/rest/v1/employees?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/purchases?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/customer_debts?select=*&order=created_at.desc`, { headers }),
      fetch(`${url}/rest/v1/settings?select=*`, { headers }),
    ]);

    const [
      customers,
      inventory,
      orders,
      bottleLedger,
      batches,
      expenses,
      bomRecipes,
      deliveryZones,
      employees,
      purchases,
      customerDebts,
      settingsRows,
    ] = await Promise.all([
      custRes.ok ? custRes.json() : [],
      invRes.ok ? invRes.json() : [],
      ordRes.ok ? ordRes.json() : [],
      blRes.ok ? blRes.json() : [],
      batchRes.ok ? batchRes.json() : [],
      expRes.ok ? expRes.json() : [],
      bomRes.ok ? bomRes.json() : [],
      zoneRes.ok ? zoneRes.json() : [],
      empRes.ok ? empRes.json() : [],
      purRes.ok ? purRes.json() : [],
      debtRes.ok ? debtRes.json() : [],
      setRes.ok ? setRes.json() : [],
    ]);

    const settingsMap: Record<string, any> = {};
    if (Array.isArray(settingsRows)) {
      settingsRows.forEach((r: any) => {
        settingsMap[r.key] = r.value;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        customers,
        inventory,
        orders,
        bottleLedger,
        batches,
        expenses,
        bomRecipes,
        deliveryZones,
        employees,
        purchases,
        customerDebts,
        settings: settingsMap,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Supabase data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch from Supabase' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { url, headers } = getTarget(request);
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'add_order': {
        const res = await fetch(`${url}/rest/v1/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert order: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'update_order_status': {
        const { orderId, ...updates } = payload;
        const res = await fetch(`${url}/rest/v1/orders?id=eq.${orderId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update order: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'add_customer': {
        const res = await fetch(`${url}/rest/v1/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert customer: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'update_customer': {
        const { id, ...updates } = payload;
        const res = await fetch(`${url}/rest/v1/customers?id=eq.${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update customer: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'update_customer_balance': {
        const { customerId, current_balance, empty_bottles_held, deposit_balance } = payload;
        const res = await fetch(`${url}/rest/v1/customers?id=eq.${customerId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            current_balance,
            empty_bottles_held,
            deposit_balance,
            updated_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update customer balance: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'add_inventory_item': {
        const res = await fetch(`${url}/rest/v1/inventory_items`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert inventory item: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'update_inventory_item': {
        const { id, ...updates } = payload;
        const res = await fetch(`${url}/rest/v1/inventory_items?id=eq.${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update inventory item: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'update_inventory': {
        const { sku, qty_on_hand } = payload;
        const res = await fetch(`${url}/rest/v1/inventory_items?sku=eq.${sku}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            qty_on_hand,
            updated_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update inventory: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'add_employee': {
        const res = await fetch(`${url}/rest/v1/employees`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert employee: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'update_employee': {
        const { id, ...updates } = payload;
        const res = await fetch(`${url}/rest/v1/employees?id=eq.${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update employee: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(updated) ? updated[0] : updated });
      }

      case 'add_purchase': {
        const res = await fetch(`${url}/rest/v1/purchases`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert purchase: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'add_debt_payment': {
        const res = await fetch(`${url}/rest/v1/customer_debts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to record debt payment: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'update_settings': {
        const { key, value } = payload;
        const res = await fetch(`${url}/rest/v1/settings`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to update settings: ${errText}`);
        }
        const updated = await res.json();
        return NextResponse.json({ success: true, data: updated });
      }

      case 'add_bottle_movement': {
        const res = await fetch(`${url}/rest/v1/bottle_ledger`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert bottle movement: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'add_batch': {
        const res = await fetch(`${url}/rest/v1/production_batches`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert batch: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      case 'add_expense': {
        const res = await fetch(`${url}/rest/v1/expenses`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to insert expense: ${errText}`);
        }
        const created = await res.json();
        return NextResponse.json({ success: true, data: Array.isArray(created) ? created[0] : created });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error mutating Supabase data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed mutation' },
      { status: 500 }
    );
  }
}
