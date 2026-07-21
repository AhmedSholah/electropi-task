export function simulateDelay(milliseconds = 350) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}
