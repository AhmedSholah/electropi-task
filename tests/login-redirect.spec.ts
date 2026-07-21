import { describe, expect, it } from 'vitest'
import { getLoginRedirect } from '../app/utils/loginRedirect'

describe('login redirect', () => {
  it('starts onboarding when the demo account signs in', () => {
    expect(getLoginRedirect('demo@taskflow.dev', undefined)).toEqual({
      path: '/',
      query: { onboarding: '1' },
    })
  })

  it('recognizes the demo account regardless of email casing', () => {
    expect(getLoginRedirect(' Demo@TaskFlow.dev ', '/tasks/new')).toEqual({
      path: '/',
      query: { onboarding: '1' },
    })
  })

  it('preserves safe redirects for other accounts', () => {
    expect(getLoginRedirect('user@example.com', '/tasks/new')).toBe('/tasks/new')
  })

  it('falls back to the dashboard for unsafe redirects', () => {
    expect(getLoginRedirect('user@example.com', '//example.com')).toBe('/')
  })
})
