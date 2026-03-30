<template>
  <div class="min-h-screen bg-white pb-24">
    <div class="bg-white sticky top-0 z-10 px-6 py-4 border-b border-gray-100">
      <h1 class="text-3xl font-bold text-black">Бібліотека</h1>
      <p class="text-sm text-gray-600 mt-1">Продовжуйте свою подорож навчанням</p>
    </div>

    <div class="px-6 py-6 space-y-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук книг"
          class="w-full px-6 py-4 pl-14 bg-gray-50 focus:bg-white border-2 border-gray-100 focus:border-teal-400 rounded-3xl transition-all outline-none text-black placeholder-gray-500"
        />
        <Search
          class="w-5 h-5 text-gray-600 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      <section v-if="continueReadingBooks.length > 0">
        <h2 class="text-xl font-bold text-black mb-4">Продовжити читання</h2>
        <div
          class="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
        >
          <div
            v-for="book in continueReadingBooks"
            :key="book.id"
            class="flex-shrink-0 w-48 snap-start"
            @click="openReader(book)"
          >
            <div
              class="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer h-full flex flex-col relative"
            >
              <div
                class="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="book.pic_url"
                  :src="book.pic_url"
                  alt="Обкладинка книги"
                  class="w-full h-full object-cover opacity-80"
                  @error="handleImageError"
                />
                <BookOpen v-else class="w-16 h-16 text-white opacity-30" />
              </div>

              <div class="p-4 flex flex-col flex-1">
                <div>
                  <h3 class="font-semibold text-white line-clamp-2 leading-tight">
                    {{ book.title }}
                  </h3>
                  <p class="text-xs text-gray-400 mt-1">{{ book.author }}</p>
                </div>

                <div class="mt-auto pt-4">
                  <div class="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Прогрес</span>
                    <span>{{ Math.round(book.progress) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-teal-400 rounded-full transition-all duration-300"
                      :style="{ width: book.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-black">Усі книги</h2>
          <span class="text-sm text-gray-400">{{ filteredBooks.length }} книг</span>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col relative group"
            @click="openBookDetail(book)"
          >
            <div class="aspect-[2/3] bg-gray-200 relative">
              <img
                v-if="book.pic_url"
                :src="book.pic_url"
                alt="Обкладинка книги"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                <Book class="w-10 h-10 text-gray-400" />
              </div>

              <div
                v-if="book.isAdded"
                class="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg z-10"
              >
                <Check class="w-3 h-3" />
              </div>
            </div>

            <div class="p-3 flex flex-col flex-1">
              <h3 class="font-bold text-black text-sm line-clamp-2 leading-snug mb-1">
                {{ book.title }}
              </h3>
              <p class="text-xs text-gray-500 mb-2 line-clamp-1">{{ book.author }}</p>

              <div class="mt-auto pt-2 flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span class="text-xs font-semibold text-gray-700">{{ book.level || '4.5' }}</span>
                </div>

                <button
                  v-if="!book.isAdded"
                  @click.stop="addToLibrary(book)"
                  class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md active:scale-90"
                >
                  <Plus v-if="!book.isProcessing" class="w-4 h-4" />
                  <span
                    v-else
                    class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"
                  ></span>
                </button>

                <button
                  v-else
                  @click.stop="removeFromLibrary(book)"
                  class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors active:scale-90"
                >
                  <Trash2 v-if="!book.isProcessing" class="w-4 h-4" />
                  <span
                    v-else
                    class="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!isLoading && filteredBooks.length === 0"
          class="flex flex-col items-center justify-center py-12 text-gray-500"
        >
          <BookOpen class="w-12 h-12 mb-3 opacity-20" />
          <p>Книг не знайдено</p>
        </div>
      </section>
    </div>

    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="[
          'fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 text-white text-sm font-medium',
          toast.type === 'error' ? 'bg-red-500' : 'bg-black'
        ]"
      >
        <span v-if="toast.type === 'success'">✓</span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpen, Book, Search, Star, Plus, Check, Trash2 } from 'lucide-vue-next'
import api, { getErrorMessage } from '@/shared/api/client'

const emit = defineEmits(['open-book-detail'])

const searchQuery = ref('')
const isLoading = ref(true)
const booksData = ref([])

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const fetchAllData = async () => {
  try {
    isLoading.value = true

    const [booksResponse, readerResponse] = await Promise.all([
      api.get('/book/list'),
      api.get('/reader/')
    ])

    const allBooks = booksResponse.data.items || booksResponse.data || []
    const userLibrary = readerResponse.data.items || readerResponse.data || []

    booksData.value = allBooks.map((book) => {
      const libraryEntry = userLibrary.find((libraryBook) => libraryBook.book_id === book.id)

      let progressPercent = 0
      if (libraryEntry?.overall_progress) {
        progressPercent = libraryEntry.overall_progress * 100
        if (progressPercent > 100) progressPercent = 100
      }

      return {
        ...book,
        isAdded: Boolean(libraryEntry),
        userBookId: libraryEntry ? libraryEntry.id || libraryEntry.user_book_id : null,
        progress: progressPercent,
        isProcessing: false
      }
    })
  } catch (error) {
    showToast(getErrorMessage(error, 'Не вдалося завантажити дані бібліотеки.'), 'error')
  } finally {
    isLoading.value = false
  }
}

const filteredBooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return booksData.value

  return booksData.value.filter((book) => {
    const title = book.title?.toLowerCase() || ''
    const author = book.author?.toLowerCase() || ''
    return title.includes(query) || author.includes(query)
  })
})

const continueReadingBooks = computed(() => booksData.value.filter((book) => book.isAdded))

const addToLibrary = async (book) => {
  book.isProcessing = true
  try {
    const response = await api.post('/reader/', {
      book_id: book.id,
      overall_progress: 0
    })

    book.isAdded = true
    book.userBookId = response.data.id || response.data.user_book_id
    book.progress = 0
    showToast('Книгу додано до бібліотеки')
  } catch (error) {
    if (error?.response?.status === 409) {
      book.isAdded = true
      showToast('Книгу додано (була в архіві)')
      await fetchAllData()
    } else {
      showToast(getErrorMessage(error, 'Не вдалося додати книгу'), 'error')
    }
  } finally {
    book.isProcessing = false
  }
}

const removeFromLibrary = async (book) => {
  if (!window.confirm('Видалити книгу з бібліотеки? Прогрес буде втрачено.')) return

  book.isProcessing = true
  try {
    const userBookId = book.userBookId || book.id
    await api.delete(`/reader/${userBookId}`)

    book.isAdded = false
    book.userBookId = null
    book.progress = 0
    showToast('Книгу видалено')
  } catch (error) {
    showToast(getErrorMessage(error, 'Не вдалося видалити книгу.'), 'error')
  } finally {
    book.isProcessing = false
  }
}

const openBookDetail = (book) => {
  emit('open-book-detail', book)
}

const openReader = (book) => {
  openBookDetail(book)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  fetchAllData()
})
</script>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style>
