<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Create account · TaskFlow' })

const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const fieldErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

onBeforeUnmount(() => authStore.clearError())

function validate() {
  fieldErrors.name = form.name.trim().length >= 2 ? '' : 'Name must be at least 2 characters.'
  fieldErrors.email = /^\S+@\S+\.\S+$/.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  fieldErrors.password = form.password.length >= 8 ? '' : 'Use at least 8 characters.'
  fieldErrors.confirmPassword = form.confirmPassword === form.password ? '' : 'Passwords do not match.'

  return !Object.values(fieldErrors).some(Boolean)
}

async function handleSubmit() {
  if (!validate()) {
    return
  }

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    await navigateTo('/')
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
      <h1 class="mt-7 text-3xl font-bold tracking-tight text-white">Create your account</h1>
      <p class="mt-2 text-sm text-slate-400">Set up a private workspace for your tasks.</p>
    </div>

    <form class="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8" novalidate @submit.prevent="handleSubmit">
      <BaseAlert v-if="error" variant="error" class="mb-5">{{ error }}</BaseAlert>

      <div class="space-y-4">
        <BaseInput
          v-model="form.name"
          name="name"
          label="Full name"
          placeholder="Your name"
          autocomplete="name"
          :error="fieldErrors.name"
          required
        />
        <BaseInput
          v-model="form.email"
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :error="fieldErrors.email"
          required
        />
        <BaseInput
          v-model="form.password"
          name="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autocomplete="new-password"
          :error="fieldErrors.password"
          required
        />
        <BaseInput
          v-model="form.confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autocomplete="new-password"
          :error="fieldErrors.confirmPassword"
          required
        />
      </div>

      <BaseButton type="submit" block :loading="loading" class="mt-6">
        {{ loading ? 'Creating account…' : 'Create account' }}
        <Icon v-if="!loading" name="lucide:arrow-right" class="size-4" />
      </BaseButton>

      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <NuxtLink to="/login" class="font-semibold text-brand-600 hover:text-brand-700">Sign in</NuxtLink>
      </p>
    </form>
  </div>
</template>
