<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-6 py-12">
    <div class="max-w-md w-full">
      <!-- Success animation container -->
      <div class="text-center mb-8 animate-bounce-in">
        <div class="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-scale-in">
          <Check class="w-14 h-14 text-white" :stroke-width="3" />
        </div>
        
        <h1 class="text-3xl font-bold text-black mb-3 animate-slide-up">
          Ми молодці! 🎉
        </h1>
        <p class="text-gray-600 text-lg animate-slide-up delay-100">
          Ви завершили тренування
        </p>
      </div>

      <!-- Results Card -->
      <div class="bg-white rounded-3xl p-8 shadow-xl mb-6 animate-slide-up delay-200">
        <div class="text-center mb-6">
          <div class="text-6xl font-bold text-black mb-2">
            {{ wordsStudied }}
          </div>
          <p class="text-gray-600 text-lg">
            {{ wordsStudied === 1 ? 'слово вивчено' : wordsStudied < 5 ? 'слова вивчено' : 'слів вивчено' }}
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-teal-50 rounded-2xl p-4 text-center">
            <div class="text-2xl font-bold text-teal-600 mb-1">{{ correctAnswers }}</div>
            <p class="text-sm text-gray-600">Правильно</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-4 text-center">
            <div class="text-2xl font-bold text-gray-600 mb-1">{{ totalWords - correctAnswers }}</div>
            <p class="text-sm text-gray-600">Помилок</p>
          </div>
        </div>

        <!-- Accuracy Bar -->
        <div class="mb-2">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Точність</span>
            <span class="font-semibold">{{ accuracy }}%</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: accuracy + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="$emit('finish')"
        class="w-full py-5 bg-black text-white font-bold rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-slide-up delay-300"
      >
        Готово
      </button>

      <!-- Motivational message -->
      <p class="text-center text-gray-500 text-sm mt-6 animate-fade-in delay-400">
        {{ getMotivationalMessage() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  totalWords: {
    type: Number,
    default: 5
  },
  correctAnswers: {
    type: Number,
    default: 4
  }
})

defineEmits(['finish'])

const wordsStudied = computed(() => props.totalWords)
const accuracy = computed(() => Math.round((props.correctAnswers / props.totalWords) * 100))

const getMotivationalMessage = () => {
  const acc = accuracy.value
  if (acc === 100) return '💯 Ідеально! Ви справжній майстер!'
  if (acc >= 80) return '🌟 Чудова робота! Продовжуйте в тому ж дусі!'
  if (acc >= 60) return '👍 Добре! Ще трохи практики і буде відмінно!'
  return '💪 Не здавайтесь! Кожна помилка - це крок до успіху!'
}
</script>

<style scoped>
@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out 0.2s backwards;
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out backwards;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out backwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}
</style>
