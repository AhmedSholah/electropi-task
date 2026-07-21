<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Sign in · TaskFlow' })

const route = useRoute()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)
const email = ref('')
const password = ref('')
const fieldErrors = reactive({ email: '', password: '' })

onBeforeUnmount(() => authStore.clearError())

function useDemoAccount() {
  email.value = 'demo@taskflow.dev'
  password.value = 'password123'
  fieldErrors.email = ''
  fieldErrors.password = ''
  authStore.clearError()
}

async function handleSubmit() {
  fieldErrors.email = /^\S+@\S+\.\S+$/.test(email.value.trim()) ? '' : 'Enter a valid email address.'
  fieldErrors.password = password.value ? '' : 'Password is required.'

  if (fieldErrors.email || fieldErrors.password) {
    return
  }

  try {
    await authStore.login({ email: email.value, password: password.value })
    const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    const safeRedirect = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//') ? requestedRedirect : '/'
    await navigateTo(safeRedirect)
  }
  catch {
    // The store exposes a user-friendly API error above the form.
  }
}
</script>

<template>
  <div>
    <div class="mb-7 text-center">
      <AppLogo light />
      <h1 class="mt-7 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
      <p class="mt-2 text-sm text-slate-400">Sign in to continue to your task workspace.</p>
    </div>

    <form class="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8" novalidate @submit.prevent="handleSubmit">
      <BaseAlert v-if="error" variant="error" class="mb-5">{{ error }}</BaseAlert>

      <div class="space-y-5">
        <BaseInput
          v-model="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :error="fieldErrors.email"
          required
          @blur="fieldErrors.email = /^\S+@\S+\.\S+$/.test(email.trim()) ? '' : 'Enter a valid email address.'"
        >
          <template #leading>
            <Icon name="lucide:mail" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </template>
        </BaseInput>

        <BaseInput
          v-model="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
          :error="fieldErrors.password"
          required
          @blur="fieldErrors.password = password ? '' : 'Password is required.'"
        >
          <template #leading>
            <Icon name="lucide:lock-keyhole" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </template>
        </BaseInput>
      </div>

      <BaseButton type="submit" block :loading="loading" class="mt-6">
        {{ loading ? 'Signing in…' : 'Sign in' }}
        <Icon v-if="!loading" name="lucide:arrow-right" class="size-4" />
      </BaseButton>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200" />
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Demo access</span>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        class="w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-100/60"
        @click="useDemoAccount"
      >
        <span class="flex items-center justify-between gap-3">
          <span>
            <span class="block text-xs font-bold text-indigo-900">Use the demo account</span>
            <span class="mt-0.5 block text-xs text-indigo-600">demo@taskflow.dev · password123</span>
          </span>
          <Icon name="lucide:sparkles" class="size-4 shrink-0 text-indigo-500" />
        </span>
      </button>

      <p class="mt-6 text-center text-sm text-slate-500">
        New to TaskFlow?
        <NuxtLink to="/register" class="font-semibold text-brand-600 hover:text-brand-700">Create an account</NuxtLink>
      </p>
    </form>

    <p class="mt-6 text-center text-xs text-slate-500">In-memory demo · Data resets when the server restarts</p>
  </div>
</template>
