<template>
  <div class="min-h-screen bg-white pb-20">
    <div class="bg-white">
      <div class="px-6 py-6">
        <h1 class="text-3xl font-bold text-black">Словник</h1>
        <p class="text-sm text-gray-600 mt-1">Відстежуйте свій прогрес навчання</p>
      </div>
    </div>

    <div class="px-6 py-6 space-y-6">

      <section>
        <h2 class="text-xl font-bold text-black mb-4">Тренування</h2>
        <div class="space-y-3">
          
          <div
            class="bg-gray-900 rounded-3xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 relative overflow-hidden"
            @click="startTraining('flashcards')"
          >
            <div class="flex items-center justify-between relative z-10">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Layers class="w-6 h-6 text-teal-400" />
                  <span class="text-sm font-medium text-gray-300">Класичні</span>
                </div>
                <p class="text-2xl font-bold">Флеш-картки</p>
                <p class="text-sm text-gray-300 mt-2">
                   <span v-if="dueCards.length > 0">Доступно {{ dueCards.length }} слів</span>
                   <span v-else>Всі слова повторені</span>
                </p>
              </div>
              <ChevronRight class="w-8 h-8 text-teal-400" />
            </div>
            </div>

          <div
            class="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
            @click="startTraining('guess')"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <HelpCircle class="w-6 h-6 text-teal-400" />
                  <span class="text-sm font-medium text-gray-600">Інтерактив</span>
                </div>
                <p class="text-2xl font-bold text-black">Вгадай слово</p>
                <p class="text-sm text-gray-600 mt-2">Оберіть правильний переклад</p>
              </div>
              <ChevronRight class="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Sparkles,
  Layers,
  HelpCircle,
  ChevronRight
} from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL

const emit = defineEmits(['start-training'])

const isLoading = ref(false)
const dueCards = ref([]) 

const stats = ref({
  totalWords: 247, 
  mastered: 202   
})


const fetchDueCards = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_URL}/learning/get`, {
      withCredentials: true
    })

    dueCards.value = response.data || []
  } catch (error) {
    console.error('Ошибка получения слов для повторения:', error)
  } finally {
    isLoading.value = false
  }
}


const startTraining = (type) => {

  if (dueCards.value.length === 0) {
    alert("Чудово! Всі слова на сьогодні повторені. Повертайтесь пізніше.")
    return
  }

  emit('start-training', { 
    type: type, 
    cards: dueCards.value 
  })
}

onMounted(() => {
  fetchDueCards()
})
</script>