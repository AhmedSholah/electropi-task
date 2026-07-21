<script setup lang="ts">
import { useForm } from "vee-validate";
import { isNavigationFailure } from "vue-router";
import type { LoginPayload } from "#shared/types/auth";

definePageMeta({ layout: "auth" });
useSeoMeta({ title: "Sign in · TaskFlow" });

const route = useRoute();
const authStore = useAuthStore();
const { error } = storeToRefs(authStore);
const submitting = ref(false);

const { defineField, errors, handleSubmit, resetForm } = useForm<LoginPayload>({
  initialValues: { email: "", password: "" },
  validationSchema: {
    email: (value: unknown) =>
      /^\S+@\S+\.\S+$/.test(String(value ?? "").trim()) ||
      "Enter a valid email address.",
    password: (value: unknown) => Boolean(value) || "Password is required.",
  },
});

const fieldOptions = { validateOnModelUpdate: false };
const [email, emailProps] = defineField("email", fieldOptions);
const [password, passwordProps] = defineField("password", fieldOptions);

onBeforeUnmount(() => authStore.clearError());

function useDemoAccount() {
  resetForm({
    values: {
      email: "demo@taskflow.dev",
      password: "password123",
    },
  });
  authStore.clearError();
}

const onSubmit = handleSubmit(async (values) => {
  submitting.value = true;

  try {
    await authStore.login(values);
    const requestedRedirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";
    const safeRedirect =
      requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
        ? requestedRedirect
        : "/";
    const navigationResult = await navigateTo(safeRedirect);

    if (navigationResult === false || isNavigationFailure(navigationResult)) {
      submitting.value = false;
    }
  } catch {
    submitting.value = false;
    // The store exposes a user-friendly API error above the form.
  }
});
</script>

<template>
  <div>
    <div class="mb-7 text-center">
      <AppLogo light />
      <h1 class="mt-7 text-3xl font-bold tracking-tight text-white">
        Welcome back
      </h1>
      <p class="mt-2 text-sm text-slate-400">
        Sign in to continue to your task workspace.
      </p>
    </div>

    <UCard :ui="{ body: 'p-6 sm:p-8' }" class="shadow-2xl shadow-black/30">
      <form novalidate @submit="onSubmit">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="error"
          class="mb-5"
        />

        <div class="space-y-5">
          <UFormField
            name="email"
            label="Email address"
            required
            :error="errors.email"
          >
            <UInput
              v-model="email"
              v-bind="emailProps"
              name="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              leading-icon="i-lucide-mail"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="password"
            label="Password"
            required
            :error="errors.password"
          >
            <UInput
              v-model="password"
              v-bind="passwordProps"
              name="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              leading-icon="i-lucide-lock-keyhole"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <UButton
          type="submit"
          block
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          :loading="submitting"
          :label="submitting ? 'Signing in…' : 'Sign in'"
          class="mt-6"
        />

        <USeparator label="Demo access" class="my-6" />

        <UButton
          type="button"
          color="primary"
          variant="soft"
          block
          icon="i-lucide-sparkles"
          class="justify-start text-left"
          @click="useDemoAccount"
        >
          <span>
            <span class="block text-xs font-bold">Use the demo account</span>
            <span class="mt-0.5 block text-xs opacity-75"
              >demo@taskflow.dev · password123</span
            >
          </span>
        </UButton>

        <p class="mt-6 text-center text-sm text-muted">
          New to TaskFlow?
          <ULink to="/register" class="font-semibold text-primary"
            >Create an account</ULink
          >
        </p>
      </form>
    </UCard>

    <p class="mt-6 text-center text-xs text-slate-500">
      In-memory demo · Data resets when the server restarts
    </p>
  </div>
</template>
