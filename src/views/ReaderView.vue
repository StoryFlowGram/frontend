<template>
  <div class="min-h-screen" :class="themeClasses.bg">
    <div
      :class="[
        'sticky top-0 backdrop-blur-sm border-b z-10 transition-colors duration-300',
        themeClasses.topBar
      ]"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-opacity-10 hover:bg-black rounded-full transition-all duration-200"
        >
          <ArrowLeft :class="['w-6 h-6', themeClasses.icon]" />
        </button>
        <div class="flex-1 text-center">
          <p :class="['text-sm font-semibold', themeClasses.text]">{{ chapterTitle }}</p>
          <p :class="['text-xs', themeClasses.subtext]">{{ book?.title || 'Завантаження...' }}</p>
        </div>
        <button
          @click="showSettings = !showSettings"
          class="p-2 hover:bg-opacity-10 hover:bg-black rounded-full transition-all duration-200"
        >
          <Settings :class="['w-6 h-6', themeClasses.icon]" />
        </button>
      </div>

      <div :class="['h-1', themeClasses.progressBg]">
        <div
          class="h-full bg-teal-400 transition-all duration-300"
          :style="{ width: readingProgress + '%' }"
        ></div>
      </div>
    </div>

    <Transition name="settings-slide">
      <div
        v-if="showSettings"
        :class="[
          'fixed inset-x-0 top-16 border-b shadow-2xl z-20 p-6 space-y-6 transition-colors duration-300',
          themeClasses.settingsPanel
        ]"
      >
        <div>
          <label :class="['block text-sm font-medium mb-3', themeClasses.text]"
            >Розмір шрифту</label
          >
          <div class="flex items-center gap-4">
            <button
              @click="decreaseFontSize"
              :class="[
                'p-2.5 rounded-full transition-all duration-200 hover:scale-110',
                themeClasses.controlButton
              ]"
            >
              <Minus class="w-5 h-5" />
            </button>
            <div class="flex-1 relative">
              <div :class="['h-2 rounded-full overflow-hidden', themeClasses.sliderBg]">
                <div
                  class="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-200"
                  :style="{ width: ((readerSettings.fontSize - 14) / 6) * 100 + '%' }"
                ></div>
              </div>
              <div class="text-center mt-2 text-sm font-medium text-teal-600">
                {{ readerSettings.fontSize }}px
              </div>
            </div>
            <button
              @click="increaseFontSize"
              :class="[
                'p-2.5 rounded-full transition-all duration-200 hover:scale-110',
                themeClasses.controlButton
              ]"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label :class="['block text-sm font-medium mb-3', themeClasses.text]"
            >Міжрядковий інтервал</label
          >
          <div class="flex items-center gap-4">
            <button
              @click="decreaseLineHeight"
              :class="[
                'p-2.5 rounded-full transition-all duration-200 hover:scale-110',
                themeClasses.controlButton
              ]"
            >
              <Minus class="w-5 h-5" />
            </button>
            <div class="flex-1 relative">
              <div :class="['h-2 rounded-full overflow-hidden', themeClasses.sliderBg]">
                <div
                  class="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-200"
                  :style="{ width: ((readerSettings.lineHeight - 1.4) / 0.8) * 100 + '%' }"
                ></div>
              </div>
              <div class="text-center mt-2 text-sm font-medium text-teal-600">
                {{ readerSettings.lineHeight.toFixed(1) }}
              </div>
            </div>
            <button
              @click="increaseLineHeight"
              :class="[
                'p-2.5 rounded-full transition-all duration-200 hover:scale-110',
                themeClasses.controlButton
              ]"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label :class="['block text-sm font-medium mb-3', themeClasses.text]">Шрифт</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="fontOption in fontFamilies"
              :key="fontOption.id"
              @click="readerSettings.fontFamily = fontOption.id"
              :class="[
                'py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105',
                readerSettings.fontFamily === fontOption.id
                  ? 'bg-black text-white shadow-lg scale-105'
                  : themeClasses.fontButton
              ]"
              :style="{ fontFamily: fontOption.value }"
            >
              {{ fontOption.label }}
            </button>
          </div>
        </div>

        <div>
          <label :class="['block text-sm font-medium mb-3', themeClasses.text]">Тема</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="themeOption in themes"
              :key="themeOption.id"
              @click="readerSettings.theme = themeOption.id"
              :class="[
                'py-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105 relative overflow-hidden',
                readerSettings.theme === themeOption.id
                  ? 'ring-4 ring-teal-400 shadow-lg scale-105'
                  : 'hover:shadow-md'
              ]"
              :style="{
                backgroundColor: themeOption.preview.bg,
                color: themeOption.preview.text
              }"
            >
              <span class="relative z-10">{{ themeOption.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div
      ref="scrollContainer"
      class="overflow-y-auto"
      :style="{ height: 'calc(100vh - 60px)' }"
      @scroll="handleScroll"
    >
      <div v-if="isLoadingContent" class="h-full flex items-center justify-center">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"
          ></div>
          <p :class="['text-sm', themeClasses.subtext]">Завантаження тексту...</p>
        </div>
      </div>

      <div v-else-if="contentError" class="h-full flex items-center justify-center px-6">
        <div class="text-center">
          <p class="text-red-600 mb-4">{{ contentError }}</p>
          <button
            @click="loadContent"
            class="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>

      <div
        v-else
        class="px-6 py-8 pb-32"
        :class="[themeClasses.bg, themeClasses.text]"
        :style="{
          fontSize: readerSettings.fontSize + 'px',
          lineHeight: readerSettings.lineHeight,
          fontFamily: currentFontFamily
        }"
      >
        <div class="max-w-2xl mx-auto">
          <h2 :class="['text-2xl font-bold mb-6', themeClasses.heading]">
            {{ chapterTitle }}
          </h2>
          <div class="space-y-6">
            <p v-for="(paragraph, pIndex) in paragraphs" :key="pIndex" class="leading-relaxed">
              <span
                v-for="(word, wIndex) in paragraph.words"
                :key="`${pIndex}-${wIndex}`"
                @click="openWordDetail(word, paragraph.text)"
                :class="[
                  'cursor-pointer rounded px-1 transition-all duration-150 hover:scale-105 inline',
                  themeClasses.wordHover
                ]"
              >
                {{ word }}{{ ' ' }}
              </span>
            </p>
          </div>

          <div v-if="nextChapter" class="mt-12 flex justify-center">
            <button
              @click="handleNextChapter"
              :disabled="isUpdatingProgress"
              class="px-8 py-4 bg-teal-400 text-white font-semibold rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                v-if="isUpdatingProgress"
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              ></span>
              <span>{{ isUpdatingProgress ? 'Завантаження...' : 'Далі' }}</span>
              <ChevronRight v-if="!isUpdatingProgress" class="w-5 h-5" />
            </button>
          </div>

          <div v-else-if="!isLoadingContent && chapterContent" class="mt-12 text-center">
            <p :class="['text-lg font-semibold', themeClasses.text]">
              Ви дочитали останній розділ!
            </p>
            <button
              @click="emit('close')"
              class="mt-4 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              Повернутись до бібліотеки
            </button>
          </div>
        </div>
      </div>
    </div>

    <WordDetailSheet
      :is-open="isWordSheetOpen"
      :word="selectedWord"
      @close="isWordSheetOpen = false"
      @add-to-dictionary="handleAddToDictionary"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ArrowLeft, Settings, Minus, Plus, ChevronRight } from 'lucide-vue-next'
import WordDetailSheet from '../components/reader/WordDetailSheet.vue'
import api, { getErrorMessage } from '@/shared/api/client'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  initialChapter: {
    type: Object,
    default: null
  },
  userBookId: {
    type: [Number, String],
    default: null
  },
  initialPosition: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const isLoadingContent = ref(false)
const contentError = ref('')
const chapterContent = ref('')
const chapterTitle = ref('Завантаження...')
const currentChapter = ref(null)
const allChapters = ref([])
const nextChapter = ref(null)
const localUserBookId = ref(props.userBookId)
const isUpdatingProgress = ref(false)

const scrollContainer = ref(null)
const currentPosition = ref(0)
const readingProgress = ref(0)

const loadSettings = () => {
  const saved = localStorage.getItem('readerSettings')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore invalid persisted settings and fallback to defaults
    }
  }
  return {
    fontSize: 16,
    lineHeight: 1.8,
    fontFamily: 'system',
    theme: 'light'
  }
}

const readerSettings = ref(loadSettings())

watch(
  readerSettings,
  (newSettings) => {
    localStorage.setItem('readerSettings', JSON.stringify(newSettings))
  },
  { deep: true }
)

const showSettings = ref(false)

const fontFamilies = [
  {
    id: 'system',
    label: 'Система',
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  { id: 'serif', label: 'Класичний', value: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', label: 'Моно', value: '"Courier New", monospace' }
]

const themes = [
  { id: 'light', label: 'Світла', preview: { bg: '#ffffff', text: '#000000' } },
  { id: 'dark', label: 'Темна', preview: { bg: '#1a1a1a', text: '#e5e5e5' } },
  { id: 'sepia', label: 'Сепія', preview: { bg: '#f4ecd8', text: '#5c4a2c' } }
]

const paragraphs = computed(() => {
  if (!chapterContent.value) return []
  return chapterContent.value
    .split('\n')
    .filter((line) => line.trim())
    .map((paragraph) => ({
      text: paragraph.trim(),
      words: paragraph.trim().split(/\s+/)
    }))
})

const currentFontFamily = computed(() => {
  return (
    fontFamilies.find((f) => f.id === readerSettings.value.fontFamily)?.value ||
    fontFamilies[0].value
  )
})

const themeClasses = computed(() => {
  const theme = readerSettings.value.theme
  if (theme === 'dark') {
    return {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      icon: 'text-gray-100',
      heading: 'text-white',
      topBar: 'bg-gray-900/95 border-gray-800',
      progressBg: 'bg-gray-800',
      settingsPanel: 'bg-gray-900 border-gray-800',
      wordHover: 'hover:bg-teal-400/20 hover:text-teal-300',
      controlButton: 'bg-gray-800 hover:bg-gray-700 text-gray-100',
      sliderBg: 'bg-gray-800',
      fontButton: 'bg-gray-800 text-gray-100 hover:bg-gray-700',
      navArrow: 'bg-gray-800 hover:bg-gray-700 text-gray-100'
    }
  } else if (theme === 'sepia') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      subtext: 'text-amber-800',
      icon: 'text-amber-950',
      heading: 'text-amber-950',
      topBar: 'bg-amber-50/95 border-amber-200',
      progressBg: 'bg-amber-100',
      settingsPanel: 'bg-amber-50 border-amber-200',
      wordHover: 'hover:bg-teal-100 hover:text-teal-900',
      controlButton: 'bg-amber-100 hover:bg-amber-200 text-amber-950',
      sliderBg: 'bg-amber-100',
      fontButton: 'bg-amber-100 text-amber-950 hover:bg-amber-200',
      navArrow: 'bg-amber-100 hover:bg-amber-200 text-amber-950'
    }
  }
  return {
    bg: 'bg-white',
    text: 'text-gray-900',
    subtext: 'text-gray-500',
    icon: 'text-black',
    heading: 'text-black',
    topBar: 'bg-white/95 border-gray-100',
    progressBg: 'bg-gray-100',
    settingsPanel: 'bg-white border-gray-100',
    wordHover: 'hover:bg-teal-100 hover:text-black',
    controlButton: 'bg-gray-100 hover:bg-gray-200 text-black',
    sliderBg: 'bg-gray-100',
    fontButton: 'bg-gray-100 text-black hover:bg-gray-200',
    navArrow: 'bg-white hover:bg-gray-100 text-black border border-gray-200'
  }
})

const increaseFontSize = () => {
  if (readerSettings.value.fontSize < 20) readerSettings.value.fontSize += 1
}

const decreaseFontSize = () => {
  if (readerSettings.value.fontSize > 14) readerSettings.value.fontSize -= 1
}

const increaseLineHeight = () => {
  if (readerSettings.value.lineHeight < 2.2)
    readerSettings.value.lineHeight = Math.round((readerSettings.value.lineHeight + 0.1) * 10) / 10
}

const decreaseLineHeight = () => {
  if (readerSettings.value.lineHeight > 1.4)
    readerSettings.value.lineHeight = Math.round((readerSettings.value.lineHeight - 0.1) * 10) / 10
}

const handleScroll = () => {
  if (!scrollContainer.value) return

  const scrollTop = scrollContainer.value.scrollTop
  const scrollHeight = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight

  if (scrollHeight > 0) {
    currentPosition.value = scrollTop / scrollHeight
    readingProgress.value = Math.round(currentPosition.value * 100)
  }
}

const scrollToPosition = async (position) => {
  if (position <= 0 || !scrollContainer.value) return

  await nextTick()

  setTimeout(() => {
    if (scrollContainer.value) {
      const scrollHeight = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight
      const targetScroll = position * scrollHeight
      scrollContainer.value.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
  }, 100)
}



const isWordSheetOpen = ref(false)
const selectedWord = ref({
  text: '',
  isLoading: false,
  translation: '',
  transcription: '',
  additionalTranslations: [],
  contextSentence: '',
  sentenceTranslation: ''
})

const extractSentence = (word, paragraphText) => {
  if (!paragraphText) return ''

  const sentences = paragraphText.match(/[^.!?]+[.!?]+/g) || [paragraphText]

  const match = sentences.find((s) => s.includes(word))
  return match ? match.trim() : paragraphText
}

const openWordDetail = async (rawWord, paragraphText) => {
  const cleanWord = rawWord.replace(/[.,!?;:()""«»]/g, '').trim()
  if (!cleanWord) return

  const sentence = extractSentence(rawWord, paragraphText)

  selectedWord.value = {
    text: cleanWord,
    isLoading: true,
    transcription: '',
    translation: '',
    additionalTranslations: [],
    contextSentence: sentence,
    sentenceTranslation: ''
  }
  isWordSheetOpen.value = true

  try {
    const response = await api.post('/translation/translate/word', {
      text: cleanWord,
      src_lang: 'english',
      dest_lang: 'ukrainian'
    })

    const data = response.data

    selectedWord.value = {
      ...selectedWord.value,
      isLoading: false,
      text: data.word || cleanWord,
      transcription: data.pronunciation,
      translation: data.translation,
      additionalTranslations: data.additional_translations || []
    }

    if (sentence) {
      fetchSentenceTranslation(sentence)
    } else {
      selectedWord.value.sentenceTranslation = 'Не знайдено речення'
    }
  } catch {
    selectedWord.value = {
      ...selectedWord.value,
      isLoading: false,
      translation: 'Не вдалося перекласти'
    }
  }
}

const fetchSentenceTranslation = async (text) => {
  try {
    const response = await api.post('/translation/sentence', {
      text: text,
      src_lang: 'english',
      dest_lang: 'ukrainian'
    })

    selectedWord.value.sentenceTranslation = response.data.translation
  } catch {
    selectedWord.value.sentenceTranslation = 'Не вдалося перекласти речення'
  }
}

const handleAddToDictionary = () => {
}

const loadAllChapters = async () => {
  try {
    const response = await api.get(`/book/${props.book.id}/chapters`)
    allChapters.value = response.data.sort((a, b) => a.order_number - b.order_number)

    if (currentChapter.value) {
      const currentIndex = allChapters.value.findIndex((ch) => ch.id === currentChapter.value.id)
      if (currentIndex !== -1 && currentIndex < allChapters.value.length - 1) {
        nextChapter.value = allChapters.value[currentIndex + 1]
      } else {
        nextChapter.value = null
      }
    }
  } catch (error) {
    void error
  }
}

const loadContent = async () => {
  if (!props.initialChapter?.id) {
    contentError.value = 'Розділ не вказано'
    return
  }

  isLoadingContent.value = true
  contentError.value = ''
  currentChapter.value = props.initialChapter

  try {
    const response = await api.get(`/book/chapter/${props.initialChapter.id}/content`)

    chapterContent.value = response.data.content || ''
    chapterTitle.value = props.initialChapter.title || 'Розділ'

    await loadAllChapters()

    if (props.initialPosition > 0) {
      scrollToPosition(props.initialPosition)
    }
  } catch {
    contentError.value = "Не вдалося завантажити текст розділу. Перевірте з'єднання."
  } finally {
    isLoadingContent.value = false
  }
}

const handleNextChapter = async () => {
  if (!nextChapter.value) {
    return
  }

  isUpdatingProgress.value = true

  try {
    if (localUserBookId.value) {
      await api.put('/reader/update', {
        user_book_id: localUserBookId.value,
        chapter_id: nextChapter.value.id,
        position: 0.0
      })
    }

    currentChapter.value = nextChapter.value
    const response = await api.get(`/book/chapter/${nextChapter.value.id}/content`)

    chapterContent.value = response.data.content || ''
    chapterTitle.value = nextChapter.value.title || 'Розділ'

    await loadAllChapters()

    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }

    currentPosition.value = 0
    readingProgress.value = 0
  } catch (error) {
    contentError.value = getErrorMessage(error, 'Не вдалося завантажити наступний розділ.')
  } finally {
    isUpdatingProgress.value = false
  }
}

const getUserBookId = async () => {
  if (localUserBookId.value) return

  try {
    const response = await api.get('/reader/')
    const userBooks = response.data.items || response.data || []
    const userBook = userBooks.find((b) => b.book_id === props.book.id)
    if (userBook) {
      localUserBookId.value = userBook.id || userBook.user_book_id
    }
  } catch (error) {
    void error
  }
}

onMounted(() => {
  loadContent()
  getUserBookId()
})
</script>

<style scoped>
.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: all 0.3s ease;
}

.settings-slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.settings-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
