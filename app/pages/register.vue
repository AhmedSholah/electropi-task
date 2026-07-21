<script setup lang="ts">
import { useForm } from 'vee-validate'
import { isNavigationFailure } from 'vue-router'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Create account · TaskFlow' })

const authStore = useAuthStore()
const { error } = storeToRefs(authStore)
const submitting = ref(false)

const { defineField, errors, handleSubmit } = useForm<RegisterForm>({
  initialValues: { name: '', email: '', password: '', confirmPassword: '' },
  validationSchema: {
    name: (value: unknown) => String(value ?? '').trim().length >= 2 || 'Name must be at least 2 characters.',
    email: (value: unknown) => /^\S+@\S+\.\S+$/.test(String(value ?? '').trim()) || 'Enter a valid email address.',
    password: (value: unknown) => String(value ?? '').length >= 8 || 'Use at least 8 characters.',
    confirmPassword: (value: unknown, context: { form: Partial<RegisterForm> }) => value === context.form.password || 'Passwords do not match.',
  },
})

const fieldOptions = { validateOnModelUpdate: false }
const [name, nameProps] = defineField('name', fieldOptions)
const [email, emailProps] = defineField('email', fieldOptions)
const [password, passwordProps] = defineField('password', fieldOptions)
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', fieldOptions)

onBeforeUnmount(() => authStore.clearError())

const onSubmit = handleSubmit(async (values) => {
  submitting.value = true

  try {
    await authStore.register({
      name: values.name,
      email: values.email,
      password: values.password,
    })
    const navigationResult = await navigateTo('/')

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      submitting.value = false
    }
  }
  catch {
    submitting.value = false
    // The store exposes a user-friendly API error above the form.
  }
})
</script>

<template>
  <div>
    <div class="mb-7 text-center">
      <AppLogo light />
      <h1 class="mt-7 text-3xl font-bold tracking-tight text-white">Create your account</h1>
      <p class="mt-2 text-sm text-slate-400">Set up a private workspace for your tasks.</p>
    </div>

    <UCard :ui="{ body: 'p-6 sm:p-8' }" class="shadow-2xl shadow-black/30">
      <form novalidate @submit="onSubmit">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="error"
          class="mb-5"
        />

        <div class="space-y-4">
          <UFormField name="name" label="Full name" required :error="errors.name">
            <UInput v-model="name" v-bind="nameProps" name="name" placeholder="Your name" autocomplete="name" leading-icon="i-lucide-user" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="email" label="Email address" required :error="errors.email">
            <UInput v-model="email" v-bind="emailProps" name="email" type="email" placeholder="you@example.com" autocomplete="email" leading-icon="i-lucide-mail" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="password" label="Password" required :error="errors.password">
            <UInput v-model="password" v-bind="passwordProps" name="password" type="password" placeholder="At least 8 characters" autocomplete="new-password" leading-icon="i-lucide-lock-keyhole" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="confirmPassword" label="Confirm password" required :error="errors.confirmPassword">
            <UInput v-model="confirmPassword" v-bind="confirmPasswordProps" name="confirmPassword" type="password" placeholder="Repeat your password" autocomplete="new-password" leading-icon="i-lucide-shield-check" size="lg" class="w-full" />
          </UFormField>
        </div>

        <UButton
          type="submit"
          block
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          :loading="submitting"
          :label="submitting ? 'Creating account…' : 'Create account'"
          class="mt-6"
        />

        <p class="mt-6 text-center text-sm text-muted">
          Already have an account?
          <ULink to="/login" class="font-semibold text-primary">Sign in</ULink>
        </p>
      </form>
    </UCard>
  </div>
</template>
