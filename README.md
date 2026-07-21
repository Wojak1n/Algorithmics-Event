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
2. In the SQL editor, create a table named competition_event with this schema:
```sql
create table if not exists public.competition_event (
  id text primary key,
  event jsonb not null,
  settings jsonb not null,
  updated_at timestamp with time zone default now()
);
```
3. Create a file named .env.local in the project root and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
4. Restart the development server.

When the environment variables are present, the app will sync data to Supabase automatically. Without them, it will continue using local storage.
