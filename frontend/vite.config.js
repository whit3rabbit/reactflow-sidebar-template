import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import envCompatible from 'vite-plugin-env-compatible'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    envCompatible()
  ],
  define: {
    __VITE_ENV_TIME__: Date.now(),
    'process.env': {}
  }
})