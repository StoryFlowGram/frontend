import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const backendHost = env.VITE_BACKEND_HOST?.trim()
  const cloudDomain = env.VITE_DOMAIN?.trim()
  const devPort = Number(env.VITE_DEV_PORT) 
  const previewPort = Number(env.VITE_PREVIEW_PORT) 

  const allowedHosts = ['localhost', '127.0.0.1', '.ngrok-free.app']
  if (cloudDomain) allowedHosts.push(cloudDomain)

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: true,
      port: devPort,
      strictPort: false,
      allowedHosts,
      proxy: backendHost
        ? {
            '/api': {
              target: backendHost,
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
    },
    preview: {
      host: true,
      port: previewPort,
      allowedHosts
    }
  }
})
