-- The Green Room : vitrine et commande à ramasser.
-- À exécuter une fois dans Supabase (SQL Editor). Sûr à relancer : tout est « if not exists » ou « create or replace ».

-- ---------- Tables ----------
create table if not exists public.categories (
  id         text primary key,
  name_fr    text not null,
  name_en    text not null,
  sort_order int  not null default 0
);

create table if not exists public.products (
  id          text primary key,
  category_id text not null references public.categories (id),
  name_fr     text not null,
  name_en     text not null,
  format_fr   text not null default '',
  format_en   text not null default '',
  price       numeric(8, 2) not null check (price >= 0),
  stock       int  not null default 0 check (stock >= 0),
  tags        jsonb not null default '[]',      -- [{ "fr": "...", "en": "..." }]
  image_url   text,
  active      boolean not null default true
);

-- Un client = un compte Supabase Auth (courriel + mot de passe, courriel confirmé une première fois).
-- La fiche est créée automatiquement à l'inscription (voir le déclencheur plus bas).
create table if not exists public.customers (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  first_name text not null default '',
  last_name  text not null default '',
  created_at timestamptz not null default now()
);

-- Employés : un compte (courriel + mot de passe) ajouté à cette table à la main.
create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique default ('GR-' || nextval('public.order_number_seq')),
  -- Facultatif : quand un client supprime son compte, ses commandes restent sans nom (on delete set null).
  customer_id   uuid references public.customers (id) on delete set null,
  status        text not null default 'new' check (status in ('new', 'preparing', 'ready', 'pickedup', 'cancelled')),
  note          text not null default '' check (char_length(note) <= 200),
  created_at    timestamptz not null default now(),
  ready_at      timestamptz,
  picked_up_at  timestamptz
);

-- Le nom, le format et le prix sont copiés : l'historique reste juste si le catalogue change.
create table if not exists public.order_items (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  name_fr    text not null,
  name_en    text not null,
  format_fr  text not null default '',
  format_en  text not null default '',
  qty        int  not null check (qty > 0),
  unit_price numeric(8, 2) not null
);

create index if not exists orders_customer_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- Sécurité par ligne (RLS) ----------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.staff       enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- La vitrine n'est visible qu'après la connexion (rôle « authenticated »).
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select to authenticated using (true);

drop policy if exists products_read on public.products;
create policy products_read on public.products for select to authenticated using (active or public.is_staff());

drop policy if exists products_staff_write on public.products;
create policy products_staff_write on public.products for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists customers_read on public.customers;
create policy customers_read on public.customers for select to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists staff_self on public.staff;
create policy staff_self on public.staff for select to authenticated using (user_id = auth.uid());

drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated
  using (customer_id = auth.uid() or public.is_staff());

drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff())));

-- Aucune écriture directe sur customers, orders et order_items : tout passe par le déclencheur et les fonctions ci-dessous.

-- ---------- Fonctions ----------
-- À l'inscription, crée la fiche du client avec le prénom et le nom donnés dans le formulaire.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, email, first_name, last_name)
  values (
    new.id,
    lower(new.email),
    left(btrim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 60),
    left(btrim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 60)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- p_items : [{ "id": "baguette", "qty": 2 }, ...]. Vérifie le stock, le réserve et crée la commande en un seul geste.
create or replace function public.place_order(p_items jsonb, p_note text default '')
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order  public.orders;
  v_line   record;
  v_prod   public.products;
  v_open   int;
begin
  if auth.uid() is null or not exists (select 1 from public.customers where id = auth.uid()) then
    raise exception 'not_registered';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then
    raise exception 'invalid_items';
  end if;

  -- Limite simple contre les abus : 5 commandes ouvertes à la fois.
  select count(*) into v_open from public.orders
   where customer_id = auth.uid() and status in ('new', 'preparing', 'ready');
  if v_open >= 5 then
    raise exception 'too_many_open_orders';
  end if;

  insert into public.orders (customer_id, note)
  values (auth.uid(), left(btrim(coalesce(p_note, '')), 200))
  returning * into v_order;

  for v_line in
    select (e ->> 'id') as id, sum((e ->> 'qty')::int) as qty
      from jsonb_array_elements(p_items) e
     group by 1
     order by 1  -- ordre fixe : évite les blocages entre deux commandes simultanées
  loop
    if v_line.qty is null or v_line.qty < 1 or v_line.qty > 20 then
      raise exception 'invalid_qty:%', v_line.id;
    end if;
    select * into v_prod from public.products where id = v_line.id and active for update;
    if not found then
      raise exception 'unknown_product:%', v_line.id;
    end if;
    if v_prod.stock < v_line.qty then
      raise exception 'out_of_stock:%', v_line.id;
    end if;
    update public.products set stock = stock - v_line.qty where id = v_prod.id;
    insert into public.order_items (order_id, product_id, name_fr, name_en, format_fr, format_en, qty, unit_price)
    values (v_order.id, v_prod.id, v_prod.name_fr, v_prod.name_en, v_prod.format_fr, v_prod.format_en, v_line.qty, v_prod.price);
  end loop;

  return v_order;
end;
$$;

-- Remet en stock les produits d'une commande annulée.
create or replace function public.restock_order(p_order uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p
     set stock = p.stock + i.qty
    from public.order_items i
   where i.order_id = p_order and i.product_id = p.id;
$$;
revoke all on function public.restock_order(uuid) from public, anon, authenticated;

create or replace function public.cancel_my_order(p_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders
   where id = p_id and customer_id = auth.uid() for update;
  if not found then
    raise exception 'not_found';
  end if;
  if v_order.status <> 'new' then
    raise exception 'cannot_cancel';
  end if;
  update public.orders set status = 'cancelled' where id = p_id returning * into v_order;
  perform public.restock_order(p_id);
  return v_order;
end;
$$;

-- Employés seulement : new → preparing → ready → pickedup, ou annulation avant « prête ».
create or replace function public.set_order_status(p_id uuid, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;
  select * into v_order from public.orders where id = p_id for update;
  if not found then
    raise exception 'not_found';
  end if;

  if not (
       (v_order.status = 'new'       and p_status in ('preparing', 'cancelled'))
    or (v_order.status = 'preparing' and p_status in ('ready', 'cancelled'))
    or (v_order.status = 'ready'     and p_status = 'pickedup')
  ) then
    raise exception 'invalid_transition';
  end if;

  update public.orders
     set status       = p_status,
         ready_at     = case when p_status = 'ready'    then now() else ready_at end,
         picked_up_at = case when p_status = 'pickedup' then now() else picked_up_at end
   where id = p_id
   returning * into v_order;

  if p_status = 'cancelled' then
    perform public.restock_order(p_id);
  end if;
  return v_order;
end;
$$;

-- Seuls les utilisateurs connectés peuvent appeler ces fonctions.
revoke all on function public.place_order(jsonb, text)      from public, anon;
revoke all on function public.cancel_my_order(uuid)         from public, anon;
revoke all on function public.set_order_status(uuid, text)  from public, anon;
revoke all on function public.is_staff()                    from public, anon;
grant execute on function public.place_order(jsonb, text)     to authenticated;
grant execute on function public.cancel_my_order(uuid)        to authenticated;
grant execute on function public.set_order_status(uuid, text) to authenticated;
grant execute on function public.is_staff()                   to authenticated;

-- ---------- Temps réel pour l'écran employé ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.orders;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- ---------- Suppression de compte par le client (Loi 25) ----------
-- delete_my_account() : refuse si une commande est en préparation ou prête, ou pour un compte employé ;
-- annule les commandes nouvelles (stock remis), efface les notes, supprime la fiche et le compte.
-- Les commandes passées restent pour les registres du commerce, sans lien vers une personne.

-- Bases créées avant cette section : rendre customer_id facultatif et « on delete set null ».
-- Les commandes doivent survivre à la suppression du client, sans lien vers lui.
alter table public.orders alter column customer_id drop not null;

-- Remplace la clé étrangère orders.customer_id (quel que soit son nom actuel)
-- par une version « on delete set null ».
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_attribute a
      on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
    where con.conrelid = 'public.orders'::regclass
      and con.contype = 'f'
      and a.attname = 'customer_id'
  loop
    execute format('alter table public.orders drop constraint %I', c.conname);
  end loop;
end
$$;

alter table public.orders
  add constraint orders_customer_id_fkey
  foreign key (customer_id) references public.customers (id) on delete set null;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  o record;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Un compte employé se retire par le propriétaire, pas depuis la boutique.
  if exists (select 1 from public.staff s where s.user_id = uid) then
    raise exception 'staff_account' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.orders
    where customer_id = uid and status in ('preparing', 'ready')
  ) then
    raise exception 'orders_in_progress' using errcode = 'P0001';
  end if;

  -- Même chemin qu'une annulation par le client : stock remis en vente.
  for o in
    select id from public.orders
    where customer_id = uid and status = 'new'
  loop
    perform public.cancel_my_order(o.id);
  end loop;

  -- La note peut contenir des renseignements personnels.
  update public.orders set note = '' where customer_id = uid;

  -- Fiche client (les commandes passent à customer_id = null), puis compte.
  delete from public.customers where id = uid;
  delete from auth.users where id = uid;
end
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
