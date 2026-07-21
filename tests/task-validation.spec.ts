import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskPayload } from '../shared/types/task'
import { getMinimumDueDate, validateTask } from '../shared/utils/taskValidation'

describe('task validation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const validTask: TaskPayload = {
    title: 'Prepare release notes',
    description: 'Summarize the next release.',
    status: 'pending',
    dueDate: '2026-07-22',
    assigneeId: null,
  }

  it('rejects a blank title and a due date that is not in the future', () => {
    const result = validateTask({
      ...validTask,
      title: '   ',
      dueDate: '2026-07-21',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('Task title is required.')
    expect(result.errors.dueDate).toBe('Due date must be in the future.')
  })

  it('accepts a complete task with a future due date', () => {
    expect(getMinimumDueDate()).toBe('2026-07-22')
    expect(validateTask(validTask)).toEqual({ valid: true, errors: {} })
  })
})
