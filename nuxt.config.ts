export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  ui: {
    fonts: false,
    colorMode: false,
  },

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

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
