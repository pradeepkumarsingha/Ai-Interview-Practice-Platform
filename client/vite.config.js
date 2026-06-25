import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      events: fileURLToPath(new URL('./src/polyfills/events.js', import.meta.url)),
      util: fileURLToPath(new URL('./src/polyfills/util.js', import.meta.url)),
    },
  },
  // Polyfill Node.js 'global' for browser-incompatible packages (simple-peer, randombytes)
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy editor into its own chunk – loaded only on /interview-room
          'monaco-editor': ['@monaco-editor/react'],
          // Separate WebRTC peer into its own chunk
          'webrtc': ['simple-peer'],
          // Group all socket.io client code
          'socketio': ['socket.io-client'],
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI / charting libs
          'ui-vendor': ['framer-motion', 'recharts', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
