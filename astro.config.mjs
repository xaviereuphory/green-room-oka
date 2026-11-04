import { defineConfig } from 'astro/config';

// Par défaut : le vrai domaine du client (site final).
// Pour un aperçu public, on définit ASTRO_SITE et ASTRO_BASE au moment de construire.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://thegreenroomoka.ca',
  base: process.env.ASTRO_BASE ?? '/',
});
