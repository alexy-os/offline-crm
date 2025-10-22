import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  // loadEnv is imported but not used in this configuration, which is acceptable.
  // The 'mode' parameter is also not directly used in the returned config object, which is fine.

  return {
    plugins: [react()],
    resolve: {
      preserveSymlinks: true,
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui8kit/core': path.resolve(__dirname, '../../packages/@ui8kit/core/src')
      }
    },
    server: { port: 5000 }
  }
})
