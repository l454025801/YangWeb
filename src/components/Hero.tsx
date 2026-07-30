import { useEffect, useRef } from 'react'
import { PROFILE, STATS } from '../content'
import { usePrefersReducedMotion } from '../hooks'

/**
 * Canvas backdrop: a slowly rotating molecular point field.
 * Swap for a real video by setting HERO_VIDEO to a file in /public/media.
 */
const HERO_VIDEO: string | null = null

function MolecularField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    type P = { x: number; y: number; z: number }
    const N = 340
    const pts: P[] = Array.from({ length: N }, () => {
      // Fibonacci-ish shell so the cloud reads as a structure, not noise.
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const r = Math.cbrt(Math.random()) * 0.9 + 0.1
      const s = Math.sqrt(1 - u * u)
      return { x: s * Math.cos(t) * r, y: u * r, z: s * Math.sin(t) * r }
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let angle = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const cx = w * 0.62
      const cy = h * 0.5
      const scale = Math.min(w, h) * 0.55

      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const projected = pts
        .map((p) => {
          const x = p.x * cos - p.z * sin
          const z = p.x * sin + p.z * cos
          const persp = 1 / (2.4 - z)
          return { sx: cx + x * scale * persp * 1.65, sy: cy + p.y * scale * persp * 1.65, z, persp }
        })
        .sort((a, b) => a.z - b.z)

      // bonds between near neighbours
      ctx.lineWidth = 0.6
      for (let i = 0; i < projected.length; i += 2) {
        for (let j = i + 1; j < Math.min(i + 11, projected.length); j++) {
          const dx = projected[i].sx - projected[j].sx
          const dy = projected[i].sy - projected[j].sy
          const d2 = dx * dx + dy * dy
          if (d2 < 4900) {
            ctx.strokeStyle = `rgba(160,172,178,${0.2 * (1 - d2 / 4900)})`
            ctx.beginPath()
            ctx.moveTo(projected[i].sx, projected[i].sy)
            ctx.lineTo(projected[j].sx, projected[j].sy)
            ctx.stroke()
          }
        }
      }

      for (const p of projected) {
        const depth = (p.z + 1) / 2
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 0.7 + depth * 2.1, 0, Math.PI * 2)
        ctx.fillStyle =
          depth > 0.74
            ? `rgba(141,175,152,${0.4 + depth * 0.5})`
            : `rgba(236,234,229,${0.16 + depth * 0.45})`
        ctx.fill()
      }

      angle += 0.0013
      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
}

export function Hero() {
  return (
    <section id="top" className="grain relative min-h-svh overflow-hidden">
      {/* background layer */}
      <div className="absolute inset-0 -z-10">
        {HERO_VIDEO ? (
          <video
            className="h-full w-full object-cover opacity-45"
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ animation: 'drift 26s ease-in-out infinite' }}
          >
            <MolecularField />
          </div>
        )}
        <div
          aria-hidden
          className="hairline-grid absolute inset-0 opacity-40"
          style={{
            maskImage: 'radial-gradient(80% 60% at 30% 40%, black, transparent 75%)',
          }}
        />
        {/* scrim: heavier on small screens where text sits over the field */}
        <div
          aria-hidden
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in oklab, var(--color-void) 88%, transparent) 0%, color-mix(in oklab, var(--color-void) 74%, transparent) 60%, var(--color-void) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(100deg, var(--color-void) 2%, color-mix(in oklab, var(--color-void) 82%, transparent) 34%, color-mix(in oklab, var(--color-void) 30%, transparent) 62%, transparent 88%), linear-gradient(to top, var(--color-void) 1%, transparent 26%)',
          }}
        />
      </div>

      {/* content */}
      <div className="relative mx-auto flex min-h-svh w-full max-w-[104rem] flex-col justify-between px-6 pt-28 pb-10 sm:px-10 lg:px-16">
        <div className="grid flex-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-6">
            <p className="label-mono rise" style={{ animationDelay: '0.05s' }}>
              {PROFILE.role} — {PROFILE.org}
            </p>

            <h1 className="rise mt-7 font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.92] tracking-[-0.03em] text-[var(--color-bone)]" style={{ animationDelay: '0.14s' }}>
              {PROFILE.name}
              <span className="ml-3 align-top font-sans text-[0.18em] font-light tracking-[0.28em] text-[var(--color-dust)]">
                {PROFILE.suffix}
              </span>
            </h1>

            <div
              aria-hidden
              className="mt-8 h-px w-full max-w-md bg-gradient-to-r from-[var(--color-moss)] via-[var(--color-line-bright)] to-transparent"
              style={{ animation: 'wipe-in 1.4s var(--ease-soft) 0.5s both' }}
            />

            <p
              className="rise mt-8 max-w-xl text-[1.0625rem] leading-[1.65] text-[var(--color-bone)]/85 sm:text-lg"
              style={{ animationDelay: '0.3s' }}
            >
              {PROFILE.intro}
            </p>
            <p
              className="rise mt-5 max-w-xl text-sm leading-[1.75] text-[var(--color-mist)]"
              style={{ animationDelay: '0.4s' }}
            >
              {PROFILE.sub}
            </p>

            {/* links */}
            <ul
              className="rise mt-11 flex flex-wrap gap-x-8 gap-y-4"
              style={{ animationDelay: '0.52s' }}
            >
              {PROFILE.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                    className="group inline-flex items-baseline gap-2.5"
                  >
                    <span className="relative text-sm text-[var(--color-bone)] transition-colors group-hover:text-[var(--color-moss)]">
                      {l.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--color-moss)] transition-[width] duration-500 ease-[var(--ease-soft)] group-hover:w-full" />
                    </span>
                    <span className="label-mono transition-colors group-hover:text-[var(--color-mist)]">
                      {l.hint}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* stat strip */}
        <div
          className="rise mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--color-line)] pt-8 lg:grid-cols-4"
          style={{ animationDelay: '0.66s' }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl leading-none text-[var(--color-bone)] sm:text-4xl">
                {s.value}
              </p>
              <p className="label-mono mt-2">{s.label}</p>
              <p className="mt-1.5 text-xs leading-snug text-[var(--color-dust)]">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
