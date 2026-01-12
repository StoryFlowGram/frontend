<template>
  <div class="min-h-screen bg-white">
    <div class="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
      <div
        class="h-full bg-teal-400 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <div class="px-6 py-6 pt-8 flex items-center justify-between">
      <button
        @click="$emit('close')"
        class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        <X class="w-5 h-5 text-black" />
      </button>
      <div class="text-sm font-medium text-gray-600">
        {{ currentIndex + 1 }} / {{ cards.length }}
      </div>
    </div>

    <div v-if="!currentWord" class="flex flex-col items-center justify-center py-20">
       <p class="text-gray-500">Немає слів для вивчення</p>
    </div>

    <div v-else-if="mode === 'flashcards'" class="px-6 py-12">
      <div class="max-w-md mx-auto">
        <div
          class="relative h-96 cursor-pointer perspective-1000"
          @click="flipCard"
        >
          <div
            :class="[
              'absolute w-full h-full transition-transform duration-500 transform-style-3d',
              isFlipped ? 'rotate-y-180' : ''
            ]"
          >
            <div
              class="absolute w-full h-full backface-hidden bg-gray-900 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl"
            >
              <p class="text-sm text-gray-400 mb-4">Англійською</p>
              <h2 class="text-4xl font-bold text-white text-center break-words">
                {{ currentWord.word }}
              </h2>
              <p class="text-sm text-gray-400 mt-8">Натисніть для перевороту</p>
            </div>

            <div
              class="absolute w-full h-full backface-hidden rotate-y-180 bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl"
            >
              <p class="text-sm text-gray-600 mb-4">Українською</p>
              <h2 class="text-3xl font-bold text-black text-center mb-6 break-words">
                {{ currentWord.translation }}
              </h2>
              <div v-if="currentWord.context" class="bg-gray-50 rounded-2xl p-4 w-full">
                <p class="text-sm text-gray-600 italic text-center">
                  "{{ currentWord.context }}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isFlipped" class="flex gap-3 mt-8">
          <button
            @click.stop="handleAnswer(false)"
            :disabled="isSending"
            class="flex-1 py-4 bg-gray-100 text-black font-semibold rounded-3xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Не пам'ятаю
          </button>
          <button
            @click.stop="handleAnswer(true)"
            :disabled="isSending"
            class="flex-1 py-4 bg-teal-400 text-white font-semibold rounded-3xl hover:bg-teal-500 transition-colors disabled:opacity-50"
          >
            Пам'ятаю
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="mode === 'guess'" class="px-6 py-12">
      <div class="max-w-md mx-auto">
        <div class="bg-gray-900 rounded-3xl p-8 text-center mb-8 shadow-xl">
          <p class="text-sm text-gray-400 mb-4">Перекладіть слово</p>
          <h2 class="text-4xl font-bold text-white break-words">
            {{ currentWord.word }}
          </h2>
        </div>

        <div class="space-y-3">
          <button
            v-for="(option, index) in currentOptions"
            :key="index"
            @click="selectAnswer(option)"
            :disabled="selectedAnswer !== null || isSending"
            :class="[
              'w-full py-4 px-6 font-semibold rounded-3xl text-left transition-all duration-200',
              getOptionClass(option)
            ]"
          >
            {{ option }}
          </button>
        </div>

        <button
          v-if="selectedAnswer !== null"
          @click="nextQuestion"
          class="w-full py-4 bg-black text-white font-semibold rounded-3xl mt-8 hover:bg-gray-800 transition-colors"
        >
          Далі
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { X } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['flashcards', 'guess'].includes(value)
  },
  cards: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['close', 'show-results'])


const currentIndex = ref(0)
const isFlipped = ref(false)
const isSending = ref(false) 
const correctAnswers = ref(0)

const selectedAnswer = ref(null)
const currentOptions = ref([])


const currentWord = computed(() => props.cards[currentIndex.value])
const progress = computed(() => ((currentIndex.value + 1) / props.cards.length) * 100)


const sendReview = async (cardId, quality) => {
  try {
    isSending.value = true
    await axios.patch(`${VITE_API_URL}/cards/review`, {
      card_id: cardId,
      quality: quality
    }, { withCredentials: true })
    
  } catch (error) {
    console.error('Помилка оновлення SRS:', error)
  } finally {
    isSending.value = false
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const handleAnswer = async (remembered) => {
  const quality = remembered ? 5 : 1
  
  await sendReview(currentWord.value.id, quality)


  if (remembered) correctAnswers.value++
  

  goNext()
}

const generateOptions = () => {
  if (!currentWord.value) return

  const correct = currentWord.value.translation
  

  const allTranslations = props.cards
    .map(c => c.translation)
    .filter(t => t !== correct)
  

  const wrongAnswers = allTranslations
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  const options = [...wrongAnswers, correct].sort(() => Math.random() - 0.5)
  currentOptions.value = options
}

const selectAnswer = async (option) => {
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = option
  
  const isCorrect = option === currentWord.value.translation
  

  const quality = isCorrect ? 5 : 1
  await sendReview(currentWord.value.id, quality)

  if (isCorrect) correctAnswers.value++
}

const getOptionClass = (option) => {
  if (selectedAnswer.value === null) {
    return 'bg-gray-100 text-black hover:bg-gray-200'
  }
  
  const isCorrect = option === currentWord.value.translation
  const isSelected = option === selectedAnswer.value
  
  if (isCorrect) return 'bg-teal-400 text-white'
  if (isSelected && !isCorrect) return 'bg-red-400 text-white'
  
  return 'bg-gray-100 text-gray-400'
}


const goNext = () => {
  isFlipped.value = false
  selectedAnswer.value = null
  
  if (currentIndex.value < props.cards.length - 1) {
    currentIndex.value++
    if (props.mode === 'guess') generateOptions()
  } else {
    finishTraining()
  }
}

const nextQuestion = () => {
  goNext()
}

const finishTraining = () => {
  emit('show-results', {
    total: props.cards.length,
    correct: correctAnswers.value
  })
}


watch(() => props.cards, (newVal) => {
  if (newVal.length > 0 && props.mode === 'guess') {
    generateOptions()
  }
}, { immediate: true })

</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>