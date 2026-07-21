<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const showOnboarding = ref(route.query.onboarding === '1')

watch(
  () => route.query.onboarding,
  (value) => {
    if (value === '1') {
      showOnboarding.value = true
    }
  },
)

async function closeOnboarding() {
  showOnboarding.value = false

  if (route.query.onboarding !== '1') {
    return
  }

  const query = { ...route.query }
  delete query.onboarding
  await navigateTo({ path: route.path, query }, { replace: true })
}
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <slot />
    </main>

    <ClientOnly>
      <AppOnboardingTour
        v-if="showOnboarding && authStore.user"
        :user-name="authStore.user.name"
        @complete="closeOnboarding"
        @skip="closeOnboarding"
      />
    </ClientOnly>
  </div>
</template>
