// Texte de la politique de confidentialité (Loi 25), en français et en anglais.
// Les valeurs propres au commerce (responsable, courriel, durées) viennent de `site.privacy`.
// Version préliminaire : à faire valider par l'avocat du client avant la mise en ligne.

import { site } from '../data/site';
import type { Lang } from './ui';

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'ul'; items: string[] }
  // Blocs spéciaux, rendus par la page avec les infos de `site`.
  | { kind: 'officer' }
  | { kind: 'providers' }
  | { kind: 'cai' };

export type Section = { id: string; title: string; blocks: Block[] };

const p = site.privacy;
const minAge = site.minAge;

// Fournisseurs qui traitent des renseignements pour nous. `null` = à confirmer.
export function providers(lang: Lang) {
  const fr = lang === 'fr';
  return [
    {
      name: 'Supabase',
      role: fr ? 'Base de données, comptes clients et commandes' : 'Database, customer accounts and orders',
      where: fr ? 'Canada (Montréal)' : 'Canada (Montreal)',
    },
    {
      // À CONFIRMER : hébergement final prévu sur Cloudflare (voir le plan de sécurité).
      name: 'Cloudflare',
      role: fr ? 'Hébergement du site et protection contre les attaques' : 'Website hosting and protection against attacks',
      where: fr ? 'Réseau mondial' : 'Global network',
    },
    {
      name: p.emailProvider?.name ?? null,
      role: fr ? 'Envoi des courriels de confirmation de compte' : 'Sending account confirmation emails',
      where: p.emailProvider?.country[lang] ?? null,
    },
    {
      name: 'Google Maps',
      role: fr ? 'Carte affichée sur la page « Nous visiter »' : 'Map shown on the “Visit us” page',
      where: fr ? 'États-Unis' : 'United States',
    },
  ];
}

export const privacy = {
  fr: {
    eyebrow: 'Confidentialité',
    title: 'Vos renseignements',
    intro: 'Comment nous recueillons, utilisons et protégeons vos renseignements personnels, en termes simples.',
    updatedLabel: 'Dernière mise à jour',
    tocLabel: 'Sur cette page',
    todoLabel: 'À confirmer',
    summaryTitle: 'En bref',
    summary: [
      'Nous recueillons le minimum : votre nom, votre courriel et vos commandes.',
      'Nous ne vendons et ne louons jamais vos renseignements.',
      'Aucune publicité ciblée, aucun outil de suivi publicitaire.',
      'Vous pouvez consulter, corriger ou supprimer vos renseignements sur simple demande.',
    ],
    officerTitle: 'Responsable de la protection des renseignements personnels',
    officerTodo: 'Nom et courriel du responsable à fournir par le commerce.',
    providersHead: { name: 'Fournisseur', role: 'Rôle', where: 'Lieu' },
    providersTodo: 'À confirmer',
    caiText: 'Si vous n’êtes pas satisfait de notre réponse, vous pouvez porter plainte auprès de la',
    caiLink: 'Commission d’accès à l’information du Québec',
    sections: [
      {
        id: 'responsable',
        title: 'Qui est responsable',
        blocks: [
          { kind: 'p', text: `${site.name} est responsable des renseignements personnels recueillis sur ce site. Une personne est désignée pour répondre à toute question ou demande à ce sujet.` },
          { kind: 'officer' },
        ],
      },
      {
        id: 'recueil',
        title: 'Ce que nous recueillons',
        blocks: [
          { kind: 'h3', text: 'Quand vous naviguez' },
          { kind: 'p', text: 'Vous pouvez consulter le site sans créer de compte. Votre navigateur garde deux informations sur votre appareil seulement : votre confirmation d’âge et votre choix de langue. Elles ne nous sont pas envoyées.' },
          { kind: 'p', text: 'Comme tout site web, notre hébergeur reçoit des données techniques (adresse IP, type de navigateur) pour afficher les pages et bloquer les attaques. Nous n’utilisons aucun outil de statistiques ni de publicité.' },
          { kind: 'h3', text: 'Quand vous créez un compte pour commander' },
          { kind: 'ul', items: [
            'Votre prénom et, si vous le souhaitez, votre nom de famille.',
            'Votre adresse courriel.',
            'Votre mot de passe, enregistré sous forme chiffrée : personne chez nous ne peut le lire.',
            'Vos commandes : produits, quantités, note laissée pour l’équipe, statut et dates.',
          ] },
          { kind: 'p', text: 'Une fois connecté, votre navigateur garde un jeton de connexion pour que vous n’ayez pas à vous reconnecter à chaque page.' },
          { kind: 'h3', text: 'Quand vous nous écrivez' },
          { kind: 'p', text: 'Votre adresse courriel et le contenu de votre message, pour vous répondre.' },
          { kind: 'h3', text: 'Ce que nous ne recueillons pas' },
          { kind: 'ul', items: [
            'Votre date de naissance ou une copie de votre pièce d’identité. L’âge est vérifié en personne, au comptoir.',
            'Vos informations de paiement : aucun paiement ne se fait en ligne.',
            'Votre position géographique.',
          ] },
        ],
      },
      {
        id: 'utilisation',
        title: 'Pourquoi nous les utilisons',
        blocks: [
          { kind: 'p', text: 'Nous utilisons vos renseignements seulement pour les raisons suivantes :' },
          { kind: 'ul', items: [
            'Créer et gérer votre compte.',
            'Préparer vos commandes et vous les remettre au comptoir.',
            'Vous envoyer les courriels liés à votre compte (confirmation, mot de passe oublié).',
            'Répondre à vos questions.',
            'Protéger le site et nos clients contre la fraude et les attaques.',
          ] },
          { kind: 'p', text: 'Nous ne les utilisons pas pour de la publicité, ne faisons aucun profilage et ne prenons aucune décision automatisée à votre sujet.' },
        ],
      },
      {
        id: 'partage',
        title: 'Avec qui nous les partageons',
        blocks: [
          { kind: 'p', text: 'Nous ne vendons, ne louons et n’échangeons jamais vos renseignements. Seuls les fournisseurs ci-dessous y ont accès, uniquement pour faire fonctionner le site, et sous contrat.' },
          { kind: 'providers' },
          { kind: 'p', text: 'Certains de ces fournisseurs peuvent traiter des données à l’extérieur du Québec. Avant de leur confier vos renseignements, nous avons vérifié qu’ils offrent une protection adéquate.' },
          { kind: 'p', text: 'Nous pourrions aussi devoir communiquer des renseignements si la loi l’exige, par exemple sur ordonnance d’un tribunal.' },
        ],
      },
      {
        id: 'conservation',
        title: 'Combien de temps nous les gardons',
        blocks: [
          { kind: 'ul', items: [
            `Votre compte est gardé tant que vous l’utilisez. Sans connexion pendant ${p.accountInactiveMonths} mois, il est supprimé.`,
            `L’historique de vos commandes est gardé ${p.orderMonths} mois, puis rendu anonyme.`,
            'Les messages que vous nous envoyez sont supprimés une fois votre demande réglée.',
          ] },
          { kind: 'p', text: 'Si vous supprimez votre compte, vos renseignements sont effacés et vos commandes passées sont rendues anonymes.' },
        ],
      },
      {
        id: 'securite',
        title: 'Comment nous les protégeons',
        blocks: [
          { kind: 'ul', items: [
            'Toutes les communications avec le site sont chiffrées (HTTPS).',
            'Les mots de passe sont chiffrés et ne sont jamais visibles, même pour notre équipe.',
            'Chaque client ne peut voir que ses propres commandes.',
            'Seuls les employés autorisés, avec leur propre compte, voient les commandes à préparer.',
            'Notre base de données est sauvegardée régulièrement.',
          ] },
          { kind: 'p', text: 'Aucun système n’est infaillible. Si un incident touchait vos renseignements et présentait un risque de préjudice sérieux, nous vous en aviserions rapidement, ainsi que la Commission d’accès à l’information.' },
        ],
      },
      {
        id: 'droits',
        title: 'Vos droits',
        blocks: [
          { kind: 'p', text: 'Vous pouvez en tout temps :' },
          { kind: 'ul', items: [
            'Savoir quels renseignements nous détenons sur vous et en obtenir une copie.',
            'Faire corriger un renseignement inexact ou incomplet.',
            'Retirer votre consentement et supprimer votre compte vous-même, depuis « Mes commandes ».',
            'Obtenir vos renseignements dans un format courant, pour les transférer ailleurs.',
          ] },
          { kind: 'p', text: 'Écrivez au responsable dont les coordonnées figurent plus haut. Nous répondons dans un délai de 30 jours. Nous pourrions vous demander de confirmer votre identité, par exemple en écrivant depuis l’adresse courriel de votre compte.' },
          { kind: 'cai' },
        ],
      },
      {
        id: 'age',
        title: 'Âge minimum',
        blocks: [
          { kind: 'p', text: `Ce site est réservé aux personnes de ${minAge} ans et plus. Nous ne recueillons pas sciemment de renseignements sur des personnes plus jeunes. Si cela arrivait, écrivez-nous et nous les supprimerons.` },
        ],
      },
      {
        id: 'changements',
        title: 'Changements à cette politique',
        blocks: [
          { kind: 'p', text: 'Si nous modifions cette politique, la date de mise à jour en haut de la page changera. Si un changement touche la façon dont nous utilisons vos renseignements, nous vous en informerons par courriel avant qu’il s’applique.' },
        ],
      },
    ] satisfies Section[],
  },
  en: {
    eyebrow: 'Privacy',
    title: 'Your information',
    intro: 'How we collect, use and protect your personal information, in plain words.',
    updatedLabel: 'Last updated',
    tocLabel: 'On this page',
    todoLabel: 'To be confirmed',
    summaryTitle: 'In short',
    summary: [
      'We collect the minimum: your name, your email and your orders.',
      'We never sell or rent your information.',
      'No targeted ads, no advertising trackers.',
      'You can view, correct or delete your information just by asking.',
    ],
    officerTitle: 'Person in charge of the protection of personal information',
    officerTodo: 'Name and email of the person in charge, to be provided by the business.',
    providersHead: { name: 'Provider', role: 'Role', where: 'Location' },
    providersTodo: 'To be confirmed',
    caiText: 'If you are not satisfied with our answer, you can file a complaint with the',
    caiLink: 'Commission d’accès à l’information du Québec',
    sections: [
      {
        id: 'responsible',
        title: 'Who is responsible',
        blocks: [
          { kind: 'p', text: `${site.name} is responsible for the personal information collected on this site. One person is designated to answer any question or request about it.` },
          { kind: 'officer' },
        ],
      },
      {
        id: 'collect',
        title: 'What we collect',
        blocks: [
          { kind: 'h3', text: 'When you browse' },
          { kind: 'p', text: 'You can browse the site without an account. Your browser keeps two things on your device only: your age confirmation and your language choice. They are not sent to us.' },
          { kind: 'p', text: 'Like any website, our host receives technical data (IP address, browser type) to serve pages and block attacks. We use no analytics or advertising tools.' },
          { kind: 'h3', text: 'When you create an account to order' },
          { kind: 'ul', items: [
            'Your first name and, if you wish, your last name.',
            'Your email address.',
            'Your password, stored in encrypted form: no one on our side can read it.',
            'Your orders: products, quantities, note left for the team, status and dates.',
          ] },
          { kind: 'p', text: 'Once you sign in, your browser keeps a sign-in token so you don’t have to sign in again on every page.' },
          { kind: 'h3', text: 'When you write to us' },
          { kind: 'p', text: 'Your email address and the content of your message, so we can reply.' },
          { kind: 'h3', text: 'What we don’t collect' },
          { kind: 'ul', items: [
            'Your date of birth or a copy of your ID. Age is checked in person, at the counter.',
            'Your payment information: no payment is made online.',
            'Your location.',
          ] },
        ],
      },
      {
        id: 'use',
        title: 'Why we use it',
        blocks: [
          { kind: 'p', text: 'We use your information only to:' },
          { kind: 'ul', items: [
            'Create and manage your account.',
            'Prepare your orders and hand them to you at the counter.',
            'Send you emails about your account (confirmation, forgotten password).',
            'Answer your questions.',
            'Protect the site and our customers against fraud and attacks.',
          ] },
          { kind: 'p', text: 'We don’t use it for advertising, we do no profiling and we make no automated decisions about you.' },
        ],
      },
      {
        id: 'sharing',
        title: 'Who we share it with',
        blocks: [
          { kind: 'p', text: 'We never sell, rent or trade your information. Only the providers below have access to it, only to run the site, and under contract.' },
          { kind: 'providers' },
          { kind: 'p', text: 'Some of these providers may process data outside Québec. Before entrusting them with your information, we checked that they offer adequate protection.' },
          { kind: 'p', text: 'We may also have to disclose information when required by law, for example under a court order.' },
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        blocks: [
          { kind: 'ul', items: [
            `Your account is kept as long as you use it. After ${p.accountInactiveMonths} months without signing in, it is deleted.`,
            `Your order history is kept for ${p.orderMonths} months, then made anonymous.`,
            'Messages you send us are deleted once your request is resolved.',
          ] },
          { kind: 'p', text: 'If you delete your account, your information is erased and your past orders are made anonymous.' },
        ],
      },
      {
        id: 'security',
        title: 'How we protect it',
        blocks: [
          { kind: 'ul', items: [
            'All communication with the site is encrypted (HTTPS).',
            'Passwords are encrypted and never visible, even to our team.',
            'Each customer can only see their own orders.',
            'Only authorized staff, with their own account, see the orders to prepare.',
            'Our database is backed up regularly.',
          ] },
          { kind: 'p', text: 'No system is foolproof. If an incident affected your information and posed a risk of serious harm, we would promptly notify you and the Commission d’accès à l’information.' },
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        blocks: [
          { kind: 'p', text: 'At any time, you can:' },
          { kind: 'ul', items: [
            'Find out what information we hold about you and get a copy.',
            'Have inaccurate or incomplete information corrected.',
            'Withdraw your consent and delete your account yourself, from “My orders”.',
            'Get your information in a common format, to move it elsewhere.',
          ] },
          { kind: 'p', text: 'Write to the person in charge listed above. We reply within 30 days. We may ask you to confirm your identity, for example by writing from your account’s email address.' },
          { kind: 'cai' },
        ],
      },
      {
        id: 'age',
        title: 'Minimum age',
        blocks: [
          { kind: 'p', text: `This site is for people ${minAge} and older. We don’t knowingly collect information about younger people. If that happens, write to us and we will delete it.` },
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
          { kind: 'p', text: 'If we change this policy, the date at the top of the page will change. If a change affects how we use your information, we will let you know by email before it applies.' },
        ],
      },
    ] satisfies Section[],
  },
};
