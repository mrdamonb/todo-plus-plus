import { useState } from 'react'

export default function Sidebar({
  workspaces, activeWorkspaceId, setActiveWorkspaceId,
  view, setView, quickWinCount, tasks,
  onAddWorkspace, onDeleteWorkspace,
}) {
  const [addingWs, setAddingWs] = useState(false)
  const [wsName, setWsName]   = useState('')
  const [wsEmoji, setWsEmoji] = useState('📁')

  function taskCount(wsId) {
    return tasks.filter(t => !t.completed && (wsId === 'all' ? true : t.workspaceId === wsId)).length
  }

  const todayStart = new Date().setHours(0, 0, 0, 0)
  const completedTodayCount = tasks.filter(t => t.completed && t.completedAt >= todayStart).length

  function handleSave() {
    if (wsName.trim()) {
      onAddWorkspace(wsName.trim(), wsEmoji || '📁')
      setWsName('')
      setWsEmoji('📁')
      setAddingWs(false)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Todo<span className="logo-pp">++</span></span>
      </div>

      <nav className="sidebar-nav">
        <NavItem
          active={view === 'today'}
          onClick={() => setView('today')}
          icon="📅"
          label="Today"
          count={completedTodayCount}
          countGreen
        />
        <NavItem
          active={view === 'tasks' && activeWorkspaceId === 'all'}
          onClick={() => { setView('tasks'); setActiveWorkspaceId('all') }}
          icon="📋"
          label="All Tasks"
          count={taskCount('all')}
        />
        <NavItem
          active={view === 'quick-wins'}
          onClick={() => setView('quick-wins')}
          icon="⚡"
          label="Quick Wins"
          count={quickWinCount}
          countGold
        />
        <NavItem
          active={view === 'completed'}
          onClick={() => setView('completed')}
          icon="✅"
          label="Completed"
        />
        <NavItem
          active={view === 'stats'}
          onClick={() => setView('stats')}
          icon="📊"
          label="Stats"
        />
      </nav>

      <div className="sidebar-section-label">Spaces</div>

      <nav className="sidebar-workspaces">
        {workspaces.map(ws => (
          <div key={ws.id} className="workspace-row">
            <NavItem
              active={activeWorkspaceId === ws.id && view === 'tasks'}
              onClick={() => { setActiveWorkspaceId(ws.id); setView('tasks') }}
              icon={ws.emoji}
              label={ws.name}
              count={taskCount(ws.id)}
              accentColor={activeWorkspaceId === ws.id && view === 'tasks' ? ws.color : undefined}
            />
            <button
              className="ws-delete-btn"
              onClick={() => { onDeleteWorkspace(ws.id); setActiveWorkspaceId('all') }}
              title={`Remove ${ws.name}`}
            >
              ×
            </button>
          </div>
        ))}

        {addingWs ? (
          <div className="add-ws-form">
            <div className="add-ws-row">
              <input
                className="ws-emoji-input"
                value={wsEmoji}
                onChange={e => setWsEmoji(e.target.value)}
                maxLength={2}
                title="Emoji"
              />
              <input
                className="ws-name-input"
                placeholder="Space name"
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setAddingWs(false)
                }}
                autoFocus
              />
            </div>
            <div className="add-ws-actions">
              <button className="ws-save-btn" onClick={handleSave}>Add</button>
              <button className="ws-cancel-btn" onClick={() => setAddingWs(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="nav-item add-space-btn" onClick={() => setAddingWs(true)}>
            <span className="nav-icon">+</span>
            <span>New Space</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0.0</span>
      </div>
    </aside>
  )
}

function NavItem({ active, onClick, icon, label, count, countGold, countGreen, accentColor }) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      style={accentColor ? { '--accent': accentColor } : undefined}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {count > 0 && (
        <span className={`nav-count ${countGold ? 'nav-count-gold' : ''} ${countGreen ? 'nav-count-green' : ''}`}>
          {count}
        </span>
      )}
    </button>
  )
}
