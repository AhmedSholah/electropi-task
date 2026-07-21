export interface TourRectangle {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

interface TourViewport {
  width: number
  height: number
}

interface TourPanelSize {
  width: number
  height: number
}

export interface TourPanelPosition {
  top: number
  left: number
  placement: 'above' | 'below'
}

export type OnboardingTaskField = 'title' | 'description' | 'status' | 'dueDate' | 'assigneeId'

export interface OnboardingTaskFieldDetail {
  field: OnboardingTaskField
  value: string | null
}

export const ONBOARDING_TASK_FIELD_EVENT = 'taskflow:onboarding-task-field'
export const ONBOARDING_FIRST_ASSIGNEE = '__first_available_assignee__'

export const ONBOARDING_TASK_CONTENT = {
  title: 'Plan the product launch',
  description: 'Prepare the launch checklist, confirm owners, and share the final timeline with the team.',
  status: 'in_progress',
} as const

export const ONBOARDING_EDITED_TASK_CONTENT = {
  title: 'Finalize the product launch plan',
} as const

export function getOnboardingTaskDueDate(date = new Date(), daysFromNow = 1) {
  const dueDate = new Date(date)
  dueDate.setDate(dueDate.getDate() + daysFromNow)

  const year = dueDate.getFullYear()
  const month = String(dueDate.getMonth() + 1).padStart(2, '0')
  const day = String(dueDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTourTargetScrollTop(
  targetViewportTop: number,
  currentScrollTop: number,
  topOffset = 88,
) {
  return Math.max(currentScrollTop + targetViewportTop - topOffset, 0)
}

export function getTourPanelPosition(
  target: TourRectangle,
  viewport: TourViewport,
  panel: TourPanelSize,
  gap = 18,
  margin = 16,
): TourPanelPosition {
  const maximumLeft = Math.max(margin, viewport.width - panel.width - margin)
  const left = Math.min(
    Math.max(target.left + target.width / 2 - panel.width / 2, margin),
    maximumLeft,
  )
  const spaceBelow = viewport.height - target.bottom - margin
  const spaceAbove = target.top - margin
  const placement = spaceBelow >= panel.height + gap || spaceBelow >= spaceAbove
    ? 'below'
    : 'above'
  const preferredTop = placement === 'below'
    ? target.bottom + gap
    : target.top - panel.height - gap
  const maximumTop = Math.max(margin, viewport.height - panel.height - margin)

  return {
    top: Math.min(Math.max(preferredTop, margin), maximumTop),
    left,
    placement,
  }
}
