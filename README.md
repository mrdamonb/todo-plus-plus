# Todo++

A fast, beautiful todo app built with **React + Vite** and backed by **Supabase**. Tasks persist across sessions, stats are powered by real data, and the UI is designed to make getting things done feel good.

## Features

| Feature | Description |
|---|---|
| **Today / Daily Recap** | Progress ring showing tasks completed today vs. still open, with a yesterday delta and motivational message |
| **Quick Win Queue** | Tasks marked ⚡ surface in a dedicated view to build momentum at the start of your day |
| **Project Workspaces** | Separate spaces for Work, Personal, Health, or any custom category |
| **Focus Mode** | Click ▶ on any task to lock in with a full-screen session and a live timer |
| **Subtasks** | Expand any task to add and check off sub-items |
| **Priorities** | High / Medium / Low tags shown as color-coded chips |
| **Stats — Donut Chart** | Completed tasks broken down by workspace, with legend and most-active-space callout |
| **Satisfying check-offs** | Smooth completion animations on every task |
| **Supabase backend** | All tasks and workspaces stored in Postgres — data persists across devices and sessions |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/mrdamonb/todo-plus-plus.git
cd todo-plus-plus
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run the migration in `supabase/migrations/` (or copy the SQL from below) in the Supabase SQL editor.

Copy `.env.example` to `.env.local` and fill in your project values:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: **Supabase Dashboard → Project Settings → API**

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Database Schema

Two tables in `public`:

**`workspaces`**
| Column | Type | Notes |
|---|---|---|
| `id` | text | Primary key |
| `name` | text | Display name |
| `emoji` | text | Icon |
| `color` | text | Hex color for chips |
| `position` | integer | Sidebar sort order |
| `created_at` | timestamptz | Auto-set |

**`tasks`**
| Column | Type | Notes |
|---|---|---|
| `id` | text | Primary key |
| `title` | text | Task text |
| `completed` | boolean | Default false |
| `completed_at` | timestamptz | Set when completed, used for Daily Recap and Stats |
| `priority` | text | `'high'`, `'medium'`, `'low'`, or null |
| `workspace_id` | text | FK → workspaces |
| `is_quick_win` | boolean | Appears in Quick Win Queue |
| `subtasks` | jsonb | Array of `{ id, title, completed }` |
| `created_at` | timestamptz | Auto-set |

## Row Level Security

Both tables have RLS **enabled**. The current policies allow full read/write access for the `anon` role, which is appropriate for a single-user dev setup with no authentication.

> **Before adding multiple users or making this public:** replace the permissive `anon` policies with user-scoped policies tied to `auth.uid()`. The Supabase [Auth docs](https://supabase.com/docs/guides/auth) cover this well.

## Usage Tips

- **Add a task** — type in the input and press Enter; click into it to set priority, space, and ⚡ Quick Win
- **Edit a task** — double-click the title to rename inline
- **Expand a task** — click ▾ to reveal subtasks, priority controls, and Quick Win toggle
- **Focus Mode** — click ▶ on any task to start a focused session with a live timer
- **Add a workspace** — click "+ New Space" in the sidebar; pick an emoji and a name
- **Remove a workspace** — hover the workspace in the sidebar and click ×
- **Today view** — shows a progress ring, completed tasks, still-open tasks, and a comparison to yesterday

## Tech Stack

| | |
|---|---|
| **Framework** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Database** | [Supabase](https://supabase.com/) (Postgres) |
| **Styling** | Hand-crafted CSS with custom properties — no CSS framework |
| **Charts** | Pure SVG (no charting library) |
| **Auth** | None yet — planned for a future release |

## Project Structure

```
src/
  App.jsx                 # Root component — state, Supabase mutations, layout
  App.css                 # Global design system and all styles
  lib/
    supabase.js           # Supabase client singleton
  components/
    Sidebar.jsx           # Workspace nav, view switcher, Today badge
    TaskInput.jsx         # Add-task form with options panel
    TaskItem.jsx          # Individual task — checkbox, chips, expand, focus
    FocusMode.jsx         # Full-screen focus overlay with timer
    RecapView.jsx         # Today / Daily Recap — progress ring + task lists
    StatsView.jsx         # Stats page — SVG donut chart + headline numbers
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features including completion velocity charts, stale task review, and weekly snapshots.
