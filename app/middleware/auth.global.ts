export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authStore.initialized) {
    await authStore.fetchSession()
  }

  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: to.fullPath === '/' ? undefined : { redirect: to.fullPath },
    })
  }

  if (authStore.isAuthenticated && isPublicRoute) {
    return navigateTo('/')
  }
})
