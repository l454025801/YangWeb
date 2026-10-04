/*
 * Chemical-space reduction + diversity sampling · 900×1200 · 5 s
 *
 * draw(t) is a pure function of time, so render.mjs can step through frames
 * exactly. Palette and type mirror src/index.css.
 */
const W = 900
const H = 1200
const DURATION = 5
const TAU = Math.PI * 2

const C = {
  ink: '#0c0e10',
  line: '#1e2226',
  lineBright: '#2b3136',
  bone: '#eceae5',
  mist: '#9aa3a8',
  dust: '#6a7378',
  moss: '#7f9c86',
  steel: '#8fa4b4',
  clay: '#b39a82',
}
const SERIF = '"Instrument Serif", "Times New Roman", serif'
const SANS = 'Sora, ui-sans-serif, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const LABEL = `400 18px ${MONO}`
const SMALL = `400 15px ${MONO}`

/* ---------- math ---------- */
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const prog = (t, a, b) => clamp01((t - a) / (b - a))
const lerp = (a, b, k) => a + (b - a) * k
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const sine = (x) => (1 - Math.cos(Math.PI * x)) / 2

/** CSS cubic-bezier(), solved by bisection. */
function bezier(x1, y1, x2, y2) {
  const f = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2
      if (f(x1, x2, mid) < x) lo = mid
      else hi = mid
    }
    return f(y1, y2, (lo + hi) / 2)
  }
}
/** --ease-soft */
const soft = bezier(0.22, 1, 0.36, 1)

/** Same LCG as src/components/Figure.tsx. */
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const rgbCache = new Map()
function rgb(hex) {
  let v = rgbCache.get(hex)
  if (!v) {
    const n = parseInt(hex.slice(1), 16)
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    rgbCache.set(hex, v)
  }
  return v
}
/** rgba() string; optionally mixes hex toward hex2 by k. */
function rgba(hex, a, hex2, k = 0) {
  const p = rgb(hex)
  const q = hex2 ? rgb(hex2) : p
  const m = (i) => Math.round(p[i] + (q[i] - p[i]) * k)
  return `rgba(${m(0)},${m(1)},${m(2)},${a})`
}

/* ---------- layout (px, on the 900×1200 canvas) ---------- */
const PAD = 72
// The 2-D embedding panel. An 18×12 grid of square cells tiles it exactly.
const MAP = { x: 72, y: 486, w: 756, h: 504 }
const COLS = 18
const ROWS = 12
const CELL = MAP.w / COLS
const CX = MAP.x + MAP.w / 2
const CY = MAP.y + MAP.h / 2

/* ---------- timeline (s) ---------- */
const STEPS = [
  { n: '01', label: 'REDUCE', a: 0.15, b: 2.0, caption: 'Reduce high-dimensional chemical space to a 2-D map' },
  { n: '02', label: 'SAMPLE', a: 2.0, b: 3.45, caption: 'Keep one representative per occupied region' },
  { n: '03', label: 'SCREEN', a: 3.45, b: 4.95, caption: 'Screen the subset instead of the full library' },
]
// Vertical scan line that does the sampling, sweeping a little past both edges.
const SCAN = { a: 2.0, b: 3.4, x0: MAP.x - 40, x1: MAP.x + MAP.w + 40 }
const scanX = (t) => lerp(SCAN.x0, SCAN.x1, sine(prog(t, SCAN.a, SCAN.b)))
/** Time at which the scan line crosses x. */
function crossTime(x) {
  let lo = SCAN.a
  let hi = SCAN.b
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (scanX(mid) < x) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
/* ---------- data ---------- */
// Islands of chemotypes, in panel-relative units: centre, spread, rotation, weight.
const ISLANDS = [
  { u: 0.27, v: 0.48, sx: 0.085, sy: 0.055, r: 0.5, w: 1.0 },
  { u: 0.56, v: 0.38, sx: 0.07, sy: 0.05, r: -0.4, w: 0.8 },
  { u: 0.72, v: 0.64, sx: 0.08, sy: 0.05, r: 0.3, w: 0.9 },
  { u: 0.42, v: 0.72, sx: 0.055, sy: 0.04, r: 0.9, w: 0.55 },
  { u: 0.85, v: 0.27, sx: 0.045, sy: 0.035, r: 0.2, w: 0.4 },
  { u: 0.22, v: 0.25, sx: 0.035, sy: 0.028, r: 0, w: 0.25 },
  { u: 0.12, v: 0.68, sx: 0.03, sy: 0.026, r: 0, w: 0.2 },
  { u: 0.91, v: 0.78, sx: 0.025, sy: 0.022, r: 0, w: 0.12 },
  { u: 0.62, v: 0.19, sx: 0.022, sy: 0.02, r: 0, w: 0.1 },
]
// Sparse filaments connecting islands.
const BRIDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 4],
]
const N = 7000
const R = rng(20240917)
const gauss = () => Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(TAU * R())
const totalW = ISLANDS.reduce((s, d) => s + d.w, 0)
function pickIsland() {
  let r = R() * totalW
  for (let i = 0; i < ISLANDS.length; i++) if ((r -= ISLANDS[i].w) <= 0) return i
  return ISLANDS.length - 1
}
// Where each island sits in the tumbling high-dimensional cloud.
const HOME = ISLANDS.map(() => {
  const th = R() * TAU
  const ph = Math.acos(2 * R() - 1)
  const rad = 70 + R() * 90
  return [rad * Math.sin(ph) * Math.cos(th), rad * Math.cos(ph) * 0.62, rad * Math.sin(ph) * Math.sin(th)]
})
const px = (u, v) => [MAP.x + u * MAP.w, MAP.y + v * MAP.h]
const pts = []
while (pts.length < N) {
  const roll = R()
  let k
  let x
  let y
  let p3
  if (roll < 0.012) {
    // Rare singletons: the outliers a naive random subset would miss.
    k = Math.floor(R() * ISLANDS.length)
    ;[x, y] = px(0.04 + R() * 0.92, 0.06 + R() * 0.88)
    p3 = [(R() - 0.5) * 300, (R() - 0.5) * 180, (R() - 0.5) * 300]
  } else if (roll < 0.08) {
    const [i, j] = BRIDGES[Math.floor(R() * BRIDGES.length)]
    const s = R()
    k = s < 0.5 ? i : j
    const [ax, ay] = px(ISLANDS[i].u, ISLANDS[i].v)
    const [bx, by] = px(ISLANDS[j].u, ISLANDS[j].v)
    x = lerp(ax, bx, s) + gauss() * 9
    y = lerp(ay, by, s) + gauss() * 9
    p3 = HOME[i].map((c, d) => lerp(c, HOME[j][d], s) + gauss() * 12)
  } else {
    k = pickIsland()
    const d = ISLANDS[k]
    const gx = gauss() * d.sx * MAP.w
    const gy = gauss() * d.sy * MAP.w
    const [ox, oy] = px(d.u, d.v)
    x = ox + gx * Math.cos(d.r) - gy * Math.sin(d.r)
    y = oy + gx * Math.sin(d.r) + gy * Math.cos(d.r)
    p3 = HOME[k].map((c) => c + gauss() * 26)
  }
  // Keep a clear strip along the top for the legend and annotation.
  if (x < MAP.x + 6 || x > MAP.x + MAP.w - 6 || y < MAP.y + 52 || y > MAP.y + MAP.h - 6) continue
  pts.push({
    x,
    y,
    p3,
    tone: k % 3,
    r: 1.25 + R() * 1.1,
    a: 0.32 + R() * 0.3,
    // Fade-in rippling out from the centre, then a left-to-right settle into 2-D
    // that finishes before the scan line arrives.
    fade: 0.05 + R() * 0.3 + (Math.hypot(x - CX, y - CY) / 600) * 0.3,
    m0: 0.7 + ((x - MAP.x) / MAP.w) * 0.45 + R() * 0.15,
    md: 0.5 + R() * 0.2,
    cross: crossTime(x),
  })
}
// Diversity sampling: one representative per occupied grid cell, the member
// nearest that cell's centroid.
const cellMembers = new Map()
pts.forEach((p, i) => {
  const key = Math.floor((p.y - MAP.y) / CELL) * COLS + Math.floor((p.x - MAP.x) / CELL)
  if (!cellMembers.has(key)) cellMembers.set(key, [])
  cellMembers.get(key).push(i)
})
const cells = []
const reps = []
for (const [key, idx] of cellMembers) {
  const mx = idx.reduce((s, i) => s + pts[i].x, 0) / idx.length
  const my = idx.reduce((s, i) => s + pts[i].y, 0) / idx.length
  let best = idx[0]
  for (const i of idx) {
    if (Math.hypot(pts[i].x - mx, pts[i].y - my) < Math.hypot(pts[best].x - mx, pts[best].y - my)) best = i
  }
  pts[best].rep = true
  reps.push(best)
  const col = key % COLS
  const row = Math.floor(key / COLS)
  const x = MAP.x + col * CELL
  cells.push({ x, y: MAP.y + row * CELL, cross: crossTime(x + CELL / 2) })
}
window.__stats = { points: pts.length, cells: cells.length, reps: reps.length }

/* ---------- projection ---------- */
const FOCAL = 720
/** Screen position, radius scale and alpha scale of point p at time t. */
function place(p, t) {
  const ang = -0.6 + t * 1.1
  const ca = Math.cos(ang)
  const sa = Math.sin(ang)
  const [hx, hy, hz] = p.p3
  const x1 = hx * ca + hz * sa
  const z1 = -hx * sa + hz * ca
  const tilt = 0.32
  const y2 = hy * Math.cos(tilt) - z1 * Math.sin(tilt)
  const z2 = hy * Math.sin(tilt) + z1 * Math.cos(tilt)
  const s = FOCAL / (FOCAL + z2)
  const depth = clamp01((z2 + 180) / 360) // 0 = near, 1 = far
  const k = inOut(prog(t, p.m0, p.m0 + p.md))
  return {
    x: lerp(CX + x1 * 1.2 * s, p.x, k),
    y: lerp(CY + y2 * s, p.y, k),
    rs: lerp(s * (1.25 - depth * 0.45), 1, k),
    as: lerp(1.15 - depth * 0.7, 1, k),
  }
}
/* ---------- drawing ---------- */
const cvs = document.getElementById('c')
const ctx = cvs.getContext('2d')
const TONES = [C.mist, C.steel, C.dust]
const LEVELS = 20

function text(str, x, y, { font = LABEL, color = C.dust, alpha = 1, align = 'left', ls = 0, to, k } = {}) {
  if (alpha <= 0) return
  ctx.font = font
  ctx.letterSpacing = `${ls}px`
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = rgba(color, alpha, to, k)
  // Canvas letter-spacing trails the last glyph; cancel that for right-aligned text.
  ctx.fillText(str, align === 'right' ? x + ls : x, y)
  ctx.letterSpacing = '0px'
}
/** The site's `rise` keyframe: opacity + 18 CSS px (~26 here) lift, ease-soft. */
function rise(t, start, dur = 0.8) {
  const k = soft(prog(t, start, start + dur))
  return { alpha: k, dy: (1 - k) * 26 }
}

// Library points batched by tone × quantised alpha: a handful of fills per frame.
const buckets = TONES.map(() => Array.from({ length: LEVELS }, () => []))
function drawLibrary(t) {
  buckets.forEach((tone) => tone.forEach((b) => (b.length = 0)))
  for (const p of pts) {
    const intro = soft(prog(t, p.fade, p.fade + 0.7))
    if (intro <= 0) continue
    const pos = place(p, t)
    const dim = lerp(1, p.rep ? 0 : 0.4, soft(prog(t, p.cross, p.cross + 0.35)))
    const a = clamp01(p.a * pos.as * intro * dim)
    const lvl = Math.round(a * (LEVELS - 1))
    if (lvl > 0) buckets[p.tone][lvl].push(pos.x, pos.y, p.r * pos.rs)
  }
  buckets.forEach((tone, ti) =>
    tone.forEach((b, lvl) => {
      if (!b.length) return
      ctx.fillStyle = rgba(TONES[ti], lvl / (LEVELS - 1))
      ctx.beginPath()
      for (let i = 0; i < b.length; i += 3) {
        ctx.moveTo(b[i] + b[i + 2], b[i + 1])
        ctx.arc(b[i], b[i + 1], b[i + 2], 0, TAU)
      }
      ctx.fill()
    }),
  )
}
// Representatives: light up in moss as the scan line reaches them.
function drawReps(t) {
  for (const i of reps) {
    const p = pts[i]
    const lit = soft(prog(t, p.cross, p.cross + 0.5))
    if (lit <= 0) continue
    const r = lerp(p.r, 3.2, lit)
    const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
    halo.addColorStop(0, rgba(C.moss, 0.15 * lit))
    halo.addColorStop(1, rgba(C.moss, 0))
    ctx.fillStyle = halo
    ctx.fillRect(p.x - r * 4, p.y - r * 4, r * 8, r * 8)
    ctx.fillStyle = rgba(C.mist, lerp(p.a, 0.95, lit), C.moss, lit)
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, TAU)
    ctx.fill()
    const ring = prog(t, p.cross, p.cross + 0.45)
    if (ring > 0 && ring < 1) {
      ctx.strokeStyle = rgba(C.moss, 0.5 * (1 - ring))
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4 + soft(ring) * 12, 0, TAU)
      ctx.stroke()
    }
  }
}

function drawBeam(t) {
  const on = prog(t, SCAN.a, SCAN.a + 0.15) * (1 - prog(t, SCAN.b - 0.15, SCAN.b))
  if (on <= 0) return
  const x = scanX(t)
  const trail = ctx.createLinearGradient(x - 110, 0, x, 0)
  trail.addColorStop(0, rgba(C.moss, 0))
  trail.addColorStop(1, rgba(C.moss, 0.1 * on))
  ctx.fillStyle = trail
  ctx.fillRect(x - 110, MAP.y, 110, MAP.h)
  ctx.fillStyle = rgba(C.moss, 0.85 * on)
  ctx.fillRect(x - 0.75, MAP.y, 1.5, MAP.h)
}

// Sampling grid: occupied cells flash as the scan passes, leaving a faint footprint.
function drawGrid(t) {
  for (const c of cells) {
    const since = t - c.cross
    if (since < 0) continue
    const a = 0.045 + 0.14 * Math.exp(-since / 0.16)
    ctx.fillStyle = rgba(C.moss, a)
    ctx.fillRect(c.x + 1, c.y + 1, CELL - 2, CELL - 2)
  }
  const g = soft(prog(t, 1.75, 2.25)) * lerp(1, 0.45, soft(prog(t, 3.5, 4.3)))
  if (g <= 0) return
  ctx.strokeStyle = rgba(C.lineBright, 0.9 * g)
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 1; i < COLS; i++) {
    ctx.moveTo(Math.round(MAP.x + i * CELL) + 0.5, MAP.y)
    ctx.lineTo(Math.round(MAP.x + i * CELL) + 0.5, MAP.y + MAP.h)
  }
  for (let j = 1; j < ROWS; j++) {
    ctx.moveTo(MAP.x, Math.round(MAP.y + j * CELL) + 0.5)
    ctx.lineTo(MAP.x + MAP.w, Math.round(MAP.y + j * CELL) + 0.5)
  }
  ctx.stroke()
}
function dot(x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

// Panel frame (corner ticks like the site's slider), axes, legend, annotation.
function drawChrome(t) {
  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  ctx.strokeRect(MAP.x + 0.5, MAP.y + 0.5, MAP.w - 1, MAP.h - 1)
  ctx.strokeStyle = rgba(C.dust, 0.7)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (const [x, y, dx, dy] of [
    [MAP.x, MAP.y, 1, 1],
    [MAP.x + MAP.w, MAP.y, -1, 1],
    [MAP.x, MAP.y + MAP.h, 1, -1],
    [MAP.x + MAP.w, MAP.y + MAP.h, -1, -1],
  ]) {
    ctx.moveTo(x + dx * 18, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * 18)
  }
  ctx.stroke()

  const ax = rise(t, 1.65)
  text('DIM 1 →', MAP.x + MAP.w, MAP.y + MAP.h + 30 + ax.dy, { font: SMALL, alpha: ax.alpha, align: 'right', ls: 3 })
  ctx.save()
  ctx.translate(MAP.x - 16, MAP.y)
  ctx.rotate(-Math.PI / 2)
  text('DIM 2 →', 0, 0, { font: SMALL, alpha: ax.alpha, align: 'right', ls: 3 })
  ctx.restore()

  const lg = rise(t, 2.05)
  const ly = MAP.y + 32 + lg.dy
  dot(MAP.x + 22, ly - 5, 3, rgba(C.mist, 0.6 * lg.alpha))
  text('LIBRARY', MAP.x + 37, ly, { font: SMALL, alpha: lg.alpha, ls: 3 })
  dot(MAP.x + 164, ly - 5, 3.4, rgba(C.moss, lg.alpha))
  text('SUBSET', MAP.x + 179, ly, { font: SMALL, color: C.moss, alpha: lg.alpha, ls: 3 })

  const an = rise(t, 3.5)
  text('DIVERSITY PRESERVED', MAP.x + MAP.w - 22, MAP.y + 32 + an.dy, {
    font: SMALL,
    color: C.moss,
    alpha: an.alpha,
    align: 'right',
    ls: 3,
  })
}
// 01 REDUCE · 02 SAMPLE · 03 SCREEN, with progress bars like the slider's tabs.
const COLW = (W - PAD * 2 - 48) / 3
function drawStepper(t) {
  const r = rise(t, 0)
  STEPS.forEach((s, i) => {
    const x = PAD + i * (COLW + 24)
    const on = soft(prog(t, s.a - 0.1, s.a + 0.2))
    const done = i < STEPS.length - 1 ? soft(prog(t, s.b, s.b + 0.3)) : 0
    text(s.n, x, 168 + r.dy, { color: C.moss, alpha: r.alpha, ls: 2 })
    text(s.label, x + 44, 168 + r.dy, { to: C.bone, k: on * (1 - 0.4 * done), alpha: r.alpha, ls: 3.6 })
    ctx.fillStyle = rgba(C.line, r.alpha)
    ctx.fillRect(x, 188, COLW, 3)
    const fill = prog(t, s.a, s.b)
    if (fill > 0) {
      ctx.fillStyle = rgba(C.moss, lerp(1, 0.35, done))
      ctx.fillRect(x, 188, COLW * fill, 3)
    }
  })
}

function drawCaption(t) {
  STEPS.forEach((s, i) => {
    const next = STEPS[i + 1]
    const inn = soft(prog(t, s.a, s.a + 0.7))
    const out = next ? soft(prog(t, next.a - 0.2, next.a + 0.05)) : 0
    text(s.caption, PAD, 252 + (1 - inn) * 26 - out * 10, {
      font: `300 23px ${SANS}`,
      color: C.mist,
      alpha: inn * (1 - out),
      ls: -0.25,
    })
  })
}
// Molecule count (order of magnitude) and screening cost, both driven by the scan.
const BIG = `400 92px ${SERIF}`
const SUP = `400 48px ${SERIF}`
function drawHud(t) {
  const k = inOut(prog(t, SCAN.a + 0.05, SCAN.b))
  const swap = soft(prog(t, 3.3, 3.75))

  const l = rise(t, 0.12)
  const ly = 404 + l.dy
  text('MOLECULES', PAD, 312 + l.dy, { alpha: l.alpha, ls: 3.6 })
  text('10', PAD, ly, { font: BIG, color: C.bone, alpha: l.alpha })
  ctx.font = BIG
  const ex = PAD + ctx.measureText('10').width + 4
  // Exponent rolls 6 → 3 like an odometer.
  const e = lerp(6, 3, k)
  const top = Math.ceil(e - 1e-9)
  const f = inOut(top - e)
  ctx.save()
  ctx.beginPath()
  ctx.rect(ex - 4, ly - 82, 64, 64)
  ctx.clip()
  text(String(top), ex, ly - 42 - f * 64, { font: SUP, color: C.bone, alpha: l.alpha })
  if (f > 0) text(String(top - 1), ex, ly - 42 + (1 - f) * 64, { font: SUP, color: C.bone, alpha: l.alpha })
  ctx.restore()
  // Sub-label clears while the count is mid-roll, so it never contradicts the exponent.
  const sy = 454 + l.dy
  const clear = soft(prog(t, 2.05, 2.3))
  text('MILLIONS · FULL LIBRARY', PAD, sy - clear * 8, { font: SMALL, alpha: l.alpha * (1 - clear), ls: 3 })
  text('THOUSANDS · DIVERSE SUBSET', PAD, sy + (1 - swap) * 8, {
    font: SMALL,
    color: C.moss,
    alpha: l.alpha * swap,
    ls: 3,
  })

  const r = rise(t, 0.2)
  const RX = W - PAD
  const ry = 404 + r.dy
  text('SCREENING COST', RX, 312 + r.dy, { alpha: r.alpha, align: 'right', ls: 3.6 })
  ctx.font = `300 34px ${SANS}`
  const pw = ctx.measureText('%').width
  text('%', RX, ry, { font: `300 34px ${SANS}`, color: C.moss, alpha: r.alpha, align: 'right' })
  text(String(Math.round(lerp(100, 20, k))), RX - pw - 6, ry, { font: BIG, color: C.bone, alpha: r.alpha, align: 'right' })
  const BW = 300
  const frac = lerp(1, 0.2, k)
  ctx.fillStyle = rgba(C.line, r.alpha)
  ctx.fillRect(RX - BW, ry + 20, BW, 3)
  ctx.fillStyle = rgba(C.bone, 0.85 * r.alpha, C.moss, k)
  ctx.fillRect(RX - BW * frac, ry + 20, BW * frac, 3)
  const tg = rise(t, 3.4)
  text('~80% SAVED', RX, 454 + tg.dy, { font: SMALL, color: C.moss, alpha: tg.alpha * r.alpha, align: 'right', ls: 3 })
}
/* ---------- frame ---------- */
function draw(t) {
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.beginPath()
  ctx.rect(MAP.x, MAP.y, MAP.w, MAP.h)
  ctx.clip()
  drawGrid(t)
  drawLibrary(t)
  drawReps(t)
  drawBeam(t)
  ctx.restore()
  drawChrome(t)
  drawStepper(t)
  drawCaption(t)
  drawHud(t)
}

// Wait for the site's three faces (including the glyphs used here) before drawing.
window.ready = Promise.all([
  document.fonts.load(LABEL, 'REDUCE 0123456789 ·→~%'),
  document.fonts.load(BIG, '0123456789'),
  document.fonts.load(`300 23px ${SANS}`, 'Reduce high-dimensional %'),
])
  .then(() => document.fonts.ready)
  .then(() => {
    window.renderFrame = draw
    window.DURATION = DURATION
    window.__fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
    if (new URLSearchParams(location.search).has('render')) return
    // Preview: play, hold the last frame briefly, repeat.
    const t0 = performance.now()
    const loop = (now) => {
      draw(Math.min(DURATION, ((now - t0) / 1000) % (DURATION + 1.2)))
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  })
