// Événements à venir. Les entrées `sample: true` sont des EXEMPLES pour la maquette :
// elles s'affichent avec une étiquette « Exemple ». À remplacer par les vrais événements.
// Rappel du brief : pas de prix, de rabais, de concours ni de promotion.
import type { Lang } from '../i18n/ui';

export type EventItem = {
  id: string;
  date: string; // AAAA-MM-JJ
  time: string; // HH:MM, heure de Montréal
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  venue?: string; // id d'un volet (voir src/i18n/ui.ts)
  sample?: boolean;
};

export const events: EventItem[] = [
  {
    id: 'live-music-night',
    date: '2026-11-14',
    time: '20:00',
    title: { fr: 'Soirée musique live', en: 'Live music night' },
    text: { fr: 'Artiste à confirmer.', en: 'Artist to be announced.' },
    venue: 'music',
    sample: true,
  },
  {
    id: 'local-band',
    date: '2026-11-21',
    time: '21:00',
    title: { fr: "Spectacle d'un groupe local", en: 'Local band show' },
    text: { fr: 'Détails à venir.', en: 'Details coming soon.' },
    venue: 'roadhouse',
    sample: true,
  },
  {
    id: 'acoustic-night',
    date: '2026-12-05',
    time: '20:00',
    title: { fr: 'Soirée acoustique', en: 'Acoustic night' },
    text: { fr: 'Détails à venir.', en: 'Details coming soon.' },
    venue: 'music',
    sample: true,
  },
];
