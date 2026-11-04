// Catalogue de la vitrine. PRODUITS FICTIFS pour la démo : à remplacer par l'export de la caisse du client.
// `price` est gardé dans les données (et copié dans chaque commande) mais n'est affiché
// que si `site.shop.showPrices` est vrai. `stock` : quantité disponible (0 = épuisé).
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

export type ShopCategory = { id: string; venue: string; name: L };
export type ShopProduct = {
  id: string;
  category: string;
  name: L;
  format: L;
  price: number;
  stock: number;
  tags?: L[];
};

export const categories: ShopCategory[] = [
  { id: 'bakery', venue: 'bakery', name: { fr: 'Boulangerie', en: 'Bakery' } },
  { id: 'pizza', venue: 'pizza', name: { fr: "Ma's Pizza", en: "Ma's Pizza" } },
  { id: 'kitchen', venue: 'kitchen', name: { fr: 'Pinecone Kitchen', en: 'Pinecone Kitchen' } },
  { id: 'drinks', venue: 'kitchen', name: { fr: 'Boissons sans alcool', en: 'Soft drinks' } },
];

export const products: ShopProduct[] = [
  { id: 'baguette', category: 'bakery', name: { fr: 'Baguette tradition', en: 'Traditional baguette' }, format: { fr: '1 unité', en: '1 piece' }, price: 3.5, stock: 24 },
  { id: 'croissant', category: 'bakery', name: { fr: 'Croissant au beurre', en: 'Butter croissant' }, format: { fr: '1 unité', en: '1 piece' }, price: 3.25, stock: 18 },
  { id: 'levain', category: 'bakery', name: { fr: 'Pain au levain', en: 'Sourdough loaf' }, format: { fr: '900 g', en: '900 g' }, price: 8, stock: 3, tags: [{ fr: 'Fait le matin', en: 'Baked in the morning' }] },
  { id: 'chocolatine', category: 'bakery', name: { fr: 'Chocolatine', en: 'Chocolate croissant' }, format: { fr: '1 unité', en: '1 piece' }, price: 3.75, stock: 14 },

  { id: 'margherita', category: 'pizza', name: { fr: 'Pizza margherita', en: 'Margherita pizza' }, format: { fr: '12 po', en: '12 in' }, price: 16, stock: 10, tags: [{ fr: 'Végétarien', en: 'Vegetarian' }] },
  { id: 'pepperoni', category: 'pizza', name: { fr: 'Pizza pepperoni', en: 'Pepperoni pizza' }, format: { fr: '12 po', en: '12 in' }, price: 18, stock: 10 },
  { id: 'veggie', category: 'pizza', name: { fr: 'Pizza végétarienne', en: 'Veggie pizza' }, format: { fr: '12 po', en: '12 in' }, price: 18, stock: 2, tags: [{ fr: 'Végétarien', en: 'Vegetarian' }] },

  { id: 'poutine', category: 'kitchen', name: { fr: 'Poutine classique', en: 'Classic poutine' }, format: { fr: 'Régulière', en: 'Regular' }, price: 11, stock: 12 },
  { id: 'club', category: 'kitchen', name: { fr: 'Club sandwich', en: 'Club sandwich' }, format: { fr: 'Avec frites', en: 'With fries' }, price: 15, stock: 9 },
  { id: 'cesar', category: 'kitchen', name: { fr: 'Salade césar', en: 'Caesar salad' }, format: { fr: 'Repas', en: 'Meal size' }, price: 13, stock: 0 },
  { id: 'ailes', category: 'kitchen', name: { fr: 'Ailes de poulet', en: 'Chicken wings' }, format: { fr: '10 morceaux', en: '10 pieces' }, price: 14, stock: 15 },

  { id: 'cafe', category: 'drinks', name: { fr: 'Café filtre', en: 'Filter coffee' }, format: { fr: 'Grand', en: 'Large' }, price: 3, stock: 40 },
  { id: 'limonade', category: 'drinks', name: { fr: 'Limonade maison', en: 'Homemade lemonade' }, format: { fr: '500 ml', en: '500 ml' }, price: 4.5, stock: 20 },
  { id: 'kombucha', category: 'drinks', name: { fr: 'Kombucha', en: 'Kombucha' }, format: { fr: '355 ml', en: '355 ml' }, price: 5, stock: 2 },
  { id: 'eau', category: 'drinks', name: { fr: 'Eau pétillante', en: 'Sparkling water' }, format: { fr: '500 ml', en: '500 ml' }, price: 2.5, stock: 30 },
];
