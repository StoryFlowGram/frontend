<template>
  <div class="h-screen overflow-hidden relative">
    <div v-if="isLoading" class="h-full flex items-center justify-center bg-white">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>

    <div
      v-else-if="!isAuthenticated"
      class="h-full flex flex-col items-center justify-center bg-white px-6"
    >
      <div class="text-center mb-12">
        <div class="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BookOpen class="w-12 h-12 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-black mb-3">StoryFluentGram</h1>
        <p class="text-gray-600 text-lg">Вивчайте мови під час читання</p>
      </div>

      <div class="w-full max-w-sm space-y-4">
        <button
          @click="loginWithTelegram"
          class="w-full py-4 bg-black text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
            />
          </svg>
          Продовжити з Telegram
        </button>

        <button
          @click="loginWithGoogle"
          class="w-full py-4 bg-gray-100 text-black font-semibold rounded-2xl border-2 border-gray-200 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Продовжити з Google
        </button>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-xs mt-4 max-w-sm text-center">
        {{ errorMessage }}
      </p>

      <p class="text-gray-500 text-sm mt-8 text-center max-w-sm">v.0.0.1InDev</p>
    </div>

    <div v-else class="h-full flex flex-col bg-white">
      <div class="flex-1 overflow-y-auto">
        <TrainingResultsView
          v-if="showTrainingResults"
          :total-words="trainingResults.total"
          :correct-answers="trainingResults.correct"
          @finish="finishTraining"
        />

        <TrainingView
          v-else-if="trainingMode"
          :mode="trainingMode"
          :cards="trainingCards"
          @close="trainingMode = null"
          @show-results="showResults"
        />

        <BookDetailView
          v-else-if="selectedBookForDetail"
          :book="selectedBookForDetail"
          @close="selectedBookForDetail = null"
          @add-to-library="addToLibrary"
          @open-reader="openReaderWithChapter"
        />

        <ReaderView
          v-else-if="selectedBook"
          :book="selectedBook"
          :initial-chapter="selectedChapter"
          :user-book-id="selectedUserBookId"
          :initial-position="selectedPosition"
          @close="closeReader"
        />

        <component
          v-else
          :is="currentViewComponent"
          @open-book-detail="openBookDetail"
          @start-training="startTraining"
          @logout="handleLogout"
        />
      </div>

      <BottomNav
        v-if="!selectedBook && !selectedBookForDetail && !trainingMode && !showTrainingResults"
        :current-view="currentView"
        @navigate="navigateToView"
      />
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform -translate-y-5 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-5 opacity-0"
    >
      <div
        v-if="notification.show"
        class="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border"
          :class="[
            notification.type === 'success'
              ? 'bg-white border-green-100 text-green-800'
              : 'bg-white border-red-100 text-red-800'
          ]"
        >
          <div v-if="notification.type === 'success'" class="bg-green-100 p-1 rounded-full">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div v-else class="bg-red-100 p-1 rounded-full">
            <XCircle class="w-5 h-5 text-red-600" />
          </div>
          <p class="font-medium text-sm">{{ notification.message }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { BookOpen, CheckCircle, XCircle } from 'lucide-vue-next'
import BottomNav from './components/layout/BottomNav.vue'
import LibraryView from './views/LibraryView.vue'
import ReaderView from './views/ReaderView.vue'
import DictionaryView from './views/DictionaryView.vue'
import ProfileView from './views/ProfileView.vue'
import TrainingView from './views/TrainingView.vue'
import TrainingResultsView from './views/TrainingResultsView.vue'
import BookDetailView from './views/BookDetailView.vue'
import api, { getErrorMessage, setAuthExpiredHandler } from '@/shared/api/client'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const tg = window.Telegram?.WebApp ?? null
const isAuthenticated = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const currentView = ref('library')

const selectedBook = ref(null)
const selectedChapter = ref(null)
const selectedUserBookId = ref(null)
const selectedPosition = ref(0)
const selectedBookForDetail = ref(null)
const userLibrary = ref([])

const trainingMode = ref(null)
const trainingCards = ref([])
const showTrainingResults = ref(false)
const trainingResults = ref({ total: 0, correct: 0 })

const notification = ref({
  show: false,
  message: '',
  type: 'success'
})
let notificationTimeout = null

const viewComponents = {
  library: LibraryView,
  dictionary: DictionaryView,
  profile: ProfileView
}

const currentViewComponent = computed(() => viewComponents[currentView.value] || LibraryView)

const showNotification = (message, type = 'success') => {
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notification.value = { show: true, message, type }
  notificationTimeout = setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const loadUserLibrary = async () => {
  try {
    const response = await api.get('/reader/', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0'
      }
    })

    userLibrary.value = response.data.items || []
    isAuthenticated.value = true
  } catch (error) {
    if (error?.response?.status === 401) {
      isAuthenticated.value = false
      userLibrary.value = []
      return
    }

    userLibrary.value = []
    showNotification(getErrorMessage(error, 'Не вдалося завантажити бібліотеку'), 'error')
  }
}

const loginWithTelegram = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const initDataString = tg?.initData
    if (!initDataString) {
      errorMessage.value = 'Будь ласка, відкрийте додаток через Telegram'
      return
    }

    const response = await api.post('/auth/telegram', { initData: initDataString })

    if (response.status === 200 || response.status === 201) {
      isAuthenticated.value = true
      if (tg?.expand) tg.expand()
      await loadUserLibrary()
    }
  } catch (error) {
    if (error?.response?.status === 403) {
      errorMessage.value = 'Не вдалося перевірити дані Telegram.'
    } else {
      errorMessage.value = getErrorMessage(error, 'Не вдалося увійти через Telegram.')
    }
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = () => {
  if (!GOOGLE_CLIENT_ID) {
    showNotification('Не задано змінну VITE_GOOGLE_CLIENT_ID.', 'error')
    return
  }

  if (!window.google?.accounts?.oauth2) {
    showNotification('Google OAuth недоступний. Перевірте підключення бібліотеки gsi/client.', 'error')
    return
  }

  const client = window.google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile openid',
    ux_mode: 'redirect',
    redirect_uri: window.location.origin
  })

  client.requestCode()
}

const handleGoogleCode = async (code) => {
  isLoading.value = true
  try {
    const response = await api.post(
      '/auth/google',
      {
        code,
        redirect_uri: window.location.origin
      },
      {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      }
    )

    if (response.status === 200) {
      isAuthenticated.value = true
      await loadUserLibrary()
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Не вдалося авторизуватися через Google.')
  } finally {
    isLoading.value = false
  }
}

const handleLinkGoogle = async (code) => {
  isLoading.value = true
  try {
    await api.post(
      '/auth/link/google',
      {
        code,
        redirect_uri: window.location.origin
      },
      {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      }
    )

    currentView.value = 'profile'
    showNotification("Google акаунт успішно прив'язано!", 'success')
  } catch (error) {
    showNotification(getErrorMessage(error, "Не вдалося прив'язати Google-акаунт."), 'error')
  } finally {
    isLoading.value = false
    localStorage.removeItem('is_linking_google')
  }
}

const resetSessionState = () => {
  isAuthenticated.value = false
  currentView.value = 'library'
  selectedBook.value = null
  selectedChapter.value = null
  selectedUserBookId.value = null
  selectedPosition.value = 0
  selectedBookForDetail.value = null
  userLibrary.value = []
  trainingMode.value = null
  trainingCards.value = []
  showTrainingResults.value = false
  trainingResults.value = { total: 0, correct: 0 }
  localStorage.removeItem('is_linking_google')
}

const handleLogout = async () => {
  isLoading.value = true

  try {
    await api.post('/auth/logout', {}, { skipAuthRefresh: true })
  } catch {

  } finally {
    resetSessionState()
    isLoading.value = false
  }
}

const addToLibrary = async (book) => {
  try {
    if (!userLibrary.value.some((libraryBook) => libraryBook.id === book.id)) {
      userLibrary.value.push(book)
    }

    await loadUserLibrary()
  } catch {
    showNotification('Не вдалося оновити бібліотеку', 'error')
  }
}

const openReaderWithChapter = (payload) => {
  selectedBook.value = payload.book
  selectedChapter.value = payload.chapter
  selectedUserBookId.value = payload.userBookId || null
  selectedPosition.value = payload.position || 0
  selectedBookForDetail.value = null
}

const closeReader = () => {
  selectedBook.value = null
  selectedChapter.value = null
  selectedUserBookId.value = null
  selectedPosition.value = 0
}

const navigateToView = (viewName) => {
  currentView.value = viewName
}

const openBookDetail = (book) => {
  selectedBookForDetail.value = book
}

const startTraining = (data) => {
  if (data && data.type && data.cards) {
    trainingMode.value = data.type
    trainingCards.value = data.cards
    return
  }

  trainingMode.value = typeof data === 'string' ? data : null
  trainingCards.value = []
}

const showResults = (results) => {
  trainingMode.value = null
  trainingCards.value = []
  trainingResults.value = results
  showTrainingResults.value = true
}

const finishTraining = () => {
  showTrainingResults.value = false
  currentView.value = 'dictionary'
}

onMounted(async () => {
  setAuthExpiredHandler(() => {
    resetSessionState()
    isLoading.value = false
  })

  if (tg?.ready) tg.ready()

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const isLinking = localStorage.getItem('is_linking_google') === 'true'

  if (code) {
    window.history.replaceState({}, document.title, window.location.pathname)

    if (isLinking) {
      await loadUserLibrary()
      if (isAuthenticated.value) {
        await handleLinkGoogle(code)
      }
    } else {
      await handleGoogleCode(code)
    }
  } else {
    await loadUserLibrary()
    localStorage.removeItem('is_linking_google')
  }

  isLoading.value = false
})

onUnmounted(() => {
  setAuthExpiredHandler(null)
  if (notificationTimeout) clearTimeout(notificationTimeout)
})
</script>
