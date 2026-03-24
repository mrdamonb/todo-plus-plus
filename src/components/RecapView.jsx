// ── Date helpers ──────────────────────────────────────────────────────────────

function dayStart(offsetDays = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d.getTime()
}

// ── Motivational copy ─────────────────────────────────────────────────────────

function getMessage(count) {
  if (count === 0)  return "Fresh start — your list is ready."
  if (count === 1)  return "First one down. Keep it going."
  if (count <= 3)   return "Off to a solid start."
  if (count <= 6)   return "Good day. You're in a groove."
  if (count <= 10)  return "You're crushing it today."
  return "Absolutely on fire. Incredible day."
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ count, total }) {
  const R    = 52
  const CIRC = 2 * Math.PI * R
  const pct  = total > 0 ? count / total : 0
  const filled = pct * CIRC

  return (
    <div className="recap-ring">
      <svg width="136" height="136" viewBox="0 0 136 136" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle cx="68" cy="68" r={R} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="11" />

        {/* Filled arc — rotated so it starts at 12 o'clock */}
        <circle cx="68" cy="68" r={R} fill="none"
          stroke={filled > 0 ? "url(#ringGrad)" : "transparent"}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(filled - 4, 0)} ${CIRC}`}
          transform="rotate(-90 68 68)"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />

        {/* Centre: count */}
        <text x="68" y="62" textAnchor="middle" className="ring-num">{count}</text>
        <text x="68" y="80" textAnchor="middle" className="ring-sublabel">
          {total > 0 ? `of ${total} done` : 'done today'}
        </text>
      </svg>
    </div>
  )
}

// ── Task row ──────────────────────────────────────────────────────────────────

function RecapTaskRow({ task, workspaces, done }) {
  const ws = workspaces.find(w => w.id === task.workspaceId)
  return (
    <div className={`recap-task-row ${done ? 'recap-task-done' : ''}`}>
      <span className="recap-task-dot" style={{ background: ws?.color || 'rgba(255,255,255,0.2)' }} />
      <span className="recap-task-title">{task.title}</span>
      {ws && (
        <span className="recap-task-ws" style={{ color: ws.color }} title={ws.name}>
          {ws.emoji}
        </span>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RecapView({ tasks, workspaces }) {
  const todayMs     = dayStart(0)
  const yesterdayMs = dayStart(-1)

  const completedToday     = tasks.filter(t => t.completed && t.completedAt >= todayMs)
  const completedYesterday = tasks.filter(t => t.completed && t.completedAt >= yesterdayMs && t.completedAt < todayMs)
  const stillOpen          = tasks.filter(t => !t.completed)

  const count = completedToday.length
  const total = count + stillOpen.length
  const diff  = count - completedYesterday.length

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="recap-view">
      <header className="content-header">
        <div>
          <h1 className="content-title">📅 Today</h1>
          <p className="content-meta">{dateStr}</p>
        </div>
      </header>

      {/* ── Score section ── */}
      <div className="recap-hero">
        <ProgressRing count={count} total={total} />

        <div className="recap-hero-text">
          <p className="recap-message">{getMessage(count)}</p>

          {completedYesterday.length > 0 && (
            <p className="recap-yesterday">
              Yesterday: {completedYesterday.length} task{completedYesterday.length !== 1 ? 's' : ''}
              {diff > 0 && <span className="recap-delta recap-delta-up"> ↑ {diff} more than yesterday</span>}
              {diff < 0 && <span className="recap-delta recap-delta-down"> ↓ {Math.abs(diff)} fewer than yesterday</span>}
              {diff === 0 && <span className="recap-delta recap-delta-same"> — same as yesterday</span>}
            </p>
          )}

          {completedYesterday.length === 0 && count > 0 && (
            <p className="recap-yesterday">No data for yesterday yet</p>
          )}
        </div>
      </div>

      {/* ── Completed today ── */}
      {completedToday.length > 0 && (
        <section className="recap-section">
          <h2 className="recap-section-title">
            <span className="recap-section-dot done-dot" />
            Completed today
            <span className="recap-section-count">{completedToday.length}</span>
          </h2>
          <div className="recap-task-list">
            {completedToday.map(task => (
              <RecapTaskRow key={task.id} task={task} workspaces={workspaces} done />
            ))}
          </div>
        </section>
      )}

      {/* ── Still open ── */}
      {stillOpen.length > 0 && (
        <section className="recap-section">
          <h2 className="recap-section-title">
            <span className="recap-section-dot open-dot" />
            Still open
            <span className="recap-section-count">{stillOpen.length}</span>
          </h2>
          <div className="recap-task-list">
            {stillOpen.slice(0, 8).map(task => (
              <RecapTaskRow key={task.id} task={task} workspaces={workspaces} />
            ))}
            {stillOpen.length > 8 && (
              <p className="recap-more">+ {stillOpen.length - 8} more</p>
            )}
          </div>
        </section>
      )}

      {/* ── True empty state ── */}
      {count === 0 && stillOpen.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <span className="empty-icon">✨</span>
          <p>No tasks yet. Add something to get started.</p>
        </div>
      )}
    </div>
  )
}
