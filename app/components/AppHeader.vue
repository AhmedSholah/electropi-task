<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const route = useRoute()
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
    const navigationResult = await navigateTo('/login')

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      loggingOut.value = false
    }
  }
  catch (error) {
    loggingOut.value = false
    throw error
  }
}

const accountItems = computed(() => [
  [
    {
      label: authStore.user?.name ?? 'Account',
      type: 'label' as const,
    },
    {
      label: authStore.user?.email ?? '',
      disabled: true,
    },
  ],
  [
    {
      label: loggingOut.value ? 'Signing out…' : 'Sign out',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      loading: loggingOut.value,
      disabled: loggingOut.value,
      onSelect: handleLogout,
    },
  ],
])
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
      <AppLogo />

      <nav class="ml-auto hidden h-full items-center gap-1 sm:flex" aria-label="Primary navigation">
        <UButton
          to="/"
          label="Dashboard"
          icon="i-lucide-layout-dashboard"
          variant="ghost"
          :color="route.path === '/' ? 'primary' : 'neutral'"
          class="relative h-full rounded-none px-4"
        >
          <span v-if="route.path === '/'" class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
        </UButton>
        <UButton
          to="/tasks/new"
          label="Create Task"
          icon="i-lucide-circle-plus"
          variant="ghost"
          :color="route.path === '/tasks/new' ? 'primary' : 'neutral'"
          class="relative h-full rounded-none px-4"
        >
          <span v-if="route.path === '/tasks/new'" class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />
        </UButton>
      </nav>

      <UDropdownMenu :items="accountItems" :content="{ align: 'end' }" class="ml-auto sm:ml-6">
        <UButton
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          aria-label="Open account menu"
          class="rounded-full p-1"
        >
          <span class="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {{ initials }}
          </span>
        </UButton>
      </UDropdownMenu>
    </div>

    <nav class="grid grid-cols-2 border-t border-slate-100 sm:hidden" aria-label="Mobile navigation">
      <UButton
        to="/"
        label="Dashboard"
        icon="i-lucide-layout-dashboard"
        variant="ghost"
        :color="route.path === '/' ? 'primary' : 'neutral'"
        class="justify-center rounded-none py-2.5 text-xs"
      />
      <UButton
        to="/tasks/new"
        label="Create Task"
        icon="i-lucide-circle-plus"
        variant="ghost"
        :color="route.path === '/tasks/new' ? 'primary' : 'neutral'"
        class="justify-center rounded-none py-2.5 text-xs"
      />
    </nav>
  </header>
</template>
