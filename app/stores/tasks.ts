import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Task, TaskPayload, TaskStatus } from '#shared/types/task'
import { getErrorMessage } from '../utils/getErrorMessage'

export type TaskSort = 'due_asc' | 'due_desc' | 'newest'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref<TaskStatus | 'all'>('all')
  const sortBy = ref<TaskSort>('due_asc')
  const filteredTasks = computed(() => {
    const normalizedSearch = searchQuery.value.trim().toLowerCase()
    const filtered = tasks.value.filter((task) => {
      const matchesStatus = statusFilter.value === 'all' || task.status === statusFilter.value
      const matchesSearch = !normalizedSearch || task.title.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })

    return [...filtered].sort((first, second) => {
      if (sortBy.value === 'newest') {
        return second.createdAt.localeCompare(first.createdAt)
      }

      const direction = sortBy.value === 'due_desc' ? -1 : 1
      return first.dueDate.localeCompare(second.dueDate) * direction
    })
  })

  const stats = computed(() => ({
    total: tasks.value.length,
    pending: tasks.value.filter(task => task.status === 'pending').length,
    inProgress: tasks.value.filter(task => task.status === 'in_progress').length,
    done: tasks.value.filter(task => task.status === 'done').length,
  }))

  async function fetchTasks(force = false) {
    if (loaded.value && !force) {
      return tasks.value
    }

    loading.value = true
    error.value = null

    try {
      const requestFetch = useRequestFetch()
      tasks.value = await requestFetch<Task[]>('/api/tasks')
      loaded.value = true
      return tasks.value
    }
    catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to load tasks. Please try again.')
      throw caughtError
    }
    finally {
      loading.value = false
    }
  }

  async function fetchTask(id: string) {
    const existingTask = tasks.value.find(task => task.id === id)

    if (existingTask) {
      return existingTask
    }

    loading.value = true
    error.value = null

    try {
      const requestFetch = useRequestFetch()
      const task = await requestFetch<Task>(`/api/tasks/${id}`)
      const index = tasks.value.findIndex(item => item.id === id)

      if (index === -1) {
        tasks.value.push(task)
      }
      else {
        tasks.value[index] = task
      }

      return task
    }
    catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to load this task.')
      throw caughtError
    }
    finally {
      loading.value = false
    }
  }

  async function addTask(payload: TaskPayload) {
    saving.value = true

    try {
      const task = await $fetch<Task>('/api/tasks', {
        method: 'POST',
        body: payload,
      })
      tasks.value.unshift(task)
      return task
    }
    finally {
      saving.value = false
    }
  }

  async function updateTask(id: string, payload: TaskPayload) {
    saving.value = true

    try {
      const updatedTask = await $fetch<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: payload,
      })
      const index = tasks.value.findIndex(task => task.id === id)

      if (index === -1) {
        tasks.value.push(updatedTask)
      }
      else {
        tasks.value[index] = updatedTask
      }

      return updatedTask
    }
    finally {
      saving.value = false
    }
  }

  async function deleteTask(id: string) {
    deletingId.value = id

    try {
      await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      tasks.value = tasks.value.filter(task => task.id !== id)
    }
    finally {
      deletingId.value = null
    }
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    sortBy.value = 'due_asc'
  }

  function reset() {
    tasks.value = []
    loaded.value = false
    error.value = null
    clearFilters()
  }

  return {
    tasks,
    loading,
    saving,
    deletingId,
    error,
    loaded,
    searchQuery,
    statusFilter,
    sortBy,
    filteredTasks,
    stats,
    fetchTasks,
    fetchTask,
    addTask,
    updateTask,
    deleteTask,
    clearFilters,
    reset,
  }
})
