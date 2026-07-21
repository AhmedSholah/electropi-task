<script setup lang="ts">
const authStore = useAuthStore()
const taskStore = useTaskStore()
const route = useRoute()
const menuOpen = ref(false)
const loggingOut = ref(false)

const initials = computed(() => authStore.user?.name
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || 'U')

async function handleLogout() {
  loggingOut.value = true

  try {
    await authStore.logout()
    taskStore.reset()
    await navigateTo('/login')
  }
  finally {
    loggingOut.value = false
    menuOpen.value = false
  }
}

watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
      <AppLogo />

      <nav class="ml-auto hidden h-full items-center gap-1 sm:flex" aria-label="Primary navigation">
        <NuxtLink
          to="/"
          class="relative inline-flex h-full items-center gap-2 px-4 text-sm font-medium transition-colors"
          :class="route.path === '/' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'"
        >
          <Icon name="lucide:layout-dashboard" class="size-4" aria-hidden="true" />
          Dashboard
          <span v-if="route.path === '/'" class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
        </NuxtLink>
        <NuxtLink
          to="/tasks/new"
          class="relative inline-flex h-full items-center gap-2 px-4 text-sm font-medium transition-colors"
          :class="route.path === '/tasks/new' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'"
        >
          <Icon name="lucide:circle-plus" class="size-4" aria-hidden="true" />
          Create Task
          <span v-if="route.path === '/tasks/new'" class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
        </NuxtLink>
      </nav>

      <div class="relative ml-auto sm:ml-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full p-1 text-left transition hover:bg-slate-100"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click="menuOpen = !menuOpen"
        >
          <span class="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {{ initials }}
          </span>
          <Icon name="lucide:chevron-down" class="mr-1 hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
          <span class="sr-only">Open account menu</span>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          role="menu"
        >
          <div class="border-b border-slate-100 px-4 py-3">
            <p class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.name }}</p>
            <p class="truncate text-xs text-slate-500">{{ authStore.user?.email }}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <Icon name="lucide:log-out" class="size-4" aria-hidden="true" />
            {{ loggingOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>
    </div>

    <nav class="grid grid-cols-2 border-t border-slate-100 sm:hidden" aria-label="Mobile navigation">
      <NuxtLink
        to="/"
        class="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
        :class="route.path === '/' ? 'text-brand-600' : 'text-slate-500'"
      >
        <Icon name="lucide:layout-dashboard" class="size-4" /> Dashboard
      </NuxtLink>
      <NuxtLink
        to="/tasks/new"
        class="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
        :class="route.path === '/tasks/new' ? 'text-brand-600' : 'text-slate-500'"
      >
        <Icon name="lucide:circle-plus" class="size-4" /> Create Task
      </NuxtLink>
    </nav>
  </header>
</template>
