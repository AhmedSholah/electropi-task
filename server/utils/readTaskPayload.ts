import { createError, readBody, type H3Event } from 'h3'
import type { TaskPayload } from '#shared/types/task'
import { validateTask } from '#shared/utils/taskValidation'

export async function readTaskPayload(event: H3Event) {
  const body = await readBody<Partial<TaskPayload>>(event)
  const payload = {
    ...body,
    assigneeId: typeof body.assigneeId === 'string'
      ? body.assigneeId.trim() || null
      : body.assigneeId ?? null,
  }
  const result = validateTask(payload)

  if (!result.valid) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Please correct the highlighted task fields.',
      data: { errors: result.errors },
    })
  }

  return payload as TaskPayload
}
