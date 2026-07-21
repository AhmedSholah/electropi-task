export function formatTaskTimestamp(timestamp: string) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatRelativeTime(timestamp: string, now = Date.now()) {
  const timestampValue = new Date(timestamp).getTime()

  if (Number.isNaN(timestampValue)) {
    return 'Unknown'
  }

  const difference = timestampValue - now
  const absoluteDifference = Math.abs(difference)

  if (absoluteDifference < 45_000) {
    return 'Just now'
  }

  const units = [
    { unit: 'year', milliseconds: 31_536_000_000 },
    { unit: 'month', milliseconds: 2_592_000_000 },
    { unit: 'week', milliseconds: 604_800_000 },
    { unit: 'day', milliseconds: 86_400_000 },
    { unit: 'hour', milliseconds: 3_600_000 },
    { unit: 'minute', milliseconds: 60_000 },
  ] as const
  const selectedUnit = units.find(({ milliseconds }) => absoluteDifference >= milliseconds) ?? units.at(-1)!
  const value = Math.round(difference / selectedUnit.milliseconds)

  return new Intl.RelativeTimeFormat('en', { numeric: 'always' }).format(value, selectedUnit.unit)
}
