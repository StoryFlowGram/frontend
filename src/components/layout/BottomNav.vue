<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50"
  >
    <div class="flex justify-around items-center h-16 px-2">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="$emit('navigate', item.id)"
        class="relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200"
      >
        <div
          v-if="currentView === item.id"
          class="absolute top-0 w-1.5 h-1.5 bg-teal-400 rounded-full"
        ></div>

        <component
          :is="item.icon"
          :class="[
            'w-6 h-6 transition-colors',
            currentView === item.id ? 'text-black stroke-2' : 'text-gray-400 stroke-1'
          ]"
        />
        <span
          :class="[
            'text-xs font-medium transition-colors',
            currentView === item.id ? 'text-black' : 'text-gray-400'
          ]"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { Library, BookMarked, User } from 'lucide-vue-next'

defineProps({
  currentView: {
    type: String,
    required: true
  }
})

defineEmits(['navigate'])

const navItems = [
  { id: 'library', label: 'Каталог', icon: Library },
  { id: 'dictionary', label: 'Словник', icon: BookMarked },
  { id: 'profile', label: 'Профіль', icon: User }
]
</script>
