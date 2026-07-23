# Algorithmics Script Manager

A compact web app for managing teams, scenes, and presentation flow for the Algorithmics IT Competition.

## Features
- Team and scene management
- Search and filtering
- Presentation mode with timer
- Local storage persistence

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase setup for online storage
1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/20260721000000_create_competition_event.sql`.

The migration creates the `competition_event` table, enables row-level security, and adds the policies required by the browser client.

The stored row has this shape:
```sql
create table if not exists public.competition_event (
  id text primary key,
  event jsonb not null,
  settings jsonb not null,
  updated_at timestamptz not null default now()
);
```
3. Create a file named .env.local in the project root and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```
4. Restart the development server.

When the environment variables are present, the app will sync data to Supabase automatically. Without them, it will continue using local storage.
