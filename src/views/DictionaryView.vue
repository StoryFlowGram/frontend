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

      <Transition name="fade">
        <div
          v-if="notice"
          class="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black text-white text-sm shadow-lg"
        >
          {{ notice }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Layers, HelpCircle, ChevronRight } from 'lucide-vue-next'
import api, { getErrorMessage } from '@/shared/api/client'

const emit = defineEmits(['start-training'])

const dueCards = ref([])
const notice = ref('')
let noticeTimeout = null

const showNotice = (message) => {
  notice.value = message
  if (noticeTimeout) clearTimeout(noticeTimeout)

  noticeTimeout = setTimeout(() => {
    notice.value = ''
  }, 3000)
}

const fetchDueCards = async () => {
  try {
    const response = await api.get('/learning/get')
    dueCards.value = response.data || []
  } catch (error) {
    showNotice(getErrorMessage(error, 'Не вдалося завантажити слова для тренування'))
  }
}

const startTraining = (type) => {
  if (dueCards.value.length === 0) {
    showNotice('Чудово! Всі слова на сьогодні повторені. Повертайтесь пізніше.')
    return
  }

  emit('start-training', {
    type,
    cards: dueCards.value
  })
}

onMounted(() => {
  fetchDueCards()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
