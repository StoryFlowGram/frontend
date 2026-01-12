<template>
  <div class="min-h-screen bg-white pb-20">
    <div class="bg-white">
      <div class="px-6 py-6">
        <h1 class="text-3xl font-bold text-black">Бібліотека</h1>
        <p class="text-sm text-gray-600 mt-1">Продовжуйте свою подорож навчанням</p>
      </div>
    </div>

    <div class="px-6 py-6 space-y-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук книг"
          class="w-full px-6 py-4 pl-14 bg-gray-50 focus:bg-white border-2 border-gray-100 focus:border-teal-400 rounded-3xl transition-all outline-none text-black placeholder-gray-500"
        />
        <Search class="w-5 h-5 text-gray-600 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <section v-if="userLibraryBooks.length > 0">
        <h2 class="text-xl font-bold text-black mb-4">Мої книги</h2>
        <div class="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
          <div
            v-for="book in userLibraryBooks"
            :key="book.id"
            class="flex-shrink-0 w-48 snap-start" 
            @click="openBookDetail(book)"
          >
            <div class="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer h-full flex flex-col">
              <div class="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="book.pic_url" 
                  :src="book.pic_url" 
                  alt="Cover" 
                  class="w-full h-full object-cover"
                  @error="handleImageError" 
                />
                <BookOpen v-else class="w-16 h-16 text-white opacity-30" />
              </div>
              <div class="p-4 flex flex-col flex-1">
                <div>
                  <h3 class="font-semibold text-white line-clamp-2">{{ book.title }}</h3>
                  <p class="text-sm text-gray-300 mt-1">{{ book.author }}</p>
                </div>
                <div class="mt-auto pt-3">
                  <div class="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Прогрес</span>
                    <span>{{ book.overall_progress || 0 }}%</span>
                  </div>
                  <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-teal-400 rounded-full transition-all duration-300"
                      :style="{ width: (book.overall_progress || 0) + '%' }"
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
        </div>

        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="bg-gray-50 rounded-2xl hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer relative"
            @click="openBookDetail(book)"
          >

            <div 
              v-if="book.isAdded" 
              class="absolute top-2 right-2 z-10 bg-teal-400 text-white text-xs px-2 py-1 rounded-full font-medium"
            >
              В бібліотеці
            </div>

            <div class="aspect-[3/4] bg-gray-200 flex items-center justify-center overflow-hidden relative">
              <img 
                v-if="book.pic_url" 
                :src="book.pic_url" 
                alt="Cover" 
                class="w-full h-full object-cover"
                @error="handleImageError" 
              />
              <BookOpen v-else class="w-12 h-12 text-gray-400" />
            </div>

            <div class="p-3">
              <h3 class="font-semibold text-black text-sm line-clamp-2">{{ book.title }}</h3>
              <p class="text-xs text-gray-600 mt-1">{{ book.author }}</p>
              
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-1">
                  <Star class="w-4 h-4 text-teal-400 fill-teal-400" />
                  <span class="text-xs font-medium text-gray-700">4.5</span>
                </div>
                

                <button
                  @click.stop="toggleLibrary(book)"
                  :disabled="book.isProcessing"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded-full transition-all duration-200',
                    book.isAdded 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-teal-100 text-teal-700 hover:bg-teal-200',
                    book.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  <span v-if="book.isProcessing">...</span>
                  <span v-else>{{ book.isAdded ? 'Видалити' : 'Додати' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!isLoading && filteredBooks.length === 0" class="text-center py-8 text-gray-500">
          Книг не знайдено
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { BookOpen, Star, Search } from 'lucide-vue-next'

const emit = defineEmits(['open-book-detail'])

const API_URL = import.meta.env.VITE_API_URL

const searchQuery = ref('')
const isLoading = ref(false)
const allBooks = ref([])
const userLibrary = ref([])

const fetchData = async () => {
  try {
    isLoading.value = true
    
    const [booksResponse, libraryResponse] = await Promise.all([
      axios.get(`${API_URL}/books/`, { withCredentials: true }),
      axios.get(`${API_URL}/reader/`, { withCredentials: true })
    ])
    
    const books = booksResponse.data.items || booksResponse.data || []
    userLibrary.value = libraryResponse.data.items || libraryResponse.data || []
    
    allBooks.value = books.map(book => {
      const userBook = userLibrary.value.find(ub => ub.book_id === book.id)
      return {
        ...book,
        isAdded: !!userBook,
        userBookId: userBook?.id || userBook?.user_book_id || null,
        overall_progress: userBook?.overall_progress || 0,
        isProcessing: false
      }
    })
    
  } catch (error) {
    console.error('Помилка завантаження даних:', error)
  } finally {
    isLoading.value = false
  }
}

const userLibraryBooks = computed(() => {
  return allBooks.value.filter(book => book.isAdded)
})

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) {
    return allBooks.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return allBooks.value.filter(book => 
    book.title?.toLowerCase().includes(query) || 
    book.author?.toLowerCase().includes(query)
  )
})

const toggleLibrary = async (book) => {
  book.isProcessing = true
  
  try {
    if (book.isAdded) {
      await axios.delete(`${API_URL}/reader/${book.id}`, {
        withCredentials: true
      })
      
      book.isAdded = false
      book.userBookId = null
      book.overall_progress = 0
    } else {
      const response = await axios.post(`${API_URL}/reader/`, {
        book_id: book.id,
        overall_progress: 0
      }, {
        withCredentials: true
      })
      
      book.isAdded = true
      book.userBookId = response.data.id || response.data.user_book_id
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      book.isAdded = true
    } else {
      console.error('Помилка оновлення бібліотеки:', error)
    }
  } finally {
    book.isProcessing = false
  }
}

const openBookDetail = (book) => {
  emit('open-book-detail', book)
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  fetchData()
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
</style>
