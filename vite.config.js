import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // Keep game assets as files
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics']
        }
      }
    }
  }
});
