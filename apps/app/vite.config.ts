import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, 'src/components'),
      'redux-tk': path.resolve(__dirname, 'src/redux-tk'),
    }
  },
})
