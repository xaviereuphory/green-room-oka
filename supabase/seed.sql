-- Catalogue de démonstration (produits FICTIFS). Généré depuis src/data/shop.ts.
-- À remplacer par l'import de la caisse du client. Sûr à relancer : ne touche pas au stock existant.

insert into public.categories (id, name_fr, name_en, sort_order) values
  ('bakery', 'Boulangerie', 'Bakery', 0),
  ('pizza', 'Ma''s Pizza', 'Ma''s Pizza', 1),
  ('kitchen', 'Pinecone Kitchen', 'Pinecone Kitchen', 2),
  ('drinks', 'Boissons sans alcool', 'Soft drinks', 3)
on conflict (id) do update set name_fr = excluded.name_fr, name_en = excluded.name_en, sort_order = excluded.sort_order;

insert into public.products (id, category_id, name_fr, name_en, format_fr, format_en, price, stock, tags) values
  ('baguette', 'bakery', 'Baguette tradition', 'Traditional baguette', '1 unité', '1 piece', 3.5, 24, '[]'::jsonb),
  ('croissant', 'bakery', 'Croissant au beurre', 'Butter croissant', '1 unité', '1 piece', 3.25, 18, '[]'::jsonb),
  ('levain', 'bakery', 'Pain au levain', 'Sourdough loaf', '900 g', '900 g', 8, 3, '[{"fr":"Fait le matin","en":"Baked in the morning"}]'::jsonb),
  ('chocolatine', 'bakery', 'Chocolatine', 'Chocolate croissant', '1 unité', '1 piece', 3.75, 14, '[]'::jsonb),
  ('margherita', 'pizza', 'Pizza margherita', 'Margherita pizza', '12 po', '12 in', 16, 10, '[{"fr":"Végétarien","en":"Vegetarian"}]'::jsonb),
  ('pepperoni', 'pizza', 'Pizza pepperoni', 'Pepperoni pizza', '12 po', '12 in', 18, 10, '[]'::jsonb),
  ('veggie', 'pizza', 'Pizza végétarienne', 'Veggie pizza', '12 po', '12 in', 18, 2, '[{"fr":"Végétarien","en":"Vegetarian"}]'::jsonb),
  ('poutine', 'kitchen', 'Poutine classique', 'Classic poutine', 'Régulière', 'Regular', 11, 12, '[]'::jsonb),
  ('club', 'kitchen', 'Club sandwich', 'Club sandwich', 'Avec frites', 'With fries', 15, 9, '[]'::jsonb),
  ('cesar', 'kitchen', 'Salade césar', 'Caesar salad', 'Repas', 'Meal size', 13, 0, '[]'::jsonb),
  ('ailes', 'kitchen', 'Ailes de poulet', 'Chicken wings', '10 morceaux', '10 pieces', 14, 15, '[]'::jsonb),
  ('cafe', 'drinks', 'Café filtre', 'Filter coffee', 'Grand', 'Large', 3, 40, '[]'::jsonb),
  ('limonade', 'drinks', 'Limonade maison', 'Homemade lemonade', '500 ml', '500 ml', 4.5, 20, '[]'::jsonb),
  ('kombucha', 'drinks', 'Kombucha', 'Kombucha', '355 ml', '355 ml', 5, 2, '[]'::jsonb),
  ('eau', 'drinks', 'Eau pétillante', 'Sparkling water', '500 ml', '500 ml', 2.5, 30, '[]'::jsonb)
on conflict (id) do update set category_id = excluded.category_id, name_fr = excluded.name_fr, name_en = excluded.name_en,
  format_fr = excluded.format_fr, format_en = excluded.format_en, price = excluded.price, tags = excluded.tags;
