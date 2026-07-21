import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/test-utils/module',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: 'TaskFlow',
      meta: [
        {
          name: 'description',
          content: 'A focused task management workspace built with Nuxt.',
        },
      ],
    },
  },
})
