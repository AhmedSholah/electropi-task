import { randomUUID } from 'node:crypto'
import type { Task, TaskPayload } from '#shared/types/task'
import { DEMO_USER_ID } from './userRepository'

interface StoredTask extends Task {
  ownerId: string
}

function relativeDate(daysFromToday: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

const now = new Date().toISOString()

const tasks: StoredTask[] = [
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Update Documentation',
    description: 'Review and update API endpoints documentation for the v2 release cycle. Ensure all new parameters are covered.',
    status: 'in_progress',
    dueDate: relativeDate(1),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Client Onboarding',
    description: 'Prepare initial configuration and welcome packet for Acme Corp. Schedule the kickoff call.',
    status: 'pending',
    dueDate: relativeDate(2),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Fix Login Bug',
    description: 'Investigate and patch the OAuth timeout issue reported on the mobile staging environment.',
    status: 'pending',
    dueDate: relativeDate(-1),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Publish Release Notes',
    description: 'Summarize the improvements included in the upcoming product release.',
    status: 'done',
    dueDate: relativeDate(5),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Review Analytics',
    description: 'Review the weekly product analytics and share key findings with the team.',
    status: 'in_progress',
    dueDate: relativeDate(4),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    ownerId: DEMO_USER_ID,
    title: 'Archive Sprint Board',
    description: 'Close completed tickets and archive the previous sprint board.',
    status: 'done',
    dueDate: relativeDate(3),
    createdAt: now,
    updatedAt: now,
  },
]

function withoutOwner(task: StoredTask): Task {
  const { ownerId: _ownerId, ...publicTask } = task
  return publicTask
}

export function listTasks(ownerId: string) {
  return tasks
    .filter(task => task.ownerId === ownerId)
    .map(withoutOwner)
}

export function findTask(ownerId: string, id: string) {
  const task = tasks.find(task => task.ownerId === ownerId && task.id === id)
  return task ? withoutOwner(task) : null
}

export function createTask(ownerId: string, payload: TaskPayload) {
  const timestamp = new Date().toISOString()
  const task: StoredTask = {
    id: randomUUID(),
    ownerId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: payload.status,
    dueDate: payload.dueDate,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  tasks.unshift(task)
  return withoutOwner(task)
}

export function updateTask(ownerId: string, id: string, payload: TaskPayload) {
  const task = tasks.find(task => task.ownerId === ownerId && task.id === id)

  if (!task) {
    return null
  }

  Object.assign(task, {
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: payload.status,
    dueDate: payload.dueDate,
    updatedAt: new Date().toISOString(),
  })

  return withoutOwner(task)
}

export function deleteTask(ownerId: string, id: string) {
  const index = tasks.findIndex(task => task.ownerId === ownerId && task.id === id)

  if (index === -1) {
    return false
  }

  tasks.splice(index, 1)
  return true
}
