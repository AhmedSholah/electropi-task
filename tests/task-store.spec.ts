import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task, TaskListResponse } from '../shared/types/task'
import { useTaskStore } from '../app/stores/tasks'

const task: Task = {
  id: '1',
  title: 'Write Documentation',
  description: '',
  status: 'in_progress',
  dueDate: '2026-08-02',
  createdAt: '2026-07-20T10:00:00.000Z',
  updatedAt: '2026-07-20T10:00:00.000Z',
  owner: {
    id: 'owner-1',
    name: 'Task Owner',
    email: 'owner@example.com',
  },
  assignee: null,
  assigneeId: null,
  access: 'owner',
}

function taskResponse(items: Task[], page = 1): TaskListResponse {
  return {
    items,
    page,
    pageSize: 6,
    total: items.length,
    totalPages: 1,
    stats: {
      total: items.length,
      pending: 0,
      inProgress: items.length,
      done: 0,
    },
  }
}

describe('task store server-side listing', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.unstubAllGlobals()
  })

  it('uses active tasks first as the default sort', () => {
    const store = useTaskStore()

    expect(store.sortBy).toBe('active_due_asc')
  })

  it('sends search, filter, sort, and pagination to the list endpoint', async () => {
    const requestFetch = vi.fn().mockResolvedValue(taskResponse([task], 2))
    vi.stubGlobal('useRequestFetch', () => requestFetch)
    const store = useTaskStore()
    store.searchQuery = '  documentation  '
    store.statusFilter = 'in_progress'
    store.sortBy = 'due_desc'
    store.currentPage = 2

    await store.fetchTasks()

    expect(requestFetch).toHaveBeenCalledWith('/api/tasks', {
      query: {
        search: 'documentation',
        status: 'in_progress',
        sort: 'due_desc',
        page: 2,
        pageSize: 6,
      },
    })
    expect(store.tasks).toEqual([task])
    expect(store.stats.total).toBe(1)
  })

  it('does not let a slower search overwrite newer results', async () => {
    const newerTask = { ...task, id: '2', title: 'Newer result' }
    let resolveFirst!: (response: TaskListResponse) => void
    const requestFetch = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => resolveFirst = resolve))
      .mockResolvedValueOnce(taskResponse([newerTask]))
    vi.stubGlobal('useRequestFetch', () => requestFetch)
    const store = useTaskStore()

    store.searchQuery = 'older'
    const firstRequest = store.fetchTasks(true)
    store.searchQuery = 'newer'
    const secondRequest = store.fetchTasks(true)

    await secondRequest
    resolveFirst(taskResponse([task]))
    await firstRequest

    expect(store.tasks).toEqual([newerTask])
    expect(store.loading).toBe(false)
  })
})
