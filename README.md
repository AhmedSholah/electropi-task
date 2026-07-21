# TaskFlow

TaskFlow is a full-stack task management mini app built for the Vue.js technical task. It uses Vue 3's Composition API through Nuxt, Pinia for client state, TypeScript throughout, Tailwind CSS through Nuxt UI, and a libSQL/Turso database behind Nuxt server API routes.

## Features

- View responsive task cards with title, description, status, due date, ownership, and assignment information.
- Create, edit, and delete tasks with confirmation and user-friendly success/error feedback.
- Validate required titles, field lengths, status values, assignees, and future due dates on both the client and server.
- Search tasks by title, filter by status, sort results, and paginate without stale requests overwriting newer searches.
- Display skeleton loading states, empty states, retryable API errors, submit progress, and delete progress.
- Open a dedicated task detail/edit route and a separate create-task route.
- Register, sign in, sign out, and keep authenticated sessions in secure HTTP-only cookies.
- Assign tasks to another user; assignees can view the task and update only its status.
- Persist users, sessions, tasks, and assignments in libSQL locally or Turso in production.
- Seed a ready-to-use demo account and sample data.

## Technical-task coverage

| Requirement | Implementation |
| --- | --- |
| Vue 3 Composition API | All Vue components use `<script setup>` and composables. |
| Task list and CRUD | Dashboard, create page, detail/edit page, server API routes, and delete dialog. |
| Title and future-date validation | Shared typed validation is reused by the form and server endpoints. |
| Status filter and title search | Debounced, server-side search/filtering with pagination and race protection. |
| Initial API data | Nuxt API routes load seeded data from libSQL/Turso. |
| Loading and error states | Skeletons, alerts, retry actions, empty states, and mutation progress indicators. |
| State management | Pinia task and authentication stores. |
| Tailwind CSS | Tailwind CSS v4 and Nuxt UI components with a custom theme. |
| Reusable components | Forms, filters, cards, stats, badges, dialogs, skeletons, and empty states are separated. |
| Routing | Nuxt file-based Vue Router pages for dashboard, creation, detail/edit, login, and registration. |
| Bonus: TypeScript | Strict TypeScript across the client, shared types, API, database, scripts, and tests. |
| Bonus: Nuxt | Nuxt 4 full-stack application with SSR and Nitro API routes. |
| Bonus: Vitest | 17 unit/repository tests across six test files. |

## Stack

- Nuxt 4 and Vue 3
- TypeScript
- Pinia
- Tailwind CSS 4 and Nuxt UI
- VeeValidate
- libSQL / Turso
- Vitest and Happy DOM
- ESLint

## Setup

### Prerequisites

- Node.js 22.19.x, 24.11.x, or 26+
- pnpm (enable it with `corepack enable` if needed)
- A [Turso](https://turso.tech/) database and authentication token

### Install and run

```bash
git clone https://github.com/AhmedSholah/electropi-task.git
cd electropi-task
pnpm install
cp .env.example .env
# Add your Turso URL and authentication token to .env
pnpm db:setup
pnpm dev
```

Open `http://localhost:3000`.

Before running the database setup, replace the placeholders in `.env` with your Turso database URL and authentication token. `pnpm db:setup` applies the migrations and adds the demo data to that database.

### Demo account

- Email: `demo@taskflow.dev`
- Password: `password123`

You can also register a new account. New accounts receive three starter tasks.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Create a production build. |
| `pnpm preview` | Preview the production build. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm typecheck` | Run Nuxt/Vue TypeScript checks. |
| `pnpm lint` | Run ESLint. |
| `pnpm db:setup` | Apply migrations and seed missing demo data. |
| `pnpm db:migrate` | Apply pending database migrations. |
| `pnpm db:seed` | Seed missing demo users and tasks. |
| `pnpm db:reset` | Drop app tables, rerun migrations, and reseed data. This deletes existing app data. |

## Project structure

```text
app/
  components/       Reusable UI and task components
  layouts/          Authenticated and public layouts
  middleware/       Authentication route guard
  pages/            Nuxt routes
  stores/           Pinia stores
  utils/            Client formatting/error helpers
database/
  migrations/       Versioned SQL schema changes
server/
  api/              Auth, user, and task endpoints
  utils/            Authentication and repositories
shared/
  types/            Shared TypeScript contracts
  utils/            Shared task validation
tests/               Vitest unit and repository tests
```

## Production

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the deployment environment, run `pnpm db:setup` against that database once, then build with:

```bash
pnpm build
```

The generated Node server starts with:

```bash
node .output/server/index.mjs
```
