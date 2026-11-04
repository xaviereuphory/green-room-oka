// Stockage de la démo (navigateur seulement). En production : une vraie base de données.
export const KEYS = {
  session: 'gr-shop-session',
  cart: 'gr-shop-cart',
  orders: 'gr-shop-orders',
  customers: 'gr-shop-customers',
} as const;

export type Status = 'new' | 'preparing' | 'ready' | 'pickedup' | 'cancelled';
export type OrderItem = { id: string; name: string; format: string; qty: number; price: number };
export type Order = {
  id: string;
  email: string;
  first: string;
  last: string;
  items: OrderItem[];
  note: string;
  status: Status;
  createdAt: string;
};

export function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* navigation privée : la démo fonctionne seulement pendant la visite */
  }
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export const fill = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ''));

// Quantités déjà réservées par les commandes qui ne sont pas annulées.
export function reserved(orders: Order[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const i of o.items) out[i.id] = (out[i.id] ?? 0) + i.qty;
  }
  return out;
}

export const phoneDigits = (s: string) => {
  const d = s.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
};

export const formatPhone = (d: string) => `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;

export const nextOrderId = (orders: Order[]) => {
  const n = orders.reduce((m, o) => Math.max(m, Number(o.id.replace(/\D/g, '')) || 0), 1000);
  return `GR-${n + 1}`;
};

export const money = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD' }).format(n);
