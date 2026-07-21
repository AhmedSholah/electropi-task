import { defineEventHandler } from 'h3'
import { getOptionalUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  return { user: await getOptionalUser(event) }
})
