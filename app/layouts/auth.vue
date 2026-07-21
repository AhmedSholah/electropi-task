<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
    <div class="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,#64748b_1px,transparent_0)] [background-size:24px_24px]" />
    <div class="absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
    <div class="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </main>
</template>
