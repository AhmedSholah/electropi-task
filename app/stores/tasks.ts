import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskListResponse, TaskPayload, TaskSort, TaskStats, TaskStatus, TaskStatusPayload } from '#shared/types/task'
import { getErrorMessage } from '../utils/getErrorMessage'

const DEFAULT_PAGE_SIZE = 6

const emptyStats = (): TaskStats => ({
  total: 0,
  pending: 0,
  inProgress: 0,
  done: 0,
})

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const stats = ref<TaskStats>(emptyStats())
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref<TaskStatus | 'all'>('all')
  const sortBy = ref<TaskSort>('active_due_asc')
  const currentPage = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const total = ref(0)
  const totalPages = ref(1)
  const lastCreatedTaskId = ref<string | null>(null)
  let latestRequest = 0
  let lastLoadedQuery = ''

  function getListQuery() {
    return {
      search: searchQuery.value.trim(),
      status: statusFilter.value,
      sort: sortBy.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    }
  }

  async function fetchTasks(force = false) {
    const query = getListQuery()
    const queryKey = JSON.stringify(query)

    if (loaded.value && !force && queryKey === lastLoadedQuery) {
      return tasks.value
    }

    const requestId = ++latestRequest
    loading.value = true
    error.value = null

    try {
      const requestFetch = useRequestFetch()
      const response = await requestFetch<TaskListResponse>('/api/tasks', { query })

      if (requestId === latestRequest) {
        tasks.value = response.items
        stats.value = response.stats
        currentPage.value = response.page
        pageSize.value = response.pageSize
        total.value = response.total
        totalPages.value = response.totalPages
        loaded.value = true
        lastLoadedQuery = queryKey
      }

      return response.items
    }
    catch (caughtError) {
      if (requestId === latestRequest) {
        error.value = getErrorMessage(caughtError, 'Unable to load tasks. Please try again.')
      }

      throw caughtError
    }
    finally {
      if (requestId === latestRequest) {
        loading.value = false
      }
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
      lastCreatedTaskId.value = task.id
      loaded.value = false
      return task
    }
    finally {
      saving.value = false
    }
  }

  async function updateTask(id: string, payload: TaskPayload | TaskStatusPayload) {
    saving.value = true

    try {
      const updatedTask = await $fetch<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: payload,
      })
      const index = tasks.value.findIndex(task => task.id === id)

      if (index !== -1) {
        tasks.value[index] = updatedTask
      }

      loaded.value = false
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
      loaded.value = false
    }
    finally {
      deletingId.value = null
    }
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    sortBy.value = 'active_due_asc'
    currentPage.value = 1
  }

  function reset() {
    latestRequest++
    tasks.value = []
    stats.value = emptyStats()
    loading.value = false
    loaded.value = false
    error.value = null
    total.value = 0
    totalPages.value = 1
    lastCreatedTaskId.value = null
    lastLoadedQuery = ''
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
    currentPage,
    pageSize,
    total,
    totalPages,
    lastCreatedTaskId,
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
