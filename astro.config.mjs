import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailcss()],
  },

  adapter: vercel(),
});