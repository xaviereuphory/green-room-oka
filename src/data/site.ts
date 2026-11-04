// Toutes les infos du commerce, à un seul endroit.
// Les champs marqués « À CONFIRMER » viennent du brief et doivent être validés avec le client.

export const site = {
  name: 'The Green Room',

  // À CONFIRMER : les réseaux affichent aussi « Kanehsatake ».
  address: {
    street: '443 rue St-Michel',
    city: 'Oka',
    region: 'QC',
    postalCode: 'J0N 1E0',
    country: 'CA',
    community: 'Kanehsatake',
  },

  phone: '438-686-4745',
  phoneHref: 'tel:+14386864745',

  // À CONFIRMER : une autre adresse apparaît ailleurs.
  email: 'greenroomoka@gmail.com',

  // À CONFIRMER : certains annuaires indiquent 23 h.
  hours: { open: '07:00', close: '00:00' },

  // Âge minimum pour entrer sur le site. À CONFIRMER avec l'avis juridique.
  minAge: 18,

  rating: { score: 4.9, count: 7000 },

  // Effets visuels de l'accueil. Mettre `smoke: false` pour retirer la fumée.
  // À valider avec l'avocat, comme le slogan et l'âge minimum.
  effects: { smoke: true },

  // Vitrine et commande à ramasser (prototype). `enabled: false` retire la section du site.
  // `showPrices: false` : aucun prix affiché (le brief demande de n'en montrer aucun). À valider avec l'avocat.
  shop: { enabled: true, showPrices: false },

  // Politique de confidentialité (Loi 25). Les valeurs `null` s'affichent comme « à confirmer » sur la page.
  privacy: {
    // Date de la dernière mise à jour de la politique (AAAA-MM-JJ). À changer à chaque modification.
    updated: '2026-11-04',
    // À CONFIRMER : par défaut, la loi désigne la personne la plus haut placée (le propriétaire).
    officer: { name: null as string | null, title: { fr: 'Propriétaire', en: 'Owner' } },
    // À CONFIRMER : idéalement une adresse dédiée, ex. confidentialite@thegreenroomoka.ca.
    email: null as string | null,
    // À CONFIRMER : durées de conservation, en mois.
    accountInactiveMonths: 24,
    orderMonths: 24,
    // À CONFIRMER : fournisseur d'envoi de courriels (Resend, Brevo…) et son pays d'hébergement.
    emailProvider: null as { name: string; country: { fr: string; en: string } } | null,
  },

  // Seul Instagram a un identifiant connu. Les autres liens sont à fournir par le client.
  socials: [
    { name: 'Instagram', href: 'https://www.instagram.com/thegreenroom443.official/' },
    { name: 'Facebook', href: '#' },
    { name: 'TikTok', href: '#' },
    { name: 'YouTube', href: '#' },
    { name: 'Kick', href: '#' },
    { name: 'Snapchat', href: '#' },
    { name: 'X', href: '#' },
  ],
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

export const mapsQuery = encodeURIComponent(fullAddress);
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
