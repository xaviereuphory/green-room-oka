import { site } from '../data/site';

export type Lang = 'fr' | 'en';
export type PageKey = 'home' | 'about' | 'news' | 'events' | 'visit';

// Dossier de base du site (vide en local et sur le vrai domaine, « /green-room-oka » pour l'aperçu).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (path: string) => base + path;

// Chaque page existe dans les deux langues. Le bouton FR/EN pointe vers l'équivalent.
export const routes: Record<PageKey, Record<Lang, string>> = {
  home: { fr: withBase('/'), en: withBase('/en/') },
  about: { fr: withBase('/a-propos/'), en: withBase('/en/about/') },
  news: { fr: withBase('/nouveautes/'), en: withBase('/en/news/') },
  events: { fr: withBase('/evenements/'), en: withBase('/en/events/') },
  visit: { fr: withBase('/visiter/'), en: withBase('/en/visit/') },
};

// Date « 2026-11-14 » → éléments affichables, sans décalage de fuseau.
export function dateParts(date: string, lang: Lang) {
  const d = new Date(`${date}T12:00:00Z`);
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o }).format(d);
  return {
    day: fmt({ day: 'numeric' }),
    month: fmt({ month: 'short' }).replace('.', ''),
    weekday: fmt({ weekday: 'long' }),
    long: fmt({ day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export function formatTime(time: string, lang: Lang): string {
  const [h, m] = time.split(':').map(Number);
  if (h === 0 && m === 0) return lang === 'fr' ? 'minuit' : 'midnight';
  if (lang === 'fr') return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
  const suffix = h < 12 ? 'a.m.' : 'p.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
}

export function hoursLabel(lang: Lang): string {
  const open = formatTime(site.hours.open, lang);
  const close = formatTime(site.hours.close, lang);
  return lang === 'fr' ? `${open} à ${close}` : `${open} to ${close}`;
}

export function ratingLabels(lang: Lang) {
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  return {
    score: new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(site.rating.score),
    count: new Intl.NumberFormat(locale).format(site.rating.count),
  };
}

// Les volets du lieu. `kind` = étiquette courte affichée dans la liste de l'accueil.
// Quand un volet aura sa page de détails, ajouter `href: { fr: '/volets/...', en: '/en/...' }`
// et la ligne devient cliquable automatiquement.
type Venue = {
  id: string;
  name: Record<Lang, string>;
  kind: Record<Lang, string>;
  href?: Record<Lang, string>;
};

export const venues: Venue[] = [
  { id: 'roadhouse', name: { fr: 'Roadhouse Bar', en: 'Roadhouse Bar' }, kind: { fr: 'Bar', en: 'Bar' } },
  { id: 'kitchen', name: { fr: 'Pinecone Kitchen', en: 'Pinecone Kitchen' }, kind: { fr: 'Cuisine', en: 'Kitchen' } },
  { id: 'pizza', name: { fr: "Ma's Pizza", en: "Ma's Pizza" }, kind: { fr: 'Pizzeria', en: 'Pizzeria' } },
  { id: 'bakery', name: { fr: 'Boulangerie', en: 'Bakery' }, kind: { fr: 'Pain et pâtisseries', en: 'Bread and pastries' } },
  { id: 'music', name: { fr: 'Musique live', en: 'Live music' }, kind: { fr: 'Spectacles', en: 'Shows' } },
  { id: 'casino', name: { fr: 'Casino', en: 'Casino' }, kind: { fr: 'Salle de jeux', en: 'Gaming room' } },
  { id: 'gas', name: { fr: 'Green Room Gas', en: 'Green Room Gas' }, kind: { fr: 'Station-service', en: 'Gas station' } },
];

export const ui = {
  fr: {
    meta: {
      home: { title: 'The Green Room · Oka', description: 'Bar, cuisine, pizzeria, boulangerie, musique live et plus, au 443 rue St-Michel à Oka. Ouvert 7 jours sur 7.' },
      about: { title: 'À propos · The Green Room', description: "L'histoire, l'ambiance et l'équipe de The Green Room, à Oka." },
      visit: { title: 'Nous visiter · The Green Room', description: 'Heures, adresse, itinéraire et coordonnées de The Green Room, à Oka.' },
      news: { title: 'Nouveautés · The Green Room', description: 'Les dernières nouvelles de The Green Room, à Oka.' },
      events: { title: 'Événements · The Green Room', description: 'Spectacles et soirées à venir à The Green Room, à Oka.' },
    },
    nav: { home: 'Accueil', about: 'À propos', news: 'Nouveautés', events: 'Événements', visit: 'Nous visiter', menu: 'Menu', close: 'Fermer' },
    sample: 'Exemple',
    follow: {
      text: 'Pour ne rien manquer, suivez-nous sur Instagram.',
      button: 'Voir notre Instagram',
    },
    news: {
      eyebrow: 'Nouveautés',
      title: 'Quoi de neuf',
      intro: 'Les dernières nouvelles du lieu.',
      empty: 'Aucune nouveauté pour le moment.',
    },
    events: {
      eyebrow: 'Événements',
      title: "À l'affiche",
      intro: 'Les spectacles et soirées à venir.',
      empty: 'Aucun événement annoncé pour le moment.',
    },
    langSwitch: 'Changer de langue',
    skip: 'Aller au contenu',
    photo: 'Photo à venir',
    ageGate: {
      eyebrow: 'Bienvenue',
      question: `Avez-vous ${site.minAge} ans ou plus ?`,
      note: `Ce site est réservé aux personnes de ${site.minAge} ans et plus.`,
      yes: `Oui, j'ai ${site.minAge} ans ou plus`,
      no: 'Non',
      denied: `Désolé, vous devez avoir ${site.minAge} ans ou plus pour accéder à ce site.`,
    },
    home: {
      eyebrow: 'Oka · Kanehsatake',
      lead: 'Un bar, une cuisine, une scène et bien plus, sous un même toit.',
      ctaVisit: 'Planifier ma visite',
      ctaCall: 'Appeler',
      openEveryDay: 'Ouvert tous les jours',
      venuesEyebrow: 'Sous un même toit',
      venuesTitle: 'Un lieu, plusieurs volets',
      ratingOutOf: 'sur 5',
      ratingCount: (n: string) => `Plus de ${n} avis publics`,
      ctaTitle: 'Venez nous voir',
      ctaText: 'Ouvert tous les jours, au 443 rue St-Michel.',
      ctaButton: 'Heures et itinéraire',
    },
    visit: {
      eyebrow: 'Nous visiter',
      title: 'Heures et adresse',
      intro: 'Toutes les infos pour passer nous voir ou nous joindre.',
      hoursTitle: 'Heures',
      everyDay: '7 jours sur 7',
      days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      today: "Aujourd'hui",
      addressTitle: 'Adresse',
      directions: 'Itinéraire',
      mapTitle: 'Carte de The Green Room',
      contactTitle: 'Nous joindre',
      call: 'Téléphone',
      write: 'Courriel',
      followTitle: 'Suivez-nous',
    },
    about: {
      eyebrow: 'À propos',
      title: 'The Green Room',
      intro: 'Un lieu de rencontre à Oka, ouvert tous les jours de tôt le matin jusqu’à tard le soir.',
      storyTitle: 'Notre histoire',
      storyTodo: "L'histoire du lieu : comment il a commencé, qui l'a lancé, ce qui a changé au fil des ans. À écrire avec l'équipe.",
      ambianceTitle: "L'ambiance",
      ambianceTodo: "Ce qu'on ressent en entrant : la musique, les habitués, les soirées. À écrire avec l'équipe.",
      teamTitle: "L'équipe",
      teamTodo: 'Photo et nom à venir',
      todoLabel: 'Contenu à venir',
    },
    footer: {
      hours: 'Heures',
      contact: 'Contact',
      follow: 'Suivez-nous',
      ageNote: `Réservé aux ${site.minAge} ans et plus.`,
      rights: 'Tous droits réservés.',
    },
  },
  en: {
    meta: {
      home: { title: 'The Green Room · Oka', description: 'Bar, kitchen, pizzeria, bakery, live music and more, at 443 rue St-Michel in Oka. Open 7 days a week.' },
      about: { title: 'About · The Green Room', description: 'The story, atmosphere and team behind The Green Room in Oka.' },
      visit: { title: 'Visit · The Green Room', description: 'Hours, address, directions and contact info for The Green Room in Oka.' },
      news: { title: 'News · The Green Room', description: 'The latest news from The Green Room in Oka.' },
      events: { title: 'Events · The Green Room', description: 'Upcoming shows and nights out at The Green Room in Oka.' },
    },
    nav: { home: 'Home', about: 'About', news: 'News', events: 'Events', visit: 'Visit us', menu: 'Menu', close: 'Close' },
    sample: 'Example',
    follow: {
      text: "Don't miss a thing: follow us on Instagram.",
      button: 'See our Instagram',
    },
    news: {
      eyebrow: 'News',
      title: "What's new",
      intro: 'The latest from the place.',
      empty: 'No news for now.',
    },
    events: {
      eyebrow: 'Events',
      title: 'Coming up',
      intro: 'Upcoming shows and nights out.',
      empty: 'No events announced for now.',
    },
    langSwitch: 'Change language',
    skip: 'Skip to content',
    photo: 'Photo coming soon',
    ageGate: {
      eyebrow: 'Welcome',
      question: `Are you ${site.minAge} or older?`,
      note: `This site is for people ${site.minAge} and older.`,
      yes: `Yes, I'm ${site.minAge} or older`,
      no: 'No',
      denied: `Sorry, you must be ${site.minAge} or older to visit this site.`,
    },
    home: {
      eyebrow: 'Oka · Kanehsatake',
      lead: 'A bar, a kitchen, a stage and much more, all under one roof.',
      ctaVisit: 'Plan my visit',
      ctaCall: 'Call',
      openEveryDay: 'Open every day',
      venuesEyebrow: 'Under one roof',
      venuesTitle: 'One place, many sides',
      ratingOutOf: 'out of 5',
      ratingCount: (n: string) => `Over ${n} public reviews`,
      ctaTitle: 'Come see us',
      ctaText: 'Open every day, at 443 rue St-Michel.',
      ctaButton: 'Hours and directions',
    },
    visit: {
      eyebrow: 'Visit us',
      title: 'Hours and address',
      intro: 'Everything you need to stop by or get in touch.',
      hoursTitle: 'Hours',
      everyDay: '7 days a week',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      today: 'Today',
      addressTitle: 'Address',
      directions: 'Directions',
      mapTitle: 'Map of The Green Room',
      contactTitle: 'Get in touch',
      call: 'Phone',
      write: 'Email',
      followTitle: 'Follow us',
    },
    about: {
      eyebrow: 'About',
      title: 'The Green Room',
      intro: 'A gathering place in Oka, open every day from early morning until late at night.',
      storyTitle: 'Our story',
      storyTodo: 'The story of the place: how it started, who started it, what has changed over the years. To be written with the team.',
      ambianceTitle: 'The atmosphere',
      ambianceTodo: 'What it feels like to walk in: the music, the regulars, the nights out. To be written with the team.',
      teamTitle: 'The team',
      teamTodo: 'Photo and name coming soon',
      todoLabel: 'Content coming soon',
    },
    footer: {
      hours: 'Hours',
      contact: 'Contact',
      follow: 'Follow us',
      ageNote: `For ages ${site.minAge} and up.`,
      rights: 'All rights reserved.',
    },
  },
} as const;
