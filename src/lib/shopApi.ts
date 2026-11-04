// Couche d'accès aux données de la vitrine.
//  - Mode réel : Supabase (comptes par courriel + mot de passe, base Postgres, temps réel).
//  - Mode démo : tout dans le navigateur, sans compte Supabase. Actif quand les variables PUBLIC_SUPABASE_* sont absentes.
import type { SupabaseClient } from '@supabase/supabase-js';
import { KEYS, read, write, reserved, nextOrderId, type Order, type Status } from './shopStore';

export type Category = { id: string; name: string };
export type Product = { id: string; category: string; name: string; format: string; price: number; stock: number; tags: string[] };
export type Catalog = { categories: Category[]; products: Product[] };
export type Session = { email: string; first: string; last: string };
export type OrderItemView = { id: string; name: string; format: string; qty: number; price: number };
export type OrderView = {
  id: string;
  number: string;
  status: Status;
  note: string;
  createdAt: string;
  customerId: string;
  first: string;
  last: string;
  email: string;
  items: OrderItemView[];
};

export type ShopApi = {
  live: boolean;
  restoreSession(): Promise<Session | null>;
  /** Crée le compte. `needsConfirm` : un courriel de confirmation a été envoyé. */
  signUp(email: string, password: string, first: string, last: string): Promise<{ needsConfirm: boolean }>;
  /** Erreurs : bad_login, not_confirmed. */
  signIn(email: string, password: string): Promise<Session>;
  resetPassword(email: string): Promise<void>;
  setNewPassword(password: string): Promise<void>;
  onPasswordRecovery(cb: () => void): void;
  signOut(): Promise<void>;
  loadCatalog(): Promise<Catalog>;
  placeOrder(items: { id: string; qty: number }[], note: string): Promise<{ number: string }>;
  myOrders(): Promise<OrderView[]>;
  cancelOrder(id: string): Promise<void>;
  /** Supprime le compte du client connecté (Loi 25). Erreurs : orders_in_progress, staff_account, generic. */
  deleteAccount(): Promise<void>;
  onChange(cb: () => void): () => void;
  /** Démo seulement : simule le clic sur le lien du courriel de confirmation. */
  demoConfirm?(email: string): Promise<void>;
};

export type StaffApi = {
  live: boolean;
  isSignedIn(): Promise<boolean>;
  signIn(email: string, password: string): Promise<boolean>;
  signOut(): Promise<void>;
  listOrders(): Promise<OrderView[]>;
  setStatus(id: string, status: Status): Promise<void>;
  onChange(cb: () => void): () => void;
  clearDemo?(): void;
};

const URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
export const isLive = Boolean(URL && KEY);

let clientPromise: Promise<SupabaseClient> | null = null;
const client = () => (clientPromise ??= import('@supabase/supabase-js').then((m) => m.createClient(URL!, KEY!)));

const fail = (error: { message?: string; status?: number } | null) => {
  if (error) throw Object.assign(new Error(error.message ?? 'error'), { status: error.status });
};

const normEmail = (e: string) => e.trim().toLowerCase();

// ======================================================================
// Mode réel (Supabase)
// ======================================================================
type Row = {
  id: string;
  number: string;
  status: Status;
  note: string;
  created_at: string;
  customer_id: string;
  customer: { first_name: string; last_name: string; email: string } | null;
  order_items: { product_id: string; name_fr: string; name_en: string; format_fr: string; format_en: string; qty: number; unit_price: number }[];
};

const ORDER_SELECT =
  'id, number, status, note, created_at, customer_id, customer:customers(first_name, last_name, email), order_items(product_id, name_fr, name_en, format_fr, format_en, qty, unit_price)';

function liveOrders(lang: string, rows: Row[]): OrderView[] {
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    status: r.status,
    note: r.note,
    createdAt: r.created_at,
    customerId: r.customer_id,
    first: r.customer?.first_name ?? '',
    last: r.customer?.last_name ?? '',
    email: r.customer?.email ?? '',
    items: r.order_items.map((i) => ({
      id: i.product_id,
      name: lang === 'fr' ? i.name_fr : i.name_en,
      format: lang === 'fr' ? i.format_fr : i.format_en,
      qty: i.qty,
      price: Number(i.unit_price),
    })),
  }));
}

function liveChannel(name: string, cb: () => void) {
  let stop = () => {};
  let cancelled = false;
  client().then((sb) => {
    if (cancelled) return;
    const ch = sb
      .channel(name)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => cb())
      .subscribe();
    stop = () => void sb.removeChannel(ch);
  });
  return () => {
    cancelled = true;
    stop();
  };
}

function liveShop(lang: string): ShopApi {
  const toSession = async (sb: SupabaseClient, uid: string, email: string): Promise<Session | null> => {
    const { data, error } = await sb.from('customers').select('first_name, last_name').eq('id', uid).maybeSingle();
    fail(error);
    return data ? { email, first: data.first_name, last: data.last_name } : null;
  };

  return {
    live: true,
    async restoreSession() {
      const sb = await client();
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      return user?.email ? toSession(sb, user.id, user.email) : null;
    },
    async signUp(email, password, first, last) {
      const sb = await client();
      const { data, error } = await sb.auth.signUp({
        email: normEmail(email),
        password,
        options: {
          data: { first_name: first, last_name: last },
          // Le lien du courriel ramène le client sur cette page, déjà connecté.
          emailRedirectTo: `${location.origin}${location.pathname}`,
        },
      });
      if (error) throw new Error(error.status === 429 ? 'rate_limited' : error.message.toLowerCase().includes('password') ? 'weak_password' : 'send_failed');
      return { needsConfirm: !data.session };
    },
    async signIn(email, password) {
      const sb = await client();
      const { data, error } = await sb.auth.signInWithPassword({ email: normEmail(email), password });
      if (error || !data.user) {
        throw new Error(error?.message.toLowerCase().includes('confirm') ? 'not_confirmed' : 'bad_login');
      }
      const s = await toSession(sb, data.user.id, data.user.email ?? normEmail(email));
      if (!s) throw new Error('bad_login');
      return s;
    },
    async resetPassword(email) {
      const sb = await client();
      const { error } = await sb.auth.resetPasswordForEmail(normEmail(email), { redirectTo: `${location.origin}${location.pathname}` });
      if (error && error.status === 429) throw new Error('rate_limited');
    },
    async setNewPassword(password) {
      const sb = await client();
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw new Error(error.message.toLowerCase().includes('password') ? 'weak_password' : 'generic');
    },
    onPasswordRecovery(cb) {
      client().then((sb) =>
        sb.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') cb();
        }),
      );
    },
    async signOut() {
      const sb = await client();
      await sb.auth.signOut();
    },
    async loadCatalog() {
      const sb = await client();
      const [cats, prods] = await Promise.all([
        sb.from('categories').select('id, name_fr, name_en').order('sort_order'),
        sb.from('products').select('id, category_id, name_fr, name_en, format_fr, format_en, price, stock, tags').eq('active', true).order('name_fr'),
      ]);
      fail(cats.error);
      fail(prods.error);
      const fr = lang === 'fr';
      return {
        categories: (cats.data ?? []).map((c) => ({ id: c.id, name: fr ? c.name_fr : c.name_en })),
        products: (prods.data ?? []).map((p) => ({
          id: p.id,
          category: p.category_id,
          name: fr ? p.name_fr : p.name_en,
          format: fr ? p.format_fr : p.format_en,
          price: Number(p.price),
          stock: p.stock,
          tags: ((p.tags ?? []) as { fr: string; en: string }[]).map((x) => (fr ? x.fr : x.en)),
        })),
      };
    },
    async placeOrder(items, note) {
      const sb = await client();
      const { data, error } = await sb.rpc('place_order', { p_items: items, p_note: note });
      fail(error);
      return { number: (data as { number: string }).number };
    },
    async myOrders() {
      const sb = await client();
      const { data, error } = await sb.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }).limit(50);
      fail(error);
      return liveOrders(lang, (data ?? []) as unknown as Row[]);
    },
    async cancelOrder(id) {
      const sb = await client();
      const { error } = await sb.rpc('cancel_my_order', { p_id: id });
      fail(error);
    },
    async deleteAccount() {
      const sb = await client();
      const { error } = await sb.rpc('delete_my_account');
      if (error) {
        const known = ['orders_in_progress', 'staff_account'];
        throw new Error(known.includes(error.message) ? error.message : 'generic');
      }
      // Le compte n'existe plus côté serveur : on vide seulement la session locale.
      await sb.auth.signOut({ scope: 'local' });
    },
    onChange: (cb) => liveChannel('shop-orders', cb),
  };
}

function liveStaff(lang: string): StaffApi {
  const check = async () => {
    const sb = await client();
    const { data } = await sb.auth.getSession();
    if (!data.session) return false;
    const { data: row } = await sb.from('staff').select('user_id').maybeSingle();
    return Boolean(row);
  };
  return {
    live: true,
    isSignedIn: check,
    async signIn(email, password) {
      const sb = await client();
      const { error } = await sb.auth.signInWithPassword({ email: normEmail(email), password });
      if (error) return false;
      if (await check()) return true;
      await sb.auth.signOut(); // un compte qui n'est pas dans la table « staff » ne passe pas
      return false;
    },
    async signOut() {
      const sb = await client();
      await sb.auth.signOut();
    },
    async listOrders() {
      const sb = await client();
      const { data, error } = await sb.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }).limit(200);
      fail(error);
      return liveOrders(lang, (data ?? []) as unknown as Row[]);
    },
    async setStatus(id, status) {
      const sb = await client();
      const { error } = await sb.rpc('set_order_status', { p_id: id, p_status: status });
      fail(error);
    },
    onChange: (cb) => liveChannel('staff-orders', cb),
  };
}

// ======================================================================
// Mode démo (navigateur seulement)
// ======================================================================
type DemoAccount = { first: string; last: string; hash: string; confirmed: boolean };
type DemoAccounts = Record<string, DemoAccount>;

// Empreinte du mot de passe (démo) : on ne garde jamais le mot de passe lui-même.
async function digest(email: string, password: string) {
  const bytes = new TextEncoder().encode(`${email}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function demoOrders(all: Order[]): OrderView[] {
  return [...all].reverse().map((o) => ({
    id: o.id,
    number: o.id,
    status: o.status,
    note: o.note,
    createdAt: o.createdAt,
    customerId: o.email,
    first: o.first,
    last: o.last,
    email: o.email,
    items: o.items.map((i) => ({ id: i.id, name: i.name, format: i.format, qty: i.qty, price: i.price })),
  }));
}

const storageListener = (cb: () => void) => {
  const fn = (e: StorageEvent) => {
    if (e.key === KEYS.orders) cb();
  };
  window.addEventListener('storage', fn);
  return () => window.removeEventListener('storage', fn);
};

function demoShop(catalog: Catalog): ShopApi {
  const accounts = () => read<DemoAccounts>(KEYS.customers, {});
  const orders = () => read<Order[]>(KEYS.orders, []);

  return {
    live: false,
    async restoreSession() {
      return read<Session | null>(KEYS.session, null);
    },
    async signUp(email, password, first, last) {
      const e = normEmail(email);
      const all = accounts();
      if (!all[e]) {
        all[e] = { first, last, hash: await digest(e, password), confirmed: false };
        write(KEYS.customers, all);
      }
      return { needsConfirm: true };
    },
    async signIn(email, password) {
      const e = normEmail(email);
      const a = accounts()[e];
      if (!a || a.hash !== (await digest(e, password))) throw new Error('bad_login');
      if (!a.confirmed) throw new Error('not_confirmed');
      const s = { email: e, first: a.first, last: a.last };
      write(KEYS.session, s);
      return s;
    },
    async resetPassword() {},
    async setNewPassword() {},
    onPasswordRecovery() {},
    async signOut() {
      write(KEYS.session, null);
    },
    async demoConfirm(email) {
      const all = accounts();
      const a = all[normEmail(email)];
      if (a) a.confirmed = true;
      write(KEYS.customers, all);
    },
    async loadCatalog() {
      const taken = reserved(orders());
      return { categories: catalog.categories, products: catalog.products.map((p) => ({ ...p, stock: Math.max(0, p.stock - (taken[p.id] ?? 0)) })) };
    },
    async placeOrder(items, note) {
      const s = read<Session | null>(KEYS.session, null);
      if (!s) throw new Error('not_registered');
      const all = orders();
      const taken = reserved(all);
      const lines = items.map(({ id, qty }) => {
        const p = catalog.products.find((x) => x.id === id);
        if (!p) throw new Error(`unknown_product:${id}`);
        if (p.stock - (taken[id] ?? 0) < qty) throw new Error(`out_of_stock:${id}`);
        return { id, name: p.name, format: p.format, qty, price: p.price };
      });
      const order: Order = { id: nextOrderId(all), email: s.email, first: s.first, last: s.last, items: lines, note, status: 'new', createdAt: new Date().toISOString() };
      write(KEYS.orders, [...all, order]);
      return { number: order.id };
    },
    async myOrders() {
      const s = read<Session | null>(KEYS.session, null);
      return demoOrders(orders().filter((o) => o.email === s?.email));
    },
    async cancelOrder(id) {
      const all = orders();
      const o = all.find((x) => x.id === id);
      if (o && o.status === 'new') o.status = 'cancelled';
      write(KEYS.orders, all);
    },
    async deleteAccount() {
      const s = read<Session | null>(KEYS.session, null);
      if (!s) throw new Error('generic');
      const all = orders();
      const mine = all.filter((o) => o.email === s.email);
      if (mine.some((o) => o.status === 'preparing' || o.status === 'ready')) throw new Error('orders_in_progress');
      for (const o of mine) {
        if (o.status === 'new') o.status = 'cancelled'; // le stock revient tout seul (calculé depuis les commandes)
        o.email = '';
        o.first = '';
        o.last = '';
        o.note = '';
      }
      write(KEYS.orders, all);
      const accts = accounts();
      delete accts[s.email];
      write(KEYS.customers, accts);
      write(KEYS.session, null);
    },
    onChange: storageListener,
  };
}

function demoStaff(): StaffApi {
  return {
    live: false,
    async isSignedIn() {
      return true;
    },
    async signIn() {
      return true;
    },
    async signOut() {},
    async listOrders() {
      return demoOrders(read<Order[]>(KEYS.orders, []));
    },
    async setStatus(id, status) {
      const all = read<Order[]>(KEYS.orders, []);
      const o = all.find((x) => x.id === id);
      if (o) o.status = status;
      write(KEYS.orders, all);
    },
    onChange: storageListener,
    clearDemo: () => write(KEYS.orders, []),
  };
}

export const createShopApi = (lang: string, demoCatalog: Catalog): ShopApi => (isLive ? liveShop(lang) : demoShop(demoCatalog));
export const createStaffApi = (lang: string): StaffApi => (isLive ? liveStaff(lang) : demoStaff());
