import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Task } from '../shared/types/task'
import { useTaskStore } from '../app/stores/tasks'

const tasks: Task[] = [
  {
    id: '1',
    title: 'Write Documentation',
    description: '',
    status: 'in_progress',
    dueDate: '2026-08-02',
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Fix login bug',
    description: '',
    status: 'pending',
    dueDate: '2026-07-28',
    createdAt: '2026-07-21T10:00:00.000Z',
    updatedAt: '2026-07-21T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Publish documentation',
    description: '',
    status: 'done',
    dueDate: '2026-08-05',
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:00:00.000Z',
  },
]

describe('task store filtering', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('combines case-insensitive title search with the status filter', () => {
    const store = useTaskStore()
    store.tasks = tasks
    store.searchQuery = 'DOCUMENTATION'
    store.statusFilter = 'in_progress'

    expect(store.filteredTasks.map(task => task.id)).toEqual(['1'])
  })

  it('sorts the filtered results by the selected due-date direction', () => {
    const store = useTaskStore()
    store.tasks = tasks
    store.sortBy = 'due_desc'

    expect(store.filteredTasks.map(task => task.id)).toEqual(['3', '1', '2'])
  })
})
