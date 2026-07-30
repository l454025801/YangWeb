import { useMemo } from 'react'
import type { FigureKind } from '../content'

/** Deterministic PRNG so figures are stable across renders. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const STROKE = 'var(--color-line-bright)'

function PointCloud({ seed }: { seed: number }) {
  const pts = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 260 }, () => {
      const a = r() * Math.PI * 2
      const rad = Math.sqrt(r()) * 46
      return {
        x: 50 + Math.cos(a) * rad * 1.5,
        y: 50 + Math.sin(a) * rad * 0.72,
        s: 0.35 + r() * 1.5,
        keep: r() > 0.82,
        d: r() * 6,
      }
    })
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.s}
          fill={p.keep ? 'var(--color-moss)' : 'var(--color-dust)'}
          opacity={p.keep ? 0.95 : 0.28}
          style={{ animation: `rise 1.2s var(--ease-soft) ${p.d * 0.12}s both` }}
        />
      ))}
    </svg>
  )
}

function Graph({ seed }: { seed: number }) {
  const { nodes, edges } = useMemo(() => {
    const r = rng(seed)
    const n = Array.from({ length: 26 }, (_, i) => ({
      x: 10 + r() * 80,
      y: 10 + r() * 80,
      s: i % 7 === 0 ? 2.3 : 1.1,
      hub: i % 7 === 0,
    }))
    const e: [number, number][] = []
    n.forEach((_, i) => {
      const t = Math.floor(r() * n.length)
      if (t !== i) e.push([i, t])
      const t2 = Math.floor(r() * n.length)
      if (t2 !== i && r() > 0.45) e.push([i, t2])
    })
    return { nodes: n, edges: e }
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g stroke={STROKE} strokeWidth="0.22">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            opacity="0.7"
            style={{ animation: `wipe-in 1.6s var(--ease-soft) ${i * 0.03}s both` }}
          />
        ))}
      </g>
      {nodes.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.s}
          fill={p.hub ? 'var(--color-steel)' : 'var(--color-mist)'}
          opacity={p.hub ? 0.9 : 0.5}
        />
      ))}
    </svg>
  )
}

function Surface({ seed }: { seed: number }) {
  const rows = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 22 }, (_, i) =>
      Array.from({ length: 40 }, (_, j) => {
        const w =
          Math.sin(j * 0.28 + i * 0.34) * 6 + Math.cos(j * 0.14 - i * 0.2) * 4 + (r() - 0.5) * 1.6
        return { x: j * 2.6, y: 22 + i * 2.6 + w, v: w }
      }),
    )
  }, [seed])

  return (
    <svg viewBox="0 0 104 100" className="h-full w-full">
      {rows.map((row, i) => (
        <polyline
          key={i}
          points={row.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={i % 4 === 0 ? 'var(--color-moss)' : STROKE}
          strokeWidth={i % 4 === 0 ? 0.4 : 0.28}
          opacity={i % 4 === 0 ? 0.8 : 0.55}
          style={{ animation: `wipe-in 1.8s var(--ease-soft) ${i * 0.05}s both` }}
        />
      ))}
    </svg>
  )
}

function Helix({ seed }: { seed: number }) {
  const bars = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 46 }, (_, i) => {
      const t = i * 0.34
      return {
        x: 6 + i * 2,
        y1: 50 + Math.sin(t) * 26,
        y2: 50 + Math.sin(t + Math.PI) * 26,
        hot: r() > 0.78,
      }
    })
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {bars.map((b, i) => (
        <g key={i} style={{ animation: `rise 1s var(--ease-soft) ${i * 0.025}s both` }}>
          <line
            x1={b.x}
            y1={b.y1}
            x2={b.x}
            y2={b.y2}
            stroke={b.hot ? 'var(--color-clay)' : STROKE}
            strokeWidth={b.hot ? 0.6 : 0.3}
            opacity={b.hot ? 0.85 : 0.5}
          />
          <circle cx={b.x} cy={b.y1} r="0.9" fill="var(--color-mist)" opacity="0.65" />
          <circle cx={b.x} cy={b.y2} r="0.9" fill="var(--color-steel)" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

function Plot({ seed }: { seed: number }) {
  const { bars, line } = useMemo(() => {
    const r = rng(seed)
    const b = Array.from({ length: 34 }, (_, i) => ({
      x: 8 + i * 2.6,
      h: 6 + Math.abs(Math.sin(i * 0.42)) * 34 + r() * 12,
      hot: r() > 0.8,
    }))
    const l = Array.from({ length: 34 }, (_, i) => ({
      x: 8 + i * 2.6,
      y: 74 - (Math.log(i + 2) * 12 + r() * 4),
    }))
    return { bars: b, line: l }
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g stroke={STROKE} strokeWidth="0.2" opacity="0.6">
        {[20, 38, 56, 74].map((y) => (
          <line key={y} x1="6" y1={y} x2="96" y2={y} />
        ))}
      </g>
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={78 - b.h}
          width="1.5"
          height={b.h}
          fill={b.hot ? 'var(--color-moss)' : 'var(--color-dust)'}
          opacity={b.hot ? 0.8 : 0.35}
          style={{ animation: `rise 0.9s var(--ease-soft) ${i * 0.02}s both` }}
        />
      ))}
      <polyline
        points={line.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="var(--color-clay)"
        strokeWidth="0.5"
        opacity="0.85"
        style={{ animation: 'wipe-in 2s var(--ease-soft) 0.2s both' }}
      />
      <line x1="6" y1="78" x2="96" y2="78" stroke="var(--color-line-bright)" strokeWidth="0.3" />
    </svg>
  )
}

function Lattice({ seed }: { seed: number }) {
  const cells = useMemo(() => {
    const r = rng(seed)
    const out: { x: number; y: number; on: number }[] = []
    for (let i = 0; i < 14; i++)
      for (let j = 0; j < 14; j++) out.push({ x: 8 + j * 6.2, y: 8 + i * 6.2, on: r() })
    return out
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width="4.4"
          height="4.4"
          fill={c.on > 0.86 ? 'var(--color-moss)' : c.on > 0.6 ? 'var(--color-line-bright)' : 'none'}
          stroke={STROKE}
          strokeWidth="0.18"
          opacity={c.on > 0.86 ? 0.75 : 0.55}
          style={{ animation: `rise 0.8s var(--ease-soft) ${(i % 28) * 0.03}s both` }}
        />
      ))}
    </svg>
  )
}

function Funnel({ seed }: { seed: number }) {
  const tiers = useMemo(() => {
    const r = rng(seed)
    return [
      { w: 68, label: '17M', n: 90 },
      { w: 47, label: '200K', n: 46 },
      { w: 28, label: '4K', n: 20 },
      { w: 13, label: '10+', n: 8 },
    ].map((t, i) => ({
      ...t,
      y: 14 + i * 20,
      dots: Array.from({ length: t.n }, () => ({ dx: r(), dy: r() })),
    }))
  }, [seed])

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {tiers.map((t, i) => (
        <g key={i} style={{ animation: `rise 0.9s var(--ease-soft) ${i * 0.14}s both` }}>
          <rect
            x={50 - t.w / 2}
            y={t.y}
            width={t.w}
            height="13"
            fill="none"
            stroke={STROKE}
            strokeWidth="0.25"
          />
          {t.dots.map((d, k) => (
            <circle
              key={k}
              cx={50 - t.w / 2 + d.dx * t.w}
              cy={t.y + 1.5 + d.dy * 10}
              r={i === 3 ? 0.7 : 0.5}
              fill={i === 3 ? 'var(--color-moss)' : 'var(--color-mist)'}
              opacity={i === 3 ? 0.95 : 0.62 - i * 0.06}
            />
          ))}
          <text
            x={50 + t.w / 2 + 4}
            y={t.y + 8.4}
            fill={i === 3 ? 'var(--color-moss)' : 'var(--color-dust)'}
            fontSize="3.6"
            fontFamily="var(--font-mono)"
          >
            {t.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

const TERMINAL_LINES = [
  '$ discovery run --library commercial --n 17_000_000',
  '  ✓ schema  compounds · properties · vendors',
  '  ✓ reduce  17.0M → 198,412  (coverage 0.94)',
  '  ✓ dock    198,412 poses          [gpu×48]',
  '  ✓ md      1,204 survivors        [aws c7i]',
  '  → hits    12  written to registry',
]

function Terminal() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 p-6 sm:p-10">
      <div className="mb-2 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--color-line-bright)]" />
        ))}
      </div>
      {TERMINAL_LINES.map((l, i) => (
        <p
          key={i}
          className="overflow-hidden font-mono text-[10px] whitespace-nowrap sm:text-xs"
          style={{
            color: i === 0 ? 'var(--color-bone)' : i === 5 ? 'var(--color-moss)' : 'var(--color-mist)',
            animation: `wipe-in 0.5s steps(28) ${0.15 + i * 0.28}s both`,
          }}
        >
          {l}
        </p>
      ))}
    </div>
  )
}

export function Figure({ kind, seed }: { kind: FigureKind; seed: number }) {
  switch (kind) {
    case 'pointcloud':
      return <PointCloud seed={seed} />
    case 'graph':
      return <Graph seed={seed} />
    case 'surface':
      return <Surface seed={seed} />
    case 'helix':
      return <Helix seed={seed} />
    case 'plot':
      return <Plot seed={seed} />
    case 'lattice':
      return <Lattice seed={seed} />
    case 'funnel':
      return <Funnel seed={seed} />
    case 'terminal':
      return <Terminal />
  }
}
