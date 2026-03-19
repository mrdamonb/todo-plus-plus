# Todo++

A fast, beautiful todo app built with **React + Vite**. Dark UI, smooth animations, and features designed to help you actually get things done.

## Features

| Feature | Description |
|---|---|
| **Quick Win Queue** | Tasks marked ⚡ surface in a dedicated view to help you build momentum |
| **Project Workspaces** | Separate spaces for Work, Personal, Health, or any custom category |
| **Focus Mode** | Click ▶ on any task to enter a full-screen focus session with a live timer |
| **Subtasks** | Expand any task to add, check off, and track sub-items |
| **Priorities** | Tag tasks as High / Medium / Low — displayed as color-coded chips |
| **Satisfying check-offs** | Smooth completion animations on every task you finish |
| **localStorage persistence** | All tasks and workspaces survive page refreshes — no backend needed |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Tips

- **Add a task** — type in the input at the top and press Enter
- **Expand options** — click into the input to reveal Priority, Space, and ⚡ Quick Win toggles
- **Edit a task** — double-click any task title to rename it inline
- **Expand a task** — click ▾ to reveal subtasks and priority controls
- **Focus Mode** — click ▶ on a task to start a focused session with a timer
- **Add a workspace** — click "New Space" in the sidebar, pick an emoji and a name
- **Remove a workspace** — hover the workspace in the sidebar and click ×

## Tech Stack

- [Vite](https://vitejs.dev/) — blazing-fast dev server and build tool
- [React](https://react.dev/) — component-based UI
- CSS custom properties — no CSS framework, hand-crafted dark design system
- `localStorage` — zero-backend persistence

## Roadmap

The `index.html` in this repo describes the full product vision, including:

- 🤖 **AI Task Splitter** — one click to break a large task into subtasks
- 🤖 **AI Daily Planner** — morning smart scheduling based on priorities and energy
- 🗂️ More workspace customization
- 📱 Mobile-responsive layout

## Project Structure

```
src/
  App.jsx               # Root component, state management
  App.css               # Global design system & styles
  components/
    Sidebar.jsx         # Workspace nav + view switcher
    TaskInput.jsx       # Add-task form with options panel
    TaskItem.jsx        # Individual task (checkbox, chips, expand, focus)
    FocusMode.jsx       # Full-screen focus overlay with timer
```
