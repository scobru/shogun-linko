import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// Custom plugin to handle missing stream-browserify/web
const resolveMissingImports = () => ({
  name: 'resolve-missing-imports',
  resolveId(id: string) {
    // Handle stream-browserify/web which doesn't exist
    if (id === 'stream-browserify/web' || id.endsWith('stream-browserify/web')) {
      return { id, external: true }
    }
    return null
  },
  load(id: string) {
    if (id === 'stream-browserify/web') {
      // Return a stub that exports nothing
      return 'export default {}; export const Readable = class {}; export const Writable = class {};'
    }
    return null
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Exclude modules we're providing custom stubs for
      exclude: ['net', 'fs'],
      // Override specific polyfills
      overrides: {
        net: path.resolve(__dirname, 'src/polyfills/net-stub.js'),
        fs: path.resolve(__dirname, 'src/polyfills/fs-stub.js'),
      },
    }),
    resolveMissingImports(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'stream-browserify/web': path.resolve(__dirname, 'src/polyfills/stream-web-stub.js'),
      'node:net': path.resolve(__dirname, 'src/polyfills/net-stub.js'),
      'net': path.resolve(__dirname, 'src/polyfills/net-stub.js'),
      'node:fs': path.resolve(__dirname, 'src/polyfills/fs-stub.js'),
      'fs': path.resolve(__dirname, 'src/polyfills/fs-stub.js'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'EVAL' || warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        warn(warning);
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['gun-relays', 'buffer', 'process'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})

