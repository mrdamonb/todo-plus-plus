import { useState, useEffect } from 'react'

export default function FocusMode({ task, onComplete, onExit }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="focus-overlay" onClick={(e) => e.target === e.currentTarget && onExit()}>
      <div className="focus-card">
        <div className="focus-badge">⚡ Focus Mode</div>

        <div className="focus-timer">{mm}:{ss}</div>

        <p className="focus-task-title">{task.title}</p>

        {task.subtasks.length > 0 && (
          <div className="focus-subtasks">
            {task.subtasks.map(s => (
              <div key={s.id} className={`focus-sub ${s.completed ? 'focus-sub-done' : ''}`}>
                <span className="focus-sub-dot">{s.completed ? '✓' : '○'}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="focus-actions">
          <button className="focus-complete-btn" onClick={onComplete}>
            ✓ Mark Complete
          </button>
          <button className="focus-pause-btn" onClick={() => setRunning(r => !r)}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="focus-exit-btn" onClick={onExit}>
            ← Exit Focus
          </button>
        </div>
      </div>
    </div>
  )
}
