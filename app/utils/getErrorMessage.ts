interface FetchErrorShape {
  data?: {
    message?: string
    statusMessage?: string
  }
  message?: string
  statusMessage?: string
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const fetchError = error as FetchErrorShape

  return fetchError.data?.message
    || fetchError.data?.statusMessage
    || fetchError.statusMessage
    || fetchError.message
    || fallback
}
