import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '#shared/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)
  const requestFetch = useRequestFetch()

  const isAuthenticated = computed(() => Boolean(user.value))

  async function fetchSession() {
    if (initialized.value) {
      return user.value
    }

    try {
      const response = await requestFetch<{ user: AuthUser | null }>('/api/auth/me')
      user.value = response.user
    }
    catch {
      user.value = null
    }
    finally {
      initialized.value = true
    }

    return user.value
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: payload,
      })
      user.value = response.user
      initialized.value = true
      return response.user
    }
    catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to sign in. Please try again.')
      throw caughtError
    }
    finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: payload,
      })
      user.value = response.user
      initialized.value = true
      return response.user
    }
    catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to create your account. Please try again.')
      throw caughtError
    }
    finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      user.value = null
      initialized.value = true
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    fetchSession,
    login,
    register,
    logout,
    clearError,
  }
})
