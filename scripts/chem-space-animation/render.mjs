/**
 * Renders index.html frame-by-frame in headless Chrome and encodes an MP4.
 *
 * One-off tooling, intentionally not in package.json (keeps CI installs lean):
 *   npm install --no-save playwright-core@1.63.0 ffmpeg-static@5.3.0
 *   node scripts/chem-space-animation/render.mjs              -> public/media/chem-space.mp4
 *   node scripts/chem-space-animation/render.mjs --stills 1,2.5,4.9  -> PNG stills for review
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import ffmpegPath from 'ffmpeg-static'

const FPS = 30
const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../../public/media/chem-space.mp4')
const stillsArg = process.argv.indexOf('--stills')
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(',').map(Number) : null

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
page.on('pageerror', (e) => console.error('page error:', e.message))
await page.goto(`${pathToFileURL(resolve(here, 'index.html')).href}?render`)
await page.evaluate(() => window.ready)
const info = await page.evaluate(() => ({ fonts: window.__fonts, stats: window.__stats }))
console.log('fonts loaded:', [...new Set(info.fonts)].join(', '))
console.log('data:', info.stats)

const grab = (t) =>
  page.evaluate((t) => {
    window.renderFrame(t)
    return document.getElementById('c').toDataURL('image/png').split(',')[1]
  }, t)

if (stills) {
  for (const t of stills) {
    const file = resolve(here, `still-${t}.png`)
    writeFileSync(file, Buffer.from(await grab(t), 'base64'))
    console.log('wrote', file)
  }
} else {
  mkdirSync(dirname(out), { recursive: true })
  const duration = await page.evaluate(() => window.DURATION)
  const frames = Math.round(duration * FPS)
  // prettier-ignore
  const ff = spawn(ffmpegPath, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const done = new Promise((ok, fail) => ff.on('close', (c) => (c === 0 ? ok() : fail(new Error(`ffmpeg ${c}`)))))
  const started = Date.now()
  for (let i = 0; i < frames; i++) {
    const buf = Buffer.from(await grab(i / FPS), 'base64')
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  ff.stdin.end()
  await done
  console.log(`wrote ${out} · ${frames} frames · ${((Date.now() - started) / 1000).toFixed(1)}s`)
}
await browser.close()
