<template>
  <Transition name="sheet">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end justify-center"
      @click.self="close"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
      
      <div class="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div v-if="word.isLoading" class="flex flex-col items-center justify-center py-20">
           <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400 mb-4"></div>
           <p class="text-gray-500">Шукаємо переклад...</p>
        </div>

        <template v-else>
          <div class="px-6 pt-4 pb-3 border-b border-gray-100">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-3xl font-bold text-black">{{ word.text }}</h2>
                <p v-if="word.transcription" class="text-sm text-gray-500 mt-1 font-mono">
                  [{{ word.transcription }}]
                </p>
              </div>
              <button
                @click="close"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X class="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            
            <div class="bg-teal-50 border border-teal-100 rounded-2xl p-4">
               <p class="text-sm text-teal-600 mb-1 font-medium">Основний переклад</p>
               <p class="text-2xl font-bold text-black">{{ word.translation }}</p>
            </div>

            <div v-if="word.contextSentence" class="space-y-2">
               <h3 class="text-lg font-semibold text-black">Контекст</h3>
               <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p class="text-gray-800 mb-2 italic">"{{ word.contextSentence }}"</p>
                  
                  <div v-if="word.sentenceTranslation" class="mt-2 pt-2 border-t border-gray-200">
                     <p class="text-teal-700 font-medium">{{ word.sentenceTranslation }}</p>
                  </div>
                  <div v-else class="mt-2 flex items-center gap-2 text-gray-400 text-sm">
                     <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></span>
                     Перекладаємо речення...
                  </div>
               </div>
            </div>

            <div v-if="word.additionalTranslations && word.additionalTranslations.length > 0" class="space-y-3">
              <h3 class="text-lg font-semibold text-black">Інші варіанти</h3>
              <div class="flex flex-wrap gap-2">
                 <span 
                    v-for="(t, index) in word.additionalTranslations" 
                    :key="index"
                    class="px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm border border-gray-100"
                 >
                    {{ t }}
                 </span>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-200 bg-white">
            <button
              @click="addToDictionary"
              :disabled="isAdding"
              class="w-full py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="isAdding" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              <Plus v-else class="w-5 h-5" />
              <span>{{ isAdding ? 'Додавання...' : 'Додати до словника' }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { X, Plus } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  word: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'add-to-dictionary'])
const isAdding = ref(false)

const close = () => {
  emit('close')
}

const addToDictionary = async () => {
  if (isAdding.value) return
  isAdding.value = true

  try {
    // Відправляємо запит на додавання картки (слова)
    await axios.post('/api/v1/learning/', {
      word: props.word.text,
      translation: props.word.translation,
      context: props.word.contextSentence || '' // Передаємо контекст або пустий рядок
    }, {
      withCredentials: true // Важливо для куки
    })

    // Успіх
    emit('add-to-dictionary', props.word)
    close()
    
  } catch (error) {
    console.error('Помилка додавання до словника:', error)
    alert('Не вдалося додати слово. Спробуйте ще раз.')
  } finally {
    isAdding.value = false
  }
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-active .animate-slide-up {
  animation: slideUp 0.3s ease;
}
.sheet-leave-active .animate-slide-up {
  animation: slideDown 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
</style>