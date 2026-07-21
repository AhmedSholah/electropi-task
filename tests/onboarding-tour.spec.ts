import { describe, expect, it } from 'vitest'
import { getOnboardingTaskDueDate, getTourPanelPosition, getTourTargetScrollTop } from '../app/utils/onboardingTour'

describe('onboarding tour positioning', () => {
  it('places the panel below a target when enough space is available', () => {
    expect(getTourPanelPosition(
      { top: 100, right: 500, bottom: 180, left: 300, width: 200, height: 80 },
      { width: 1000, height: 800 },
      { width: 400, height: 280 },
    )).toEqual({ top: 198, left: 200, placement: 'below' })
  })

  it('places the panel above a target near the bottom of the viewport', () => {
    expect(getTourPanelPosition(
      { top: 650, right: 700, bottom: 710, left: 500, width: 200, height: 60 },
      { width: 1000, height: 800 },
      { width: 400, height: 280 },
    )).toEqual({ top: 352, left: 400, placement: 'above' })
  })

  it('keeps the panel inside narrow viewport margins', () => {
    const position = getTourPanelPosition(
      { top: 80, right: 60, bottom: 120, left: 20, width: 40, height: 40 },
      { width: 360, height: 700 },
      { width: 328, height: 300 },
    )

    expect(position.left).toBe(16)
    expect(position.top).toBe(138)
  })

  it('scrolls the highlighted target just below the sticky header', () => {
    expect(getTourTargetScrollTop(420, 300)).toBe(632)
  })

  it('does not calculate a negative scroll position near the page top', () => {
    expect(getTourTargetScrollTop(40, 0)).toBe(0)
  })

  it('puts the guided task first under the default nearest-due sort', () => {
    expect(getOnboardingTaskDueDate(new Date(2026, 6, 21))).toBe('2026-07-22')
  })
})
