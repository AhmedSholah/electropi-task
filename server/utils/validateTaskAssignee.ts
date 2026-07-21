import { createError } from 'h3'
import { findUserById } from './userRepository'

export async function validateTaskAssignee(ownerId: string, assigneeId: string | null) {
  if (!assigneeId) {
    return
  }

  if (assigneeId === ownerId) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Assign this task to another user, or leave it unassigned.',
    })
  }

  if (!await findUserById(assigneeId)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The selected assignee is no longer available.',
    })
  }
}
