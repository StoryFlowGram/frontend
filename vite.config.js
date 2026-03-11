import { defineConfig, loadEnv } from 'vite' 
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      allowedHosts: [
        '.ngrok-free.app',
        'localhost',
        '127.0.0.1'
      ],
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_HOST,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})