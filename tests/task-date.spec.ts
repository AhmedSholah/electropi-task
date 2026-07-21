import { describe, expect, it } from 'vitest'
import { formatRelativeTime, formatTaskTimestamp } from '../app/utils/taskTimestamp'

describe('task timestamp formatting', () => {
  const now = new Date('2026-07-21T12:00:00.000Z').getTime()

  it('formats the creation timestamp as a compact calendar date', () => {
    expect(formatTaskTimestamp('2023-10-12T08:30:00.000Z')).toBe('Oct 12, 2023')
  })

  it('formats updates relative to the supplied current time', () => {
    expect(formatRelativeTime('2026-07-21T10:00:00.000Z', now)).toBe('2 hours ago')
    expect(formatRelativeTime('2026-07-21T11:59:45.000Z', now)).toBe('Just now')
  })
})
