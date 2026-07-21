export const DEMO_ACCOUNT_EMAIL = 'demo@taskflow.dev'

export function getLoginRedirect(email: string, requestedRedirect: unknown) {
  if (email.trim().toLowerCase() === DEMO_ACCOUNT_EMAIL) {
    return {
      path: '/',
      query: { onboarding: '1' },
    }
  }

  return typeof requestedRedirect === 'string'
    && requestedRedirect.startsWith('/')
    && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/'
}
