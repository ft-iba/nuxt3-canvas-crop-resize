// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  app: {
    baseURL: '/nuxt3-canvas-crop-resize/',
    buildAssetsDir: '/nuxt/',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
          `
        }
      }
    }
  }
})
