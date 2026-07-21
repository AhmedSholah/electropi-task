export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      success: 'emerald',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate',
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'hover:bg-primary-600 active:bg-primary-700',
        },
        {
          color: 'secondary',
          variant: 'solid',
          class: 'hover:bg-secondary-600 active:bg-secondary-700',
        },
        {
          color: 'success',
          variant: 'solid',
          class: 'hover:bg-success-600 active:bg-success-700',
        },
        {
          color: 'info',
          variant: 'solid',
          class: 'hover:bg-info-600 active:bg-info-700',
        },
        {
          color: 'warning',
          variant: 'solid',
          class: 'hover:bg-warning-600 active:bg-warning-700',
        },
        {
          color: 'error',
          variant: 'solid',
          class: 'hover:bg-error-600 active:bg-error-700',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'hover:bg-neutral-950 active:bg-black',
        },
      ],
    },
  },
})
