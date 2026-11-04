-- Test de delete_my_account() sur un Postgres jetable (pas sur Supabase !).
-- psql -d test -f supabase/tests/mock_auth.sql -f supabase/schema.sql -f supabase/tests/delete_my_account.test.sql
\set ON_ERROR_STOP 1
insert into public.categories values ('c1','Cat','Cat',0);
insert into public.products (id, category_id, name_fr, name_en, price, stock) values ('p1','c1','P1','P1',5,5), ('p2','c1','P2','P2',5,10);
-- Le déclencheur crée les fiches clients.
insert into auth.users (id, email, raw_user_meta_data) values
 ('a0000000-0000-0000-0000-000000000001','alice@x.ca','{"first_name":"Alice"}'),
 ('b0000000-0000-0000-0000-000000000002','bob@x.ca','{"first_name":"Bob"}'),
 ('e0000000-0000-0000-0000-000000000003','eve@x.ca','{"first_name":"Eve"}');
insert into public.staff values ('e0000000-0000-0000-0000-000000000003');

-- Commandes passées par les vraies fonctions.
select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',false);
select number from public.place_order('[{"id":"p1","qty":2}]', 'Appeler Alice au 450-555-0000');
select number from public.place_order('[{"id":"p2","qty":1}]', 'merci');
select set_config('request.jwt.claim.sub','b0000000-0000-0000-0000-000000000002',false);
select number from public.place_order('[{"id":"p2","qty":3}]', '');
-- Employée : Alice GR-1002 ramassée, Bob GR-1003 en préparation.
select set_config('request.jwt.claim.sub','e0000000-0000-0000-0000-000000000003',false);
select status from public.set_order_status((select id from public.orders where number='GR-1002'),'preparing');
select status from public.set_order_status((select id from public.orders where number='GR-1002'),'ready');
select status from public.set_order_status((select id from public.orders where number='GR-1002'),'pickedup');
select status from public.set_order_status((select id from public.orders where number='GR-1003'),'preparing');
select set_config('request.jwt.claim.sub','',false);
do $$ begin assert (select stock from public.products where id='p1') = 3; end $$;

create function pg_temp.expect_error(uid text, code text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, false);
  begin perform public.delete_my_account();
  exception when others then
    perform set_config('request.jwt.claim.sub', '', false);
    if sqlerrm = code then raise notice 'OK refusé : %', code; return; end if;
    raise exception 'mauvaise erreur: % (attendu %)', sqlerrm, code;
  end;
  raise exception 'aurait dû être refusé : %', code;
end $$;
select pg_temp.expect_error('', 'not_authenticated');
select pg_temp.expect_error('e0000000-0000-0000-0000-000000000003', 'staff_account');
select pg_temp.expect_error('b0000000-0000-0000-0000-000000000002', 'orders_in_progress');

select set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',false);
select public.delete_my_account();
select set_config('request.jwt.claim.sub','',false);

do $$ begin
  assert not exists (select 1 from auth.users where id='a0000000-0000-0000-0000-000000000001'), 'compte encore là';
  assert not exists (select 1 from public.customers where email='alice@x.ca'), 'fiche encore là';
  assert (select count(*) from public.orders where number in ('GR-1001','GR-1002') and customer_id is null) = 2, 'commandes pas anonymisées';
  assert (select status from public.orders where number='GR-1001') = 'cancelled', 'commande nouvelle pas annulée';
  assert (select status from public.orders where number='GR-1002') = 'pickedup', 'historique modifié';
  assert (select count(*) from public.orders where number in ('GR-1001','GR-1002') and note <> '') = 0, 'notes pas effacées';
  assert (select stock from public.products where id='p1') = 5, 'stock pas remis';
  assert (select stock from public.products where id='p2') = 6, 'stock touché à tort';
  assert exists (select 1 from public.orders o join public.customers c on c.id=o.customer_id where o.number='GR-1003' and c.email='bob@x.ca'), 'Bob touché';
  assert has_function_privilege('authenticated','public.delete_my_account()','execute');
  assert not has_function_privilege('anon','public.delete_my_account()','execute');
  raise notice 'OK Alice supprimée, commandes anonymisées, stock remis, Bob intact, droits corrects';
end $$;

-- Le même courriel peut recréer un compte.
insert into auth.users (id, email) values ('a1000000-0000-0000-0000-000000000009','alice@x.ca');
do $$ begin assert exists (select 1 from public.customers where email='alice@x.ca'); raise notice 'OK réinscription avec le même courriel'; end $$;
