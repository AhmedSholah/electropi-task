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

  it('accepts an expired due date when it is unchanged during an edit', () => {
    const expiredTask = {
      ...validTask,
      title: 'Updated release notes',
      dueDate: '2026-07-20',
    }

    expect(validateTask(expiredTask, { existingDueDate: '2026-07-20' }))
      .toEqual({ valid: true, errors: {} })
  })

  it('rejects changing an existing due date to an expired date', () => {
    const result = validateTask({
      ...validTask,
      dueDate: '2026-07-20',
    }, { existingDueDate: '2026-07-19' })

    expect(result.errors.dueDate).toBe('Due date must be in the future.')
  })
})
