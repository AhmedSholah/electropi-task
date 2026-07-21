<script setup lang="ts">
import type { CSSProperties } from 'vue'
import {
  getOnboardingTaskDueDate,
  getTourPanelPosition,
  getTourTargetScrollTop,
  ONBOARDING_EDITED_TASK_CONTENT,
  ONBOARDING_FIRST_ASSIGNEE,
  ONBOARDING_TASK_CONTENT,
  ONBOARDING_TASK_FIELD_EVENT,
  type OnboardingTaskField,
  type OnboardingTaskFieldDetail,
} from '~/utils/onboardingTour'

const props = defineProps<{
  userName: string
}>()

const emit = defineEmits<{
  complete: []
  skip: []
}>()

interface TourStep {
  eyebrow: string
  title: string
  description: string
  icon: string
  target?: string
  action?: 'open-form' | 'fill-title' | 'fill-description' | 'set-status' | 'set-due-date' | 'set-assignee' | 'submit-task' | 'open-edit' | 'edit-title' | 'submit-edit'
  nextLabel?: string
  busyLabel?: string
}

const firstName = computed(() => props.userName.trim().split(/\s+/)[0] || 'there')
const taskStore = useTaskStore()
const { lastCreatedTaskId } = storeToRefs(taskStore)
const createdTaskId = ref<string | null>(null)
const createdTaskCardTarget = computed(() => createdTaskId.value
  ? `[data-tour-task-id="${createdTaskId.value}"]`
  : undefined)
const createdTaskEditTarget = computed(() => createdTaskId.value
  ? `[data-tour-task-edit-id="${createdTaskId.value}"]`
  : undefined)
const steps = computed<TourStep[]>(() => [
  {
    eyebrow: 'Your workspace is ready',
    title: `Welcome to TaskFlow, ${firstName.value}!`,
    description: 'Let’s take a quick look around so you can organize your work with confidence from day one.',
    icon: 'lucide:sparkles',
  },
  {
    eyebrow: 'Stay on top of your work',
    title: 'See progress at a glance',
    description: 'Your live summary shows how many tasks are pending, in progress, and complete—without opening every task.',
    icon: 'lucide:chart-no-axes-combined',
    target: '[data-tour="task-summary"]',
  },
  {
    eyebrow: 'Find anything quickly',
    title: 'Search, filter, and prioritize',
    description: 'Use these controls to search by title, focus on a status, or sort tasks by the deadline that matters most.',
    icon: 'lucide:list-filter',
    target: '[data-tour="task-filters"]',
  },
  {
    eyebrow: 'Build one together',
    title: 'Let’s create a real task',
    description: 'We’ll open the task form and complete every field together. The finished task will be saved to your dashboard.',
    icon: 'lucide:circle-plus',
    target: '[data-tour="create-task"]',
    action: 'open-form',
    nextLabel: 'Open form',
    busyLabel: 'Opening…',
  },
  {
    eyebrow: 'Start with the outcome',
    title: 'Give the task a clear title',
    description: 'A short, action-focused title makes the work easy to scan. We’ll add an example for you now.',
    icon: 'lucide:text-cursor-input',
    target: '[data-tour="task-title"]',
    action: 'fill-title',
    nextLabel: 'Type title',
    busyLabel: 'Typing…',
  },
  {
    eyebrow: 'Add useful context',
    title: 'Describe what needs to happen',
    description: 'Descriptions capture the expected outcome and important context so the task is actionable.',
    icon: 'lucide:align-left',
    target: '[data-tour="task-description"]',
    action: 'fill-description',
    nextLabel: 'Add description',
    busyLabel: 'Typing…',
  },
  {
    eyebrow: 'Show current progress',
    title: 'Choose the task status',
    description: 'Use In Progress for work that has started. You can switch between Pending, In Progress, and Done at any time.',
    icon: 'lucide:circle-dot-dashed',
    target: '[data-tour="task-status"]',
    action: 'set-status',
    nextLabel: 'Set status',
    busyLabel: 'Updating…',
  },
  {
    eyebrow: 'Make the deadline visible',
    title: 'Set a future due date',
    description: 'Due dates help TaskFlow prioritize active work and flag anything that needs attention.',
    icon: 'lucide:calendar-days',
    target: '[data-tour="task-due-date"]',
    action: 'set-due-date',
    nextLabel: 'Set due date',
    busyLabel: 'Choosing…',
  },
  {
    eyebrow: 'Share responsibility',
    title: 'Assign the task',
    description: 'An assignee can see the task and update its status, while you keep control of all other details.',
    icon: 'lucide:user-round-plus',
    target: '[data-tour="task-assignee"]',
    action: 'set-assignee',
    nextLabel: 'Add assignee',
    busyLabel: 'Assigning…',
  },
  {
    eyebrow: 'Everything looks ready',
    title: 'Save your new task',
    description: 'This uses the real task form and validation. Once it’s saved, we’ll return to your dashboard automatically.',
    icon: 'lucide:save',
    target: '[data-tour="task-submit"]',
    action: 'submit-task',
    nextLabel: 'Create task',
    busyLabel: 'Creating…',
  },
  {
    eyebrow: 'Your workflow is live',
    title: 'Here’s the task you just created',
    description: 'This exact card represents the task you just added. Next, we’ll show you where to open it for editing.',
    icon: 'lucide:circle-check-big',
    target: createdTaskCardTarget.value,
  },
  {
    eyebrow: 'Open the task details',
    title: 'Use View & edit to make changes',
    description: 'This control opens the complete task, where owners can update its title, description, status, due date, and assignment.',
    icon: 'lucide:external-link',
    target: createdTaskEditTarget.value,
    action: 'open-edit',
    nextLabel: 'Edit this task',
    busyLabel: 'Opening…',
  },
  {
    eyebrow: 'Plans can change',
    title: 'Update any task detail',
    description: 'The same fields are available whenever you reopen a task. We’ll refine the title so the next action is even clearer.',
    icon: 'lucide:pencil-line',
    target: '[data-tour="task-title"]',
    action: 'edit-title',
    nextLabel: 'Edit title',
    busyLabel: 'Editing…',
  },
  {
    eyebrow: 'Keep everyone aligned',
    title: 'Save your changes',
    description: 'Updating uses the same validation as creation. Save the edited task and we’ll take you back to its card.',
    icon: 'lucide:save',
    target: '[data-tour="task-submit"]',
    action: 'submit-edit',
    nextLabel: 'Update task',
    busyLabel: 'Updating…',
  },
  {
    eyebrow: 'Create, edit, done',
    title: 'This is your updated task',
    description: 'The card now reflects the title you just edited. You can reopen it any time to update details, progress, assignment, or deadlines.',
    icon: 'lucide:badge-check',
    target: createdTaskCardTarget.value,
    nextLabel: 'Finish tour',
  },
])

const currentStepIndex = ref(0)
const panelElement = ref<HTMLElement | null>(null)
const targetRectangle = ref<DOMRect | null>(null)
const isBusy = ref(false)
const actionError = ref('')
const activeStep = computed(() => steps.value[currentStepIndex.value]!)
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1)
const canGoBack = computed(() => currentStepIndex.value > 0 && currentStepIndex.value <= 3)
const progress = computed(() => ((currentStepIndex.value + 1) / steps.value.length) * 100)
const forwardLabel = computed(() => isBusy.value
  ? activeStep.value.busyLabel ?? 'Working…'
  : activeStep.value.nextLabel ?? (isLastStep.value ? 'Finish tour' : 'Next'))
const blockedScrollKeys = new Set(['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '])
const scrollLockClass = 'onboarding-tour-scroll-locked'
let scrollLockActive = false
let layoutFrame: number | undefined
let tourDisposed = false
const nonPassiveEventOptions: AddEventListenerOptions = { passive: false }

const spotlightStyle = computed<CSSProperties>(() => {
  const rectangle = targetRectangle.value

  if (!rectangle) {
    return {}
  }

  const padding = 8

  return {
    top: `${Math.max(rectangle.top - padding, 8)}px`,
    left: `${Math.max(rectangle.left - padding, 8)}px`,
    width: `${Math.min(rectangle.width + padding * 2, window.innerWidth - 16)}px`,
    height: `${Math.min(rectangle.height + padding * 2, window.innerHeight - 16)}px`,
  }
})

const panelStyle = computed<CSSProperties>(() => {
  if (!targetRectangle.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const panelWidth = Math.min(352, window.innerWidth - 32)
  const position = getTourPanelPosition(
    targetRectangle.value,
    { width: window.innerWidth, height: window.innerHeight },
    { width: panelWidth, height: panelElement.value?.offsetHeight ?? 270 },
  )

  return {
    top: `${position.top}px`,
    left: `${position.left}px`,
  }
})

function measureTarget() {
  if (!activeStep.value.target) {
    targetRectangle.value = null
    return
  }

  const target = findStepTarget(activeStep.value)
  targetRectangle.value = target?.getBoundingClientRect() ?? null
}

function findStepTarget(step: TourStep) {
  if (!step.target) {
    return null
  }

  return document.querySelector<HTMLElement>(step.target)
}

function scheduleLayoutUpdate() {
  if (layoutFrame !== undefined) {
    cancelAnimationFrame(layoutFrame)
  }

  layoutFrame = requestAnimationFrame(() => {
    measureTarget()
    layoutFrame = undefined
  })
}

async function prepareStep() {
  const preparedStepIndex = currentStepIndex.value
  await nextTick()
  const step = activeStep.value
  const target = step.target ? await waitForTarget(step, preparedStepIndex) : null

  if (tourDisposed || preparedStepIndex !== currentStepIndex.value) {
    return
  }

  if (target) {
    const targetScrollTop = getTourTargetScrollTop(
      target.getBoundingClientRect().top,
      window.scrollY,
    )
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: targetScrollTop,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  scheduleLayoutUpdate()

  requestAnimationFrame(() => {
    measureTarget()
    panelElement.value?.focus({ preventScroll: true })
  })
}

async function waitForTarget(step: TourStep, stepIndex: number, timeout = 6000) {
  const deadline = Date.now() + timeout

  while (!tourDisposed && stepIndex === currentStepIndex.value && Date.now() < deadline) {
    const target = findStepTarget(step)

    if (target) {
      return target
    }

    await wait(50)
  }

  return findStepTarget(step)
}

function goBack() {
  if (canGoBack.value) {
    actionError.value = ''
    currentStepIndex.value--
  }
}

function wait(milliseconds: number) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

function setTaskField(field: OnboardingTaskField, value: string | null) {
  window.dispatchEvent(new CustomEvent<OnboardingTaskFieldDetail>(
    ONBOARDING_TASK_FIELD_EVENT,
    { detail: { field, value } },
  ))
}

async function typeTaskField(
  field: Extract<OnboardingTaskField, 'title' | 'description'>,
  value: string,
) {
  const selector = `[data-tour="task-${field}"]`
  document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true })
  setTaskField(field, '')

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    setTaskField(field, value)
    return
  }

  const characterDelay = field === 'title' ? 24 : 10

  for (let characterIndex = 1; characterIndex <= value.length; characterIndex++) {
    setTaskField(field, value.slice(0, characterIndex))
    await wait(characterDelay)
  }
}

async function waitForPath(path: string, timeout: number, errorMessage: string) {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    if (window.location.pathname === path) {
      await nextTick()
      return
    }

    await wait(100)
  }

  throw new Error(errorMessage)
}

async function runStepAction() {
  switch (activeStep.value.action) {
    case 'open-form':
      targetRectangle.value = null
      await navigateTo('/tasks/new')
      await waitForPath('/tasks/new', 6000, 'The task form could not be opened. Please try again.')
      break
    case 'fill-title':
      await typeTaskField('title', ONBOARDING_TASK_CONTENT.title)
      break
    case 'fill-description':
      await typeTaskField('description', ONBOARDING_TASK_CONTENT.description)
      break
    case 'set-status':
      setTaskField('status', ONBOARDING_TASK_CONTENT.status)
      await wait(350)
      break
    case 'set-due-date':
      setTaskField('dueDate', getOnboardingTaskDueDate())
      await wait(350)
      break
    case 'set-assignee':
      setTaskField('assigneeId', ONBOARDING_FIRST_ASSIGNEE)
      await wait(350)
      break
    case 'submit-task': {
      const form = document.querySelector<HTMLFormElement>('[data-tour="task-form"] form')

      if (!form) {
        throw new Error('The task form is not ready yet. Please try again.')
      }

      lastCreatedTaskId.value = null
      form.requestSubmit()
      await waitForPath('/', 12000, 'The task could not be saved. Check the form message and try again.')

      if (!lastCreatedTaskId.value) {
        throw new Error('The new task could not be identified. Please try this step again.')
      }

      createdTaskId.value = lastCreatedTaskId.value
      break
    }
    case 'open-edit': {
      if (!createdTaskId.value) {
        throw new Error('The new task could not be identified. Please create it again.')
      }

      const editPath = `/tasks/${encodeURIComponent(createdTaskId.value)}`
      targetRectangle.value = null
      await navigateTo(editPath)
      await waitForPath(editPath, 6000, 'The task editor could not be opened. Please try again.')
      break
    }
    case 'edit-title':
      await typeTaskField('title', ONBOARDING_EDITED_TASK_CONTENT.title)
      break
    case 'submit-edit': {
      const form = document.querySelector<HTMLFormElement>('[data-tour="task-form"] form')

      if (!form) {
        throw new Error('The task editor is not ready yet. Please try again.')
      }

      form.requestSubmit()
      await waitForPath('/', 12000, 'The task changes could not be saved. Check the form message and try again.')
      break
    }
  }
}

async function goForward() {
  if (isBusy.value) {
    return
  }

  if (isLastStep.value) {
    closeTour('complete')
    return
  }

  actionError.value = ''
  isBusy.value = true

  try {
    await runStepAction()
    currentStepIndex.value++
  }
  catch (caughtError) {
    actionError.value = caughtError instanceof Error
      ? caughtError.message
      : 'Something interrupted this step. Please try again.'
  }
  finally {
    isBusy.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !isBusy.value) {
    closeTour('skip')
    return
  }

  if (blockedScrollKeys.has(event.key)) {
    event.preventDefault()
    return
  }

  if (event.key !== 'Tab' || !panelElement.value) {
    return
  }

  const focusableElements = Array.from(panelElement.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ))
  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements.at(-1)

  if (!firstFocusableElement || !lastFocusableElement) {
    event.preventDefault()
    panelElement.value.focus()
    return
  }

  if (event.shiftKey && (document.activeElement === firstFocusableElement || document.activeElement === panelElement.value)) {
    event.preventDefault()
    lastFocusableElement.focus()
  }
  else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
    event.preventDefault()
    firstFocusableElement.focus()
  }
}

function preventManualScroll(event: Event) {
  event.preventDefault()
}

function lockScrolling() {
  if (scrollLockActive) {
    return
  }

  document.documentElement.classList.add(scrollLockClass)
  window.addEventListener('wheel', preventManualScroll, nonPassiveEventOptions)
  window.addEventListener('touchmove', preventManualScroll, nonPassiveEventOptions)
  scrollLockActive = true
}

function unlockScrolling() {
  document.documentElement.classList.remove(scrollLockClass)

  if (!scrollLockActive) {
    return
  }

  window.removeEventListener('wheel', preventManualScroll, false)
  window.removeEventListener('touchmove', preventManualScroll, false)
  scrollLockActive = false
}

function closeTour(reason: 'complete' | 'skip') {
  unlockScrolling()

  if (reason === 'complete') {
    emit('complete')
  }
  else {
    emit('skip')
  }
}

watch(currentStepIndex, prepareStep)

onMounted(() => {
  lockScrolling()
  window.addEventListener('resize', scheduleLayoutUpdate)
  window.addEventListener('scroll', scheduleLayoutUpdate, true)
  document.addEventListener('keydown', handleKeydown)
  void prepareStep()
})

onBeforeUnmount(() => {
  tourDisposed = true
  unlockScrolling()
  window.removeEventListener('resize', scheduleLayoutUpdate)
  window.removeEventListener('scroll', scheduleLayoutUpdate, true)
  document.removeEventListener('keydown', handleKeydown)

  if (layoutFrame !== undefined) {
    cancelAnimationFrame(layoutFrame)
  }

  document.querySelector<HTMLElement>('[data-tour="create-task"]')?.focus({ preventScroll: true })
})
</script>

<template>
  <Teleport to="body">
    <Transition name="tour-fade" appear>
      <div class="fixed inset-0 z-100" data-testid="onboarding-tour">
        <div
          v-if="targetRectangle"
          data-testid="onboarding-tour-spotlight"
          class="pointer-events-none fixed rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgb(15_23_42/0.72),0_0_0_6px_rgb(99_102_241/0.32),0_18px_55px_rgb(15_23_42/0.25)] transition-all duration-300"
          :style="spotlightStyle"
          aria-hidden="true"
        />
        <div v-else class="absolute inset-0 bg-slate-950/72 backdrop-blur-[2px]" aria-hidden="true" />

        <section
          ref="panelElement"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-tour-title"
          aria-describedby="onboarding-tour-description"
          tabindex="-1"
          class="fixed w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/35 outline-none transition-[top,left,transform] duration-300 motion-reduce:transition-none"
          :style="panelStyle"
        >
          <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 pb-5 pt-4 text-white">
            <div class="absolute -right-10 -top-16 size-40 rounded-full border border-white/15 bg-white/8" />
            <div class="absolute -bottom-16 right-12 size-28 rounded-full bg-violet-300/15 blur-sm" />

            <button
              type="button"
              :disabled="isBusy"
              class="absolute right-3.5 top-3.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-indigo-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Skip onboarding tour"
              @click="closeTour('skip')"
            >
              Skip
            </button>

            <div class="relative flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              <Icon :name="activeStep.icon" class="size-4.5" aria-hidden="true" />
            </div>
            <p class="relative mt-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">
              {{ activeStep.eyebrow }}
            </p>
            <h2 id="onboarding-tour-title" class="relative mt-1.5 pr-3 text-xl font-bold leading-tight tracking-tight text-balance">
              {{ activeStep.title }}
            </h2>
          </div>

          <div class="px-5 pb-4 pt-4">
            <p id="onboarding-tour-description" class="text-sm leading-5 text-slate-600">
              {{ activeStep.description }}
            </p>

            <div v-if="actionError" class="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs leading-4.5 text-rose-700 ring-1 ring-inset ring-rose-100" role="alert">
              <Icon name="lucide:circle-alert" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{{ actionError }}</span>
            </div>

            <div class="mt-4" aria-hidden="true">
              <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>QUICK TOUR</span>
                <span>{{ currentStepIndex + 1 }} / {{ steps.length }}</span>
              </div>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
              <UButton
                v-if="canGoBack"
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-left"
                label="Back"
                size="sm"
                :disabled="isBusy"
                @click="goBack"
              />
              <span v-else class="text-[11px] text-slate-400">
                {{ currentStepIndex === 0 ? 'Press Esc to skip' : isLastStep ? 'Task created and updated' : 'Guided task setup' }}
              </span>

              <UButton
                type="button"
                :label="forwardLabel"
                :icon="isLastStep ? 'i-lucide-check' : undefined"
                :trailing-icon="isLastStep ? undefined : 'i-lucide-arrow-right'"
                size="sm"
                :loading="isBusy"
                @click="goForward"
              />
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 180ms ease;
}

.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .tour-fade-enter-active,
  .tour-fade-leave-active {
    transition: none;
  }
}
</style>
