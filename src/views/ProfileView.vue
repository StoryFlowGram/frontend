<template>
  <div class="min-h-screen bg-white pb-20">
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>

    <div v-else>
      <div class="bg-gray-900 text-white">
        <div class="px-6 pt-12 pb-8">
          <div class="flex flex-col items-center">
            <div class="relative">
              <div class="w-20 h-20 bg-gray-700 rounded-3xl flex items-center justify-center overflow-hidden">
                <img 
                  v-if="userData?.avatar_url" 
                  :src="userData.avatar_url" 
                  class="w-full h-full object-cover" 
                  alt="Avatar"
                />
                <User v-else class="w-10 h-10 text-white" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-400 border-2 border-gray-900 rounded-full"></div>
            </div>
            
            <div class="text-center mt-4">
              <h1 class="text-2xl font-bold">{{ displayName }}</h1>
              <p v-if="userData?.username" class="text-gray-400 text-sm mt-1">@{{ userData.username }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-6 space-y-6">
        <section>
          <h2 class="text-xl font-bold text-black mb-4">Налаштування</h2>
          <div class="space-y-3">
            
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
              <div class="p-2 bg-black rounded-xl">
                <Bell class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-black">Сповіщення</p>
              </div>
              <button
                @click="toggleNotifications"
                class="relative w-12 h-6 rounded-full transition-colors"
                :class="notificationsEnabled ? 'bg-teal-400' : 'bg-gray-300'"
              >
                <div
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  :class="{ 'translate-x-6': notificationsEnabled }"
                ></div>
              </button>
            </div>

            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl">
              <div class="p-2 bg-black rounded-xl">
                <Mail class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-black">Google акаунт</p>
                <p class="text-sm text-gray-600 mt-0.5 truncate max-w-[150px]">
                  {{ userData?.email || 'Не прив\'язано' }}
                </p>
              </div>
              
              <button
                v-if="!userData?.email"
                @click="connectGoogle"
                class="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Прив'язати
              </button>
              <div v-else class="text-green-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>

          </div>
        </section>

        <button
          @click="handleLogout"
          class="w-full py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-3xl transition-colors"
        >
          Вийти з акаунту
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { User, Bell, Mail } from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const emit = defineEmits(['logout'])


const userData = ref(null)
const isLoading = ref(true)
const notificationsEnabled = ref(true)

const displayName = computed(() => {
  if (!userData.value) return 'Завантаження...'
  const { first_name, last_name, username } = userData.value
  if (first_name && last_name) return `${first_name} ${last_name}`
  if (first_name) return first_name
  return username || 'Користувач'
})

const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`${API_URL}/users/me`, {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
    userData.value = response.data
  } catch (error) {
    console.error('Profile fetch error:', error)
    if (error.response && error.response.status === 401) {
      handleLogout()
    }
  } finally {
    isLoading.value = false
  }
}

const connectGoogle = () => {
  localStorage.setItem('is_linking_google', 'true')

  const client = google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile openid',
    ux_mode: 'redirect',
    redirect_uri: window.location.origin, 
  })
  
  client.requestCode()
}

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
}

const handleLogout = () => {
  emit('logout')
}

onMounted(() => {
  fetchUserProfile()
})
</script>