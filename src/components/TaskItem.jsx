import { useState } from 'react'

const PRIORITY = {
  high:   { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  low:    { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
}

export default function TaskItem({
  task, workspaces,
  onToggle, onDelete, onUpdate, onAddSubtask, onToggleSubtask, onFocus,
}) {
  const [expanded,     setExpanded]     = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [completing,   setCompleting]   = useState(false)
  const [editing,      setEditing]      = useState(false)
  const [editValue,    setEditValue]    = useState(task.title)

  const workspace = workspaces.find(w => w.id === task.workspaceId)
  const doneSubs  = task.subtasks.filter(s => s.completed).length

  function handleToggle() {
    if (task.completed) { onToggle(); return }
    setCompleting(true)
    setTimeout(() => { setCompleting(false); onToggle() }, 480)
  }

  function handleSubtaskKey(e) {
    if (e.key === 'Enter' && subtaskInput.trim()) {
      onAddSubtask(subtaskInput.trim())
      setSubtaskInput('')
    }
  }

  function saveEdit() {
    if (editValue.trim()) onUpdate({ title: editValue.trim() })
    setEditing(false)
  }

  const p = task.priority ? PRIORITY[task.priority] : null

  return (
    <div className={[
      'task-item',
      task.completed ? 'task-done' : '',
      completing     ? 'task-completing' : '',
    ].join(' ')}>

      {/* ── Main row ── */}
      <div className="task-main">
        <button
          className={`task-checkbox ${task.completed || completing ? 'checked' : ''}`}
          onClick={handleToggle}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {(task.completed || completing) && <CheckSvg />}
        </button>

        <div className="task-body">
          {editing ? (
            <input
              className="task-edit-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
              onBlur={saveEdit}
              autoFocus
            />
          ) : (
            <span
              className="task-title"
              onDoubleClick={() => { if (!task.completed) { setEditing(true); setEditValue(task.title) } }}
              title="Double-click to edit"
            >
              {task.title}
            </span>
          )}

          <div className="task-chips">
            {workspace && (
              <span className="chip chip-ws" style={{ color: workspace.color }}>
                {workspace.emoji} {workspace.name}
              </span>
            )}
            {p && (
              <span className="chip chip-priority" style={{ color: p.color, background: p.bg }}>
                {task.priority}
              </span>
            )}
            {task.isQuickWin && <span className="chip chip-qw">⚡ quick win</span>}
            {task.subtasks.length > 0 && (
              <span className="chip chip-sub">{doneSubs}/{task.subtasks.length} subtasks</span>
            )}
          </div>
        </div>

        <div className="task-actions">
          {!task.completed && (
            <button className="task-btn focus-btn" onClick={onFocus} title="Enter Focus Mode">▶</button>
          )}
          <button className="task-btn expand-btn" onClick={() => setExpanded(e => !e)} title="Expand">
            {expanded ? '▴' : '▾'}
          </button>
          <button className="task-btn delete-btn" onClick={onDelete} title="Delete">×</button>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="task-expanded">

          {/* Priority + quick win toggles */}
          {!task.completed && (
            <div className="expand-row">
              <span className="expand-label">Priority</span>
              <div className="pill-row">
                {['high', 'medium', 'low'].map(pri => (
                  <button
                    key={pri}
                    className={`pill-btn ${task.priority === pri ? 'pill-active' : ''}`}
                    style={task.priority === pri ? { color: PRIORITY[pri].color, background: PRIORITY[pri].bg } : {}}
                    onClick={() => onUpdate({ priority: task.priority === pri ? null : pri })}
                  >
                    {pri}
                  </button>
                ))}
              </div>
              <button
                className={`pill-btn ${task.isQuickWin ? 'pill-active' : ''}`}
                onClick={() => onUpdate({ isQuickWin: !task.isQuickWin })}
              >
                ⚡ {task.isQuickWin ? 'Quick Win ✓' : 'Mark Quick Win'}
              </button>
            </div>
          )}

          {/* Subtasks */}
          <div className="subtasks">
            {task.subtasks.map(sub => (
              <div key={sub.id} className={`subtask-row ${sub.completed ? 'subtask-done' : ''}`}>
                <button
                  className={`subtask-cb ${sub.completed ? 'checked' : ''}`}
                  onClick={() => onToggleSubtask(sub.id)}
                >
                  {sub.completed && <CheckSvg />}
                </button>
                <span className="subtask-title">{sub.title}</span>
              </div>
            ))}
            {!task.completed && (
              <input
                className="subtask-input"
                placeholder="+ Add subtask (Enter to save)"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={handleSubtaskKey}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckSvg() {
  return (
    <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 5 4.5 8.5 11 1" />
    </svg>
  )
}
