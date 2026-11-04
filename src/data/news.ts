// Nouveautés. Les entrées `sample: true` sont des EXEMPLES pour la maquette :
// elles s'affichent avec une étiquette « Exemple ». À remplacer par les vraies nouvelles.
// Rappel du brief : pas de prix, de rabais, de concours ni de promotion.
import type { Lang } from '../i18n/ui';

export type NewsItem = {
  id: string;
  date: string; // AAAA-MM-JJ
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  venue?: string; // id d'un volet (voir src/i18n/ui.ts)
  sample?: boolean;
};

export const news: NewsItem[] = [
  {
    id: 'new-website',
    date: '2026-11-03',
    title: { fr: 'Un nouveau site pour The Green Room', en: 'A new website for The Green Room' },
    text: {
      fr: 'Heures, adresse et coordonnées, maintenant au même endroit, en français et en anglais.',
      en: 'Hours, address and contact info, now all in one place, in English and French.',
    },
    sample: true,
  },
  {
    id: 'kitchen-new-dish',
    date: '2026-10-20',
    title: { fr: 'Du nouveau à Pinecone Kitchen', en: "What's new at Pinecone Kitchen" },
    text: { fr: 'Un nouveau plat au menu. Détails à venir.', en: 'A new dish on the menu. Details coming soon.' },
    venue: 'kitchen',
    sample: true,
  },
  {
    id: 'stage-season',
    date: '2026-10-02',
    title: { fr: 'La scène se prépare pour l’hiver', en: 'The stage gets ready for winter' },
    text: { fr: 'La programmation de la saison sera annoncée bientôt.', en: "This season's lineup will be announced soon." },
    venue: 'music',
    sample: true,
  },
];
