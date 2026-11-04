-- À n'utiliser QUE si une ancienne version de schema.sql (connexion par téléphone) a déjà été exécutée.
-- Supprime les tables et fonctions de la vitrine (donc les commandes et clients de test), puis relancer schema.sql et seed.sql.
-- Ne touche pas aux comptes de auth.users.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.save_profile(text, text) cascade;
drop function if exists public.place_order(jsonb, text) cascade;
drop function if exists public.cancel_my_order(uuid) cascade;
drop function if exists public.set_order_status(uuid, text) cascade;
drop function if exists public.restock_order(uuid) cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.customers cascade;
drop table if exists public.staff cascade;
drop sequence if exists public.order_number_seq;
drop function if exists public.is_staff() cascade;
