import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'util', 'buffer', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub node-fetch since we use native fetch in browser
      'node-fetch': path.resolve(__dirname, './src/polyfills/node-fetch-stub.ts'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['shogun-relays'],
    exclude: ['shogun-onion'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})

