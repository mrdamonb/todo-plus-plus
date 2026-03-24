# Todo++ Roadmap

Feature ideas surfaced through a product interview. Ranked by impact on the core problem: *feeling like you're making progress even when you don't check your list often.*

---

## Priority Features

### 1. Daily Recap View
A "Today" section showing tasks completed today, tasks still open, and a simple "you got X things done" score.

- Powered by the `completed_at` timestamp already stored on every task
- No extra data entry required — the DB tracks it automatically
- The end-of-day moment that makes opening the app feel rewarding, not like a chore
- Could live as a persistent banner at the top of All Tasks, or as its own sidebar view

### 2. Completion Velocity (Stats Expansion)
Expand the existing Stats page with a 7-day bar chart showing tasks completed per day, your rolling average, and your personal best day.

- Answers "when am I actually productive?" — insight a paper list cannot give
- Uses `completed_at` grouped by calendar day
- Could also surface: average time-to-completion (delta between `created_at` and `completed_at`), best day of week, most productive workspace

### 3. Stale Task Review
A "Review" mode that surfaces tasks older than 7 days that haven't been completed.

- Since tasks typically get done same-day, old tasks are almost always stale or no longer relevant
- The DB ages tasks automatically via `created_at` — no extra tracking needed
- Prompts: still relevant → keep, or archive/delete
- Reduces the mental overhead of maintaining multiple tools by keeping the list clean

### 4. Weekly Snapshot
A Mon–Sun grid showing tasks completed each day this week vs. last week.

- Aligns with a weekly planning horizon
- Answers "did I have a good week?" without manual tracking
- Could live in Stats or as its own sidebar view
- DB query: group `completed_at` by day-of-week for current and previous week

---

## Earlier Ideas (also captured)

These were discussed before the product interview:

- **Due Dates + Smart Overdue View** — optional due date on tasks, color-coded chips, "Due Today" sidebar filter
- **Completion Streaks** — daily streak counter and tasks-completed-today badge
- **Search + Smart Filter** — real-time search across all workspaces, filter chips for priority/workspace
- **Weekly Bar Chart** (partially overlaps with Completion Velocity above)
- **GitHub-style Activity Heatmap** — 90-day completion grid, hardest to build but most visually impressive

---

## Already Built

- Task management with priorities, subtasks, and workspaces
- Quick Win Queue
- Focus Mode with live timer
- Completion animations
- Stats page with SVG donut chart (completed tasks by workspace)
- Supabase database backend (tasks + workspaces persist across sessions)
