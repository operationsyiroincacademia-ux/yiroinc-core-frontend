# YiroInc Academia Portal

Frontend for the YiroInc Academia service-management portal. It consumes the
existing WordPress REST API (`/wp-json/yac/v1`) with JWT Bearer authentication
and provides role-based experiences for Academic Users, Exam Candidates and
Corporate Users.

## Stack

- React 19 + TypeScript
- TanStack Start (TanStack Router + TanStack Query)
- Vite 8
- Tailwind CSS v4
- Deployed to Cloudflare (Nitro `cloudflare-module` preset)

## Requirements

- Node.js 20+
- npm

## Getting started

```sh
npm install
cp .env.example .env   # then set VITE_API_BASE_URL
npm run dev
```

The dev server runs on http://localhost:8080.

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Production build                     |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the project                     |
| `npm run format`  | Format with Prettier                 |

## Environment variables

| Variable            | Required | Description                                                                |
| ------------------- | -------- | -------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL of the WordPress REST API, e.g. `https://example.com/wp-json/yac/v1` |

Only `VITE_`-prefixed variables are exposed to the client. No secrets are used
by the frontend; authentication relies on a JWT obtained at runtime.

## Deployment (Cloudflare)

`npm run build` produces a Cloudflare-module Worker bundle under `dist/`
(`dist/client` for static assets and `dist/server` for the SSR worker).
Set `VITE_API_BASE_URL` as a build-time environment variable in your Cloudflare
project settings.

## Project structure

```
src/
  app/         route guards
  assets/      static assets
  components/  shared + shadcn/ui components
  features/    per-domain API clients, hooks and formatters
  hooks/       generic hooks
  layouts/     app shell, sidebar, topbar
  lib/         api client, auth, roles, utilities
  pages/       page components grouped by experience
  routes/      thin TanStack Router route files
  styles.css   design tokens and Tailwind theme
```
