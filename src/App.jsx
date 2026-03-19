import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import TaskInput from './components/TaskInput'
import TaskItem from './components/TaskItem'
import FocusMode from './components/FocusMode'
import StatsView from './components/StatsView'

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 10)

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_WORKSPACES = [
  { id: 'work',     name: 'Work',     emoji: '💼', color: '#a78bfa' },
  { id: 'personal', name: 'Personal', emoji: '👤', color: '#f472b6' },
  { id: 'health',   name: 'Health',   emoji: '🏃', color: '#34d399' },
]

const SAMPLE_TASKS = [
  {
    id: 'demo1',
    title: 'Try completing this task ✓',
    completed: false,
    completedAt: null,
    priority: 'high',
    workspaceId: 'work',
    isQuickWin: true,
    subtasks: [],
    createdAt: Date.now() - 3000,
  },
  {
    id: 'demo2',
    title: 'Click ▶ on a task to enter Focus Mode',
    completed: false,
    completedAt: null,
    priority: 'medium',
    workspaceId: 'work',
    isQuickWin: false,
    subtasks: [
      { id: 'sub1', title: 'A timer will start automatically', completed: false },
      { id: 'sub2', title: 'Mark done when finished', completed: false },
    ],
    createdAt: Date.now() - 2000,
  },
  {
    id: 'demo3',
    title: 'Double-click any task title to edit it',
    completed: false,
    completedAt: null,
    priority: null,
    workspaceId: 'personal',
    isQuickWin: true,
    subtasks: [],
    createdAt: Date.now() - 1000,
  },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [workspaces, setWorkspaces] = useLocalStorage('todopp-workspaces', DEFAULT_WORKSPACES)
  const [tasks, setTasks] = useLocalStorage('todopp-tasks', SAMPLE_TASKS)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('all')
  const [view, setView] = useState('tasks')
  const [focusTaskId, setFocusTaskId] = useState(null)

  // ── Task mutations ─────────────────────────────────────────────────────────

  const addTask = useCallback((title, options = {}) => {
    const newTask = {
      id: generateId(),
      title,
      completed: false,
      completedAt: null,
      priority: options.priority || null,
      workspaceId: options.workspaceId || (activeWorkspaceId !== 'all' ? activeWorkspaceId : workspaces[0]?.id || 'work'),
      isQuickWin: options.isQuickWin || false,
      subtasks: [],
      createdAt: Date.now(),
    }
    setTasks(prev => [newTask, ...prev])
  }, [activeWorkspaceId, workspaces, setTasks])

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null } : t
    ))
  }, [setTasks])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (focusTaskId === id) setFocusTaskId(null)
  }, [setTasks, focusTaskId])

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [setTasks])

  const addSubtask = useCallback((taskId, title) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: [...t.subtasks, { id: generateId(), title, completed: false }] }
        : t
    ))
  }, [setTasks])

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) }
        : t
    ))
  }, [setTasks])

  // ── Derived data ───────────────────────────────────────────────────────────

  const inWorkspace = (t) => activeWorkspaceId === 'all' || t.workspaceId === activeWorkspaceId

  const filteredTasks = tasks.filter(t => {
    if (!inWorkspace(t)) return false
    if (view === 'quick-wins') return t.isQuickWin && !t.completed
    if (view === 'completed') return t.completed
    return !t.completed
  })

  const quickWinCount = tasks.filter(t => t.isQuickWin && !t.completed && inWorkspace(t)).length
  const focusTask = tasks.find(t => t.id === focusTaskId) || null

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId)
  const headerTitle =
    view === 'quick-wins' ? '⚡ Quick Win Queue' :
    view === 'completed'  ? '✅ Completed' :
    view === 'stats'      ? '📊 Stats' :
    activeWs ? `${activeWs.emoji} ${activeWs.name}` : 'All Tasks'

  const remaining  = tasks.filter(t => !t.completed && inWorkspace(t)).length
  const completedN = tasks.filter(t =>  t.completed && inWorkspace(t)).length

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-layout">
      <div className="glow-blob glow-purple" />
      <div className="glow-blob glow-pink" />

      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        view={view}
        setView={setView}
        quickWinCount={quickWinCount}
        tasks={tasks}
        onAddWorkspace={(name, emoji) =>
          setWorkspaces(prev => [...prev, { id: generateId(), name, emoji, color: '#a78bfa' }])
        }
        onDeleteWorkspace={(id) => setWorkspaces(prev => prev.filter(w => w.id !== id))}
      />

      <main className="main-content">
        {view === 'stats' ? (
          <StatsView tasks={tasks} workspaces={workspaces} />
        ) : (
          <>
            <header className="content-header">
              <div>
                <h1 className="content-title">{headerTitle}</h1>
                <p className="content-meta">{remaining} remaining · {completedN} done</p>
              </div>
            </header>

            {view !== 'completed' && (
              <TaskInput
                onAdd={addTask}
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                defaultQuickWin={view === 'quick-wins'}
              />
            )}

            <div className="task-list">
              {filteredTasks.length === 0 ? (
                <EmptyState view={view} />
              ) : (
                filteredTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    workspaces={workspaces}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onUpdate={(updates) => updateTask(task.id, updates)}
                    onAddSubtask={(title) => addSubtask(task.id, title)}
                    onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
                    onFocus={() => setFocusTaskId(task.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {focusTask && (
        <FocusMode
          task={focusTask}
          onComplete={() => { toggleTask(focusTask.id); setFocusTaskId(null) }}
          onExit={() => setFocusTaskId(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ view }) {
  const copy = {
    tasks:        { icon: '✨', text: 'No tasks yet — add one above' },
    'quick-wins': { icon: '⚡', text: 'No quick wins queued. Add a task and mark it ⚡' },
    completed:    { icon: '🎉', text: "Nothing completed yet — go get some wins!" },
  }
  const { icon, text } = copy[view] || copy.tasks
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p>{text}</p>
    </div>
  )
}
