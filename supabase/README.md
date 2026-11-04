# Mise en route : Supabase (comptes clients et commandes)

Le site fonctionne **sans rien de ceci** (mode démo dans le navigateur). Ces étapes le branchent à une vraie base de données. Compter environ 30 minutes. Aucun SMS, donc aucun frais Twilio.

Comment ça marche : le client crée un compte avec son courriel, un mot de passe et son prénom. Il confirme son courriel une première fois (lien reçu par courriel), puis se connecte avec son courriel et son mot de passe chaque fois. Le commerçant voit le nom, le courriel et le nombre de commandes de chaque client sur l'écran employé.

Fichiers : `schema.sql` (tables, règles de sécurité, fonctions de commande), `seed.sql` (catalogue fictif), `reset.sql` (repartir de zéro). Le site passe en mode réel dès que `PUBLIC_SUPABASE_URL` et `PUBLIC_SUPABASE_ANON_KEY` existent dans `.env`.

## 1. Créer le projet
1. supabase.com, nouveau projet. **Région : Canada (Central)** (renseignements personnels, Loi 25).
2. *Project Settings → API* : copier **Project URL** et la clé **anon public**.
3. Les coller dans le fichier `.env` du projet (copie de `.env.example`). Jamais la clé `service_role`.
4. Redémarrer `npm run dev` (le fichier n'est lu qu'au démarrage).

## 2. Base de données
*SQL Editor* : exécuter `schema.sql`, puis `seed.sql` (produits fictifs, à remplacer par le vrai catalogue).
Si une **ancienne version** (connexion par téléphone) a déjà été exécutée : exécuter d'abord `reset.sql`.

## 3. Connexion par courriel
*Authentication → Providers → Email* :
- **Enable Email provider** : activé.
- **Confirm email** : activé (c'est la vérification de la première fois).
- Mot de passe : longueur minimale 8.

*Authentication → URL Configuration* :
- **Site URL** : l'adresse publique du site (par exemple `https://xaviereuphory.github.io/green-room-oka/`).
- **Redirect URLs** : ajouter `https://xaviereuphory.github.io/green-room-oka/**` et, pour les essais locaux, `http://localhost:4321/**`.
  Sans ça, le lien de confirmation et celui de « mot de passe oublié » ne ramènent pas au site.

*Authentication → Email Templates* : traduire en français les gabarits « Confirm signup » et « Reset password » (le lien `{{ .ConfirmationURL }}` doit rester).

## 4. Envoi des courriels (important avant de lancer)
Le service de courriel intégré de Supabase est **limité à quelques courriels par heure** et réservé aux essais. Pour de vrais clients, brancher un fournisseur SMTP (Resend, Postmark, Brevo, etc., plusieurs ont un palier gratuit) : *Authentication → SMTP Settings*. Idéalement avec un expéditeur au nom du commerce (SPF/DKIM configurés sur son domaine).

## 5. Comptes employés
1. *Authentication → Users → Add user* : courriel + mot de passe, cocher *Auto Confirm User*.
2. Les déclarer comme employés (SQL Editor) :
   ```sql
   insert into public.staff (user_id)
   select id from auth.users where email = 'employe@exemple.com';
   ```
3. Écran employé : `/commandes/` (ou `/en/staff/`). Un compte qui n'est pas dans la table `staff` est refusé, même s'il est valide.

## 6. Publier le site en mode réel
Le build lit `.env` :
```bash
ASTRO_SITE=https://xaviereuphory.github.io ASTRO_BASE=/green-room-oka PUBLIC_PREVIEW=true npm run build
```
puis publier `dist/` comme avant (branche `gh-pages`). Les deux valeurs `PUBLIC_*` se retrouvent dans le site : c'est voulu, la sécurité repose sur les règles de `schema.sql`.

## Vérifier (avec deux comptes de test)
- Sans connexion, aucun produit n'est visible.
- Une commande réserve le stock ; l'annuler le remet en vente.
- Un client ne voit que ses commandes ; seuls les comptes de `staff` changent un statut.
- L'écran employé affiche le nom, le courriel et « Première commande » ou « N commandes au total ».
- Ces règles ont été testées sur une base Postgres locale ; le reste (courriels, liens de confirmation) n'a pas pu l'être sans vrai projet.

## À prévoir avant la production
- Validation légale de la précommande, et du consentement aux courriels (Loi 25, LCAP).
- Politique de confidentialité publiée (courriel, nom, commandes).
- Moyen de supprimer les données d'un client sur demande (supprimer l'utilisateur dans *Authentication → Users* efface aussi sa fiche et ses commandes).
- Protection contre les inscriptions en masse : activer un CAPTCHA (*Authentication → Attack Protection*) demandera d'ajouter le widget au formulaire ; à faire si des abus apparaissent.
- Texto ou courriel « commande prête » : non inclus. Avec un fournisseur de courriel (Resend), une fonction Supabase déclenchée par un webhook peut l'envoyer plus tard.
- Sauvegardes : activer celles du projet Supabase.
