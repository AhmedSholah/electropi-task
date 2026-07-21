# TaskFlow

TaskFlow is a compact, full-stack task management app built for the Vue.js technical task. It covers every requested feature and adds a small session-based authentication layer so each user has a private task workspace.

## Features

- Register, sign in, and sign out with an HTTP-only session cookie
- User-scoped task API with create, read, update, and delete operations
- Task dashboard with live totals for pending, in-progress, and completed work
- Debounced server-side title search, status filtering, sorting, and paginated results
- Created and live relative last-updated timestamps on task cards and task details
- Nuxt UI calendar datepicker with past-date prevention for task due dates
- Reusable create/edit form powered by VeeValidate and Nuxt UI fields
- Matching server-side validation for all task writes
- Responsive layout, loading skeletons, distinct empty states, retryable errors, and delete confirmation
- Focused Vitest coverage for validation, Pinia behavior, and persistent repositories

## Tech stack

- Nuxt 4 and Vue 3 Composition API (`<script setup lang="ts">`)
- TypeScript in strict mode
- Pinia with Nuxt SSR support
- Nuxt UI 4 with its Tailwind CSS 4 design system
- VeeValidate 4 for client-side form state and validation
- Nuxt server API routes with persistent Turso/libSQL repositories
- Vitest, Vue Test Utils, Nuxt Test Utils, and Happy DOM

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer (npm also works)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `.env` before running the database setup. The setup command applies pending migrations and idempotently creates the demo account and its sample tasks.

Use the included demo account to see seeded tasks:

```text
Email: demo@taskflow.dev
Password: password123
```

You can also register a new account. A new account starts with an empty task list.

## Available scripts

```bash
pnpm dev          # start the development server
pnpm build        # create a production build
pnpm preview      # preview the production build
pnpm db:migrate   # apply pending database migrations
pnpm db:seed      # seed the demo account when it is absent
pnpm db:setup     # migrate and seed in one command
pnpm test         # run tests once
pnpm test:watch   # run tests in watch mode
pnpm lint         # run ESLint
pnpm typecheck    # run Nuxt/Vue type checking
```

## Application routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in, including demo-account access |
| `/register` | Create an account |
| `/` | Protected task dashboard |
| `/tasks/new` | Protected task creation form |
| `/tasks/[id]` | Protected task details and editing |

## API routes

| Method and route | Purpose |
| --- | --- |
| `GET /api/auth/me` | Read the current session |
| `POST /api/auth/register` | Register and begin a session |
| `POST /api/auth/login` | Verify credentials and begin a session |
| `POST /api/auth/logout` | Revoke the current session |
| `GET /api/tasks` | List the current user's tasks with search, filtering, sorting, and pagination |
| `POST /api/tasks` | Create a task |
| `GET /api/tasks/:id` | Read one owned task |
| `PUT /api/tasks/:id` | Update one owned task |
| `DELETE /api/tasks/:id` | Delete one owned task |

All task endpoints return `401` without a valid session. Looking up another user's task returns `404`, so ownership details are not leaked.

## Architecture

```text
app/
├── assets/css/           Tailwind entry point and theme tokens
├── components/
│   └── tasks/            Nuxt UI task cards, filters, form, stats, and states
├── layouts/              App and authentication shells
├── middleware/           Global route protection
├── pages/                Nuxt file-based routes
├── stores/               Auth and task Pinia stores
└── utils/                Client display and error helpers
server/
├── api/auth/             Session endpoints
├── api/tasks/            Protected task CRUD endpoints
└── utils/                Turso repositories, database client, and auth helpers
database/
├── migrations/           Ordered libSQL schema migrations
├── migrate.ts            Migration runner with applied-migration tracking
└── seed.ts               Idempotent demo data seeding
scripts/                  Database command entry points
shared/
├── types/                Types shared by browser and server
└── utils/                Shared task validation
tests/                    Validation and Pinia behavior tests
```

The Pinia store owns server data, list query state, pagination metadata, and task statistics. Small visual state—such as whether a confirmation dialog is open—stays local to the component. List searches are debounced, and stale responses are ignored if a newer search has already completed.

`GET /api/tasks` accepts `search`, `status`, `sort`, `page`, and `pageSize` query parameters. Responses include the current page of tasks, filtered totals, page metadata, and unfiltered status counts for the dashboard summary.

## Validation rules

- Title is required and limited to 100 characters.
- Description is optional and limited to 500 characters.
- Status must be `pending`, `in_progress`, or `done`.
- Due date is required and must be later than today.
- Registration requires a valid email, a name of at least 2 characters, and a password of at least 8 characters.

VeeValidate manages client form state, touched fields, submission, and error messages around Nuxt UI controls. The task rules themselves are shared with the server handlers so both layers enforce the same constraints. The date field also receives tomorrow as its minimum selectable date.

## Authentication design

Passwords are salted and hashed with Node's built-in `scrypt`. A successful login creates a cryptographically random opaque token stored in an HTTP-only, `SameSite=Lax` cookie. Only a SHA-256 hash of that token is stored in Turso, and logout revokes the persisted session.

This is intentionally a compact authentication implementation. Production work would also add rate limiting, password reset and email verification flows, session rotation, audit logs, and CSRF controls appropriate to the deployment.

## Database and deployment

- Users, sessions, and tasks are persisted in Turso and survive Vercel function restarts and deployments.
- Artificial API delays make loading and mutation states visible during review.
- Search, filtering, sorting, and pagination remain in the repository layer so the client API is unchanged. They can be moved into SQL if the dataset grows.
- Tests use an isolated in-memory libSQL database and never access the configured Turso database.

For Vercel, add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to the project environment variables for Production, Preview, and Development as appropriate. Run `pnpm db:setup` once against each new database before deploying the application. Do not commit either credential.

## Suggested commit history

For a submitted repository, keep implementation history reviewable with commits such as:

```text
chore: configure Nuxt with Pinia and Tailwind
feat: add typed auth and task API routes
feat: build protected task dashboard
feat: add reusable task form and validation
feat: implement editing and deletion flows
test: cover task validation and filtering
docs: document setup and architecture
```
