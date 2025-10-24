import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      preserveSymlinks: true,
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui8kit/core': path.resolve(__dirname, '../../packages/@ui8kit/core/src'),
        '@ui8kit/form': path.resolve(__dirname, '../../packages/@ui8kit/form/src'),
        '@buildy/builder-core': path.resolve(__dirname, '../../packages/@buildy/builder-core/src'),
        '@buildy/table-maker': path.resolve(__dirname, '../../packages/@buildy/table-maker/src')
      }
    },
    server: { port: 5001 }
  }
})


