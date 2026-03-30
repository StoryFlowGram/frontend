import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

if (import.meta.env.VITE_ENABLE_ERUDA === 'true') {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/eruda'
  script.onload = () => {
    if (window.eruda) {
      window.eruda.init()
    }
  }
  document.body.appendChild(script)
}

createApp(App).mount('#app')
