import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import TaskInput from './components/TaskInput'
import TaskItem from './components/TaskItem'
import FocusMode from './components/FocusMode'
import StatsView from './components/StatsView'
import RecapView from './components/RecapView'

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 10)

// DB snake_case ↔ app camelCase
function fromDb(t) {
  return {
    id:          t.id,
    title:       t.title,
    completed:   t.completed,
    completedAt: t.completed_at ? new Date(t.completed_at).getTime() : null,
    priority:    t.priority,
    workspaceId: t.workspace_id,
    isQuickWin:  t.is_quick_win,
    subtasks:    t.subtasks || [],
    createdAt:   new Date(t.created_at).getTime(),
  }
}

function toDb(t) {
  return {
    id:           t.id,
    title:        t.title,
    completed:    t.completed,
    completed_at: t.completedAt ? new Date(t.completedAt).toISOString() : null,
    priority:     t.priority || null,
    workspace_id: t.workspaceId,
    is_quick_win: t.isQuickWin,
    subtasks:     t.subtasks,
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [workspaces,       setWorkspaces]       = useState([])
  const [tasks,            setTasks]            = useState([])
  const [loading,          setLoading]          = useState(true)
  const [dbError,          setDbError]          = useState(null)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('all')
  const [view,             setView]             = useState('tasks')
  const [focusTaskId,      setFocusTaskId]      = useState(null)

  // Stable refs so callbacks don't go stale without re-creating on every render
  const tasksRef      = useRef([])
  const workspacesRef = useRef([])
  tasksRef.current      = tasks
  workspacesRef.current = workspaces

  // ── Load from Supabase on mount ──────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const [
        { data: wsList, error: we },
        { data: tList,  error: te },
      ] = await Promise.all([
        supabase.from('workspaces').select('*').order('position'),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      ])

      if (we || te) {
        setDbError('Could not connect to database. Check your .env.local and try again.')
        setLoading(false)
        return
      }

      setWorkspaces(wsList ?? [])
      setTasks((tList ?? []).map(fromDb))
      setLoading(false)
    }
    load()
  }, [])

  // ── Task mutations (optimistic: update UI first, then sync to DB) ────────────

  const addTask = useCallback(async (title, options = {}) => {
    const wsList = workspacesRef.current
    const newTask = {
      id:          generateId(),
      title,
      completed:   false,
      completedAt: null,
      priority:    options.priority || null,
      workspaceId: options.workspaceId || (activeWorkspaceId !== 'all' ? activeWorkspaceId : wsList[0]?.id || 'work'),
      isQuickWin:  options.isQuickWin || false,
      subtasks:    [],
      createdAt:   Date.now(),
    }
    setTasks(prev => [newTask, ...prev])
    const { error } = await supabase.from('tasks').insert(toDb(newTask))
    if (error) {
      console.error('addTask failed:', error)
      setTasks(prev => prev.filter(t => t.id !== newTask.id)) // revert
    }
  }, [activeWorkspaceId])

  const toggleTask = useCallback(async (id) => {
    const task = tasksRef.current.find(t => t.id === id)
    if (!task) return
    const completed   = !task.completed
    const completedAt = completed ? Date.now() : null
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, completedAt } : t))
    const { error } = await supabase.from('tasks').update({
      completed,
      completed_at: completedAt ? new Date(completedAt).toISOString() : null,
    }).eq('id', id)
    if (error) {
      console.error('toggleTask failed:', error)
      setTasks(prev => prev.map(t => t.id === id ? task : t)) // revert
    }
  }, [])

  const deleteTask = useCallback(async (id) => {
    const prev = tasksRef.current
    setTasks(p => p.filter(t => t.id !== id))
    setFocusTaskId(f => f === id ? null : f)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('deleteTask failed:', error)
      setTasks(prev) // revert
    }
  }, [])

  const updateTask = useCallback(async (id, updates) => {
    const task = tasksRef.current.find(t => t.id === id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    const dbUpdates = {}
    if ('title'      in updates) dbUpdates.title        = updates.title
    if ('priority'   in updates) dbUpdates.priority     = updates.priority || null
    if ('isQuickWin' in updates) dbUpdates.is_quick_win = updates.isQuickWin
    if ('subtasks'   in updates) dbUpdates.subtasks     = updates.subtasks
    if (Object.keys(dbUpdates).length === 0) return
    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id)
    if (error) {
      console.error('updateTask failed:', error)
      setTasks(prev => prev.map(t => t.id === id ? task : t)) // revert
    }
  }, [])

  const addSubtask = useCallback(async (taskId, title) => {
    const task = tasksRef.current.find(t => t.id === taskId)
    if (!task) return
    const newSub  = { id: generateId(), title, completed: false }
    const subtasks = [...task.subtasks, newSub]
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks } : t))
    const { error } = await supabase.from('tasks').update({ subtasks }).eq('id', taskId)
    if (error) {
      console.error('addSubtask failed:', error)
      setTasks(prev => prev.map(t => t.id === taskId ? task : t)) // revert
    }
  }, [])

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasksRef.current.find(t => t.id === taskId)
    if (!task) return
    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    )
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks } : t))
    const { error } = await supabase.from('tasks').update({ subtasks }).eq('id', taskId)
    if (error) {
      console.error('toggleSubtask failed:', error)
      setTasks(prev => prev.map(t => t.id === taskId ? task : t)) // revert
    }
  }, [])

  // ── Workspace mutations ───────────────────────────────────────────────────────

  const addWorkspace = useCallback(async (name, emoji) => {
    const ws = {
      id:       generateId(),
      name,
      emoji,
      color:    '#a78bfa',
      position: workspacesRef.current.length,
    }
    setWorkspaces(prev => [...prev, ws])
    const { error } = await supabase.from('workspaces').insert(ws)
    if (error) {
      console.error('addWorkspace failed:', error)
      setWorkspaces(prev => prev.filter(w => w.id !== ws.id)) // revert
    }
  }, [])

  const deleteWorkspace = useCallback(async (id) => {
    const prev = workspacesRef.current
    setWorkspaces(p => p.filter(w => w.id !== id))
    const { error } = await supabase.from('workspaces').delete().eq('id', id)
    if (error) {
      console.error('deleteWorkspace failed:', error)
      setWorkspaces(prev) // revert
    }
  }, [])

  // ── Derived data ──────────────────────────────────────────────────────────────

  const inWorkspace = (t) => activeWorkspaceId === 'all' || t.workspaceId === activeWorkspaceId

  const filteredTasks = tasks.filter(t => {
    if (!inWorkspace(t)) return false
    if (view === 'quick-wins') return t.isQuickWin && !t.completed
    if (view === 'completed')  return t.completed
    return !t.completed
  })

  const quickWinCount = tasks.filter(t => t.isQuickWin && !t.completed && inWorkspace(t)).length
  const focusTask     = tasks.find(t => t.id === focusTaskId) || null

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId)
  const headerTitle =
    view === 'quick-wins' ? '⚡ Quick Win Queue' :
    view === 'completed'  ? '✅ Completed' :
    view === 'stats'      ? '📊 Stats' :
    activeWs ? `${activeWs.emoji} ${activeWs.name}` : 'All Tasks'

  const remaining  = tasks.filter(t => !t.completed && inWorkspace(t)).length
  const completedN = tasks.filter(t =>  t.completed && inWorkspace(t)).length

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />
  if (dbError)  return <ErrorScreen message={dbError} />

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
        onAddWorkspace={addWorkspace}
        onDeleteWorkspace={deleteWorkspace}
      />

      <main className="main-content">
        {view === 'today' ? (
          <RecapView tasks={tasks} workspaces={workspaces} />
        ) : view === 'stats' ? (
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

// ── Loading / error screens ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fullscreen-center">
      <div className="glow-blob glow-purple" />
      <div className="glow-blob glow-pink" />
      <div className="loading-content">
        <span className="loading-logo">Todo<span className="logo-pp">++</span></span>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="fullscreen-center">
      <div className="glow-blob glow-purple" />
      <div className="error-content">
        <span className="empty-icon">⚠️</span>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: 360, textAlign: 'center' }}>
          {message}
        </p>
      </div>
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
