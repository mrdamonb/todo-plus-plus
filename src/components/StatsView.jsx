// ── Constants ─────────────────────────────────────────────────────────────────

const RADIUS = 80
const STROKE = 18
const GAP    = 3          // px gap between segments
const CX     = 110
const CY     = 110
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Fallback color for workspaces that don't have one set
const FALLBACK_COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#fb7185']

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSegments(slices) {
  // Each slice: { label, color, value }
  const total = slices.reduce((s, x) => s + x.value, 0)
  if (total === 0) return []

  let offset = 0
  return slices.map((slice, i) => {
    const fraction   = slice.value / total
    const rawLen     = fraction * CIRCUMFERENCE
    // Subtract a small gap on each side so segments breathe
    const segLen     = Math.max(0, rawLen - GAP)
    const dasharray  = `${segLen} ${CIRCUMFERENCE - segLen}`
    // stroke-dashoffset rotates the starting point; SVG strokes start at 3 o'clock,
    // so subtract CIRCUMFERENCE/4 to start at 12 o'clock, then add cumulative offset
    const dashoffset = -(offset - CIRCUMFERENCE / 4)
    offset += rawLen
    return { ...slice, dasharray, dashoffset, fraction, index: i }
  })
}

function pct(n) { return `${Math.round(n * 100)}%` }

// ── Sub-components ────────────────────────────────────────────────────────────

function DonutChart({ segments, total }) {
  return (
    <div className="donut-wrap">
      <svg
        viewBox={`0 0 ${CX * 2} ${CY * 2}`}
        className="donut-svg"
        role="img"
        aria-label="Completed tasks by workspace"
      >
        {/* Track ring */}
        <circle
          cx={CX} cy={CY} r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={STROKE}
        />

        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={seg.dasharray}
            strokeDashoffset={seg.dashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
          />
        ))}

        {/* Centre label */}
        <text x={CX} y={CY - 10} textAnchor="middle" className="donut-centre-num">
          {total}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" className="donut-centre-label">
          completed
        </text>
      </svg>
    </div>
  )
}

function Legend({ segments }) {
  if (segments.length === 0) return null
  return (
    <ul className="donut-legend">
      {segments.map(seg => (
        <li key={seg.label} className="legend-item">
          <span className="legend-dot" style={{ background: seg.color }} />
          <span className="legend-label">{seg.label}</span>
          <span className="legend-count">{seg.value}</span>
          <span className="legend-pct">{pct(seg.fraction)}</span>
        </li>
      ))}
    </ul>
  )
}

function StatCard({ value, label, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StatsView({ tasks, workspaces }) {
  const completed = tasks.filter(t => t.completed)
  const total     = tasks.length
  const remaining = total - completed.length

  // Completion rate
  const rate = total > 0 ? completed.length / total : 0

  // Most productive workspace
  const countByWs = workspaces.map((ws, i) => ({
    ...ws,
    color: ws.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    value: completed.filter(t => t.workspaceId === ws.id).length,
  })).filter(ws => ws.value > 0)

  const topWs = countByWs.reduce((best, ws) => (!best || ws.value > best.value ? ws : best), null)

  // Tasks completed this week (Mon 00:00 → now)
  const now       = Date.now()
  const dayOfWeek = new Date().getDay()            // 0=Sun … 6=Sat
  const daysSinceMon = (dayOfWeek + 6) % 7         // Mon=0 … Sun=6
  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - daysSinceMon)
  const thisWeek = completed.filter(t => t.completedAt && t.completedAt >= weekStart.getTime()).length

  // Build donut slices (only workspaces with ≥1 completion)
  const slices    = countByWs
  const segments  = buildSegments(slices)

  const hasData = completed.length > 0

  return (
    <div className="stats-view">
      <header className="content-header">
        <div>
          <h1 className="content-title">📊 Stats</h1>
          <p className="content-meta">A look at what you've accomplished</p>
        </div>
      </header>

      {/* ── Headline numbers ── */}
      <div className="stat-cards">
        <StatCard value={completed.length} label="Total Completed" />
        <StatCard value={remaining}        label="Still To Do" />
        <StatCard value={thisWeek}         label="This Week" />
        <StatCard
          value={total > 0 ? `${Math.round(rate * 100)}%` : '—'}
          label="Completion Rate"
          sub={total > 0 ? `${completed.length} of ${total} tasks` : 'no tasks yet'}
        />
      </div>

      {/* ── Donut section ── */}
      <section className="donut-section">
        <h2 className="stats-section-title">Completed by Space</h2>

        {hasData ? (
          <div className="donut-layout">
            <DonutChart segments={segments} total={completed.length} />
            <div className="donut-right">
              <Legend segments={segments} />
              {topWs && (
                <p className="top-ws-callout">
                  Most active space:&nbsp;
                  <span style={{ color: topWs.color }}>{topWs.emoji} {topWs.name}</span>
                  &nbsp;with <strong>{topWs.value}</strong> task{topWs.value !== 1 ? 's' : ''} done
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="stats-empty">
            <span className="empty-icon">📭</span>
            <p>Complete some tasks to see your breakdown here.</p>
          </div>
        )}
      </section>
    </div>
  )
}
