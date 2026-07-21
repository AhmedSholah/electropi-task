import { defineEventHandler } from 'h3'
import { getOptionalUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  return { user: getOptionalUser(event) }
})
