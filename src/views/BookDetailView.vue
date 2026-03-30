<template>
  <div class="min-h-screen bg-white pb-8">

    <div class="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4">
      <div class="flex items-center justify-between">
        <button 
          @click="$emit('close')"
          class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-black" />
        </button>
        <h1 class="text-lg font-semibold text-black">Деталі книги</h1>
        <div class="w-10"></div>
      </div>
    </div>


    <div class="px-6 py-8">
      <div class="flex gap-6 mb-8">

        <div class="flex-shrink-0">
          <div class="w-32 h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
            <img 
              v-if="book.pic_url" 
              :src="book.pic_url" 
              alt="Обкладинка книги" 
              class="w-full h-full object-cover"
              @error="(e) => e.target.style.display = 'none'"
            />
            <BookOpen v-else class="w-12 h-12 text-white opacity-30" />
          </div>
        </div>


        <div class="flex-1 flex flex-col justify-center">
          <h2 class="text-2xl font-bold text-black mb-2">{{ book.title }}</h2>
          <p class="text-gray-600 mb-3">{{ book.author }}</p>
          

          <div class="flex items-center gap-2 mb-4">
            <div class="flex items-center gap-1">
              <Star class="w-5 h-5 text-teal-400 fill-teal-400" />
              <Star class="w-5 h-5 text-teal-400 fill-teal-400" />
              <Star class="w-5 h-5 text-teal-400 fill-teal-400" />
              <Star class="w-5 h-5 text-teal-400 fill-teal-400" />
              <Star class="w-5 h-5 text-gray-300" />
            </div>
            <span class="text-sm text-gray-600">4.5</span>
          </div>
        </div>
      </div>


      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-gray-50 rounded-2xl p-4 text-center">
          <div class="text-2xl font-bold text-black mb-1">{{ book.level || 'B1' }}</div>
          <div class="text-xs text-gray-600">Рівень</div>
        </div>
        <div class="bg-gray-50 rounded-2xl p-4 text-center">
          <div class="text-2xl font-bold text-black mb-1">{{ formatWordCount(book.word_count) }}</div>
          <div class="text-xs text-gray-600">Слів</div>
        </div>
        <div class="bg-gray-50 rounded-2xl p-4 text-center">
          <div class="text-2xl font-bold text-black mb-1">~{{ estimateReadingTime(book.word_count) }}</div>
          <div class="text-xs text-gray-600">Годин</div>
        </div>
      </div>


      <div class="mb-8">
        <h3 class="text-lg font-bold text-black mb-3">Опис</h3>
        <p class="text-gray-700 leading-relaxed">
          {{ book.description || 'Опис книги наразі недоступний. Почніть читати, щоб дізнатися більше про цю захоплюючу історію!' }}
        </p>
      </div>


      <div class="mb-8">
        <h3 class="text-lg font-bold text-black mb-3">Розділи</h3>
        

        <div v-if="isLoadingChapters" class="space-y-3">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl p-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>


        <div v-else-if="chaptersError" class="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p class="text-red-600 text-sm">{{ chaptersError }}</p>
        </div>


        <div v-else-if="chapters.length > 0" class="space-y-3">

          <component
            v-for="chapter in chapters"
            :key="chapter.id"
            :is="localIsAdded ? 'button' : 'div'"
            :class="[
              'w-full rounded-2xl p-4 text-left transition-all duration-200',
              localIsAdded 
                ? 'bg-gray-50 hover:bg-gray-100 hover:shadow-md cursor-pointer' 
                : 'bg-gray-100 cursor-default'
            ]"
            @click="localIsAdded ? openChapter(chapter) : null"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 :class="[
                  'font-semibold mb-1 transition-colors',
                  localIsAdded ? 'text-black' : 'text-gray-600'
                ]">
                  {{ chapter.title }}
                </h4>
                <p :class="['text-sm', localIsAdded ? 'text-gray-600' : 'text-gray-500']">
                  {{ formatWordCount(chapter.word_count) }} слів
                </p>
              </div>
              <div :class="[
                'w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                localIsAdded ? 'bg-black' : 'bg-gray-300'
              ]">
                <BookOpen :class="['w-4 h-4', localIsAdded ? 'text-white' : 'text-gray-500']" />
              </div>
            </div>
          </component>
        </div>


        <div v-else class="bg-gray-50 rounded-2xl p-6 text-center">
          <p class="text-gray-600">Розділи не знайдено</p>
        </div>
      </div>


      <div class="space-y-3 mb-24">
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <span class="text-gray-600">Жанр</span>
          <span class="font-medium text-black">{{ book.genre || 'Художня література' }}</span>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <span class="text-gray-600">Мова</span>
          <span class="font-medium text-black">{{ book.language || 'Англійська' }}</span>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <span class="text-gray-600">Рік видання</span>
          <span class="font-medium text-black">{{ book.year || '2023' }}</span>
        </div>
      </div>
    </div>


    <div v-if="!isLoadingChapters" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">

      <button
        v-if="!localIsAdded"
        @click="handleAddToLibrary"
        :disabled="isAddingToLibrary"
        class="w-full py-4 bg-black text-white font-semibold rounded-3xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus v-if="!isAddingToLibrary" class="w-5 h-5" />
        <span v-if="isAddingToLibrary" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
        {{ isAddingToLibrary ? 'Додавання...' : 'Додати в бібліотеку' }}
      </button>

  
      <button
        v-else
        @click="handleReadBook"
        class="w-full py-4 bg-teal-400 text-white font-semibold rounded-3xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <BookOpen class="w-5 h-5" />
        Читати
      </button>
    </div>

    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-teal-400 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2"
      >
        <Check class="w-5 h-5" />
        <span class="font-semibold">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, BookOpen, Star, Plus, Check } from 'lucide-vue-next'
import api, { getErrorMessage } from '@/shared/api/client'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'add-to-library', 'open-reader'])

const chapters = ref([])
const isLoadingChapters = ref(false)
const chaptersError = ref('')
const isAddingToLibrary = ref(false)
const showToast = ref(false)
const toastMessage = ref('Книга успішно додана!')

const localIsAdded = ref(props.book.isAdded || false)
const localUserBookId = ref(props.book.userBookId || null)

const showTimedToast = (message) => {
  toastMessage.value = message
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const formatWordCount = (count) => {
  if (!count) return '5.2k'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

const estimateReadingTime = (wordCount) => {
  if (!wordCount) return '3'
  const wordsPerHour = 10000
  return Math.ceil(wordCount / wordsPerHour).toString()
}

const loadChapters = async () => {
  isLoadingChapters.value = true
  chaptersError.value = ''

  try {
    const response = await api.get(`/book/${props.book.id}/chapters`)
    chapters.value = response.data.sort((a, b) => a.order_number - b.order_number)
  } catch (error) {
    chaptersError.value = getErrorMessage(error, 'Не вдалося завантажити розділи. Спробуйте пізніше.')
  } finally {
    isLoadingChapters.value = false
  }
}

const handleAddToLibrary = async () => {
  isAddingToLibrary.value = true

  try {
    const response = await api.post('/reader/', {
      book_id: props.book.id,
      overall_progress: 0
    })

    localUserBookId.value = response.data.id || response.data.user_book_id
    localIsAdded.value = true
    showTimedToast('Книга успішно додана!')

    emit('add-to-library', {
      ...props.book,
      isAdded: true,
      userBookId: localUserBookId.value
    })
  } catch (error) {
    if (error?.response?.status === 409) {
      localIsAdded.value = true
      showTimedToast('Книга вже є в бібліотеці.')
      emit('add-to-library', { ...props.book, isAdded: true })
    } else {
      showTimedToast(getErrorMessage(error, 'Не вдалося додати книгу. Спробуйте ще раз.'))
    }
  } finally {
    isAddingToLibrary.value = false
  }
}

const handleReadBook = () => {
  if (chapters.value.length > 0) {
    openChapter(chapters.value[0])
  }
}

const openChapter = (chapter) => {
  emit('open-reader', {
    book: props.book,
    chapter,
    userBookId: localUserBookId.value
  })
}

onMounted(async () => {
  await loadChapters()

  if (props.book.isAdded) return

  try {
    const response = await api.get('/reader/')
    const userBooks = response.data.items || response.data || []
    const foundBook = userBooks.find((book) => book.book_id === props.book.id)

    if (foundBook) {
      localIsAdded.value = true
      localUserBookId.value = foundBook.id || foundBook.user_book_id
    }
  } catch (error) {
    void error
  }
})
</script>
<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}
</style>


