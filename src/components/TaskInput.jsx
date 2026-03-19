import { useState, useEffect } from 'react'

export default function TaskInput({ onAdd, workspaces, activeWorkspaceId, defaultQuickWin }) {
  const defaultWsId = activeWorkspaceId !== 'all' ? activeWorkspaceId : workspaces[0]?.id || ''

  const [value,      setValue]      = useState('')
  const [priority,   setPriority]   = useState(null)
  const [isQuickWin, setIsQuickWin] = useState(defaultQuickWin || false)
  const [wsId,       setWsId]       = useState(defaultWsId)
  const [open,       setOpen]       = useState(false)

  useEffect(() => {
    setIsQuickWin(defaultQuickWin || false)
  }, [defaultQuickWin])

  useEffect(() => {
    if (activeWorkspaceId !== 'all') setWsId(activeWorkspaceId)
  }, [activeWorkspaceId])

  function handleSubmit(e) {
    e?.preventDefault()
    if (!value.trim()) return
    onAdd(value.trim(), { priority, isQuickWin, workspaceId: wsId })
    setValue('')
    setPriority(null)
    setIsQuickWin(defaultQuickWin || false)
    setOpen(false)
  }

  const PRIORITIES = [
    { id: 'high',   label: '🔴 High'   },
    { id: 'medium', label: '🟡 Medium' },
    { id: 'low',    label: '🟢 Low'    },
  ]

  return (
    <div className="task-input-wrapper">
      <form className="task-input-form" onSubmit={handleSubmit}>
        <span className="input-plus">+</span>
        <input
          className="task-input"
          placeholder="Add a task… (press Enter)"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        {value.trim() && (
          <button type="submit" className="input-submit-btn" aria-label="Add task">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </form>

      {open && (
        <div className="task-input-options">
          <div className="options-row">
            <OptionGroup label="Priority">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`pill-btn ${priority === p.id ? 'pill-active' : ''}`}
                  onClick={() => setPriority(priority === p.id ? null : p.id)}
                >
                  {p.label}
                </button>
              ))}
            </OptionGroup>

            <OptionGroup label="Space">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  type="button"
                  className={`pill-btn ${wsId === ws.id ? 'pill-active' : ''}`}
                  onClick={() => setWsId(ws.id)}
                >
                  {ws.emoji} {ws.name}
                </button>
              ))}
            </OptionGroup>

            <button
              type="button"
              className={`pill-btn quick-win-pill ${isQuickWin ? 'pill-active' : ''}`}
              onClick={() => setIsQuickWin(q => !q)}
            >
              ⚡ Quick Win
            </button>

            <button
              type="button"
              className="options-dismiss"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function OptionGroup({ label, children }) {
  return (
    <div className="option-group">
      <span className="option-label">{label}</span>
      <div className="pill-row">{children}</div>
    </div>
  )
}
