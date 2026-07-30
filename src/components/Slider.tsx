import { useRef } from 'react'
import type { Slide } from '../content'
import { Figure } from './Figure'
import { useAutoplay, useInView } from '../hooks'

const INTERVAL = 5200

export function Slider({ slides, seedBase }: { slides: Slide[]; seedBase: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { index, goTo, next, prev, running, setPaused } = useAutoplay(
    slides.length,
    INTERVAL,
    inView,
  )
  const touchX = useRef<number | null>(null)

  const active = slides[index]

  return (
    <div
      ref={ref}
      className="group/slider relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 42) (dx < 0 ? next : prev)()
        touchX.current = null
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Project visuals"
    >
      {/* frame */}
      <div className="relative aspect-4/5 overflow-hidden border border-[var(--color-line)] bg-[var(--color-ink)] sm:aspect-square lg:aspect-4/5">
        {/* corner ticks */}
        {['left-0 top-0', 'right-0 top-0', 'left-0 bottom-0', 'right-0 bottom-0'].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute ${pos} z-20 h-3 w-3 border-[var(--color-line-bright)] opacity-70`}
            style={{
              borderTopWidth: pos.includes('top') ? 1 : 0,
              borderBottomWidth: pos.includes('bottom') ? 1 : 0,
              borderLeftWidth: pos.includes('left') ? 1 : 0,
              borderRightWidth: pos.includes('right') ? 1 : 0,
            }}
          />
        ))}

        {slides.map((slide, i) => {
          const isActive = i === index
          return (
            <div
              key={i}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-soft)] will-change-transform"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.03)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {slide.src ? (
                slide.kind === 'video' ? (
                  <video
                    className="h-full w-full object-cover opacity-90"
                    src={slide.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    className="h-full w-full object-cover opacity-90"
                    src={slide.src}
                    alt={slide.caption}
                    loading="lazy"
                  />
                )
              ) : (
                <div className="grain hairline-grid h-full w-full bg-[var(--color-ink)]">
                  <div className="h-full w-full p-4 sm:p-6">
                    <Figure kind={slide.figure} seed={seedBase * 97 + i * 31 + 7} />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 0%, transparent 40%, color-mix(in oklab, var(--color-void) 78%, transparent) 100%)',
          }}
        />

        {/* stat overlay */}
        {active.stat && (
          <div key={index} className="absolute bottom-0 left-0 z-20 p-5 sm:p-7">
            <p
              className="font-display text-4xl leading-none text-[var(--color-bone)] sm:text-5xl"
              style={{ animation: 'rise 0.8s var(--ease-soft) both' }}
            >
              {active.stat.value}
              {active.stat.unit && (
                <span className="ml-0.5 font-sans text-lg font-light text-[var(--color-moss)]">
                  {active.stat.unit}
                </span>
              )}
            </p>
            <p
              className="label-mono mt-1.5"
              style={{ animation: 'rise 0.8s var(--ease-soft) 0.08s both' }}
            >
              {active.stat.note}
            </p>
          </div>
        )}

        {/* arrows */}
        <div className="absolute top-1/2 right-3 z-20 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-opacity duration-500 group-hover/slider:opacity-100 focus-within:opacity-100">
          {(
            [
              ['prev', prev, 'M7 2 3 6l4 4'],
              ['next', next, 'M5 2l4 4-4 4'],
            ] as const
          ).map(([name, fn, d]) => (
            <button
              key={name}
              type="button"
              onClick={fn}
              aria-label={`${name === 'prev' ? 'Previous' : 'Next'} slide`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[var(--color-line-bright)] bg-[color-mix(in_oklab,var(--color-void)_70%,transparent)] text-[var(--color-mist)] backdrop-blur transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-bone)]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* caption + progress */}
      <div className="mt-5 flex items-start justify-between gap-6">
        <p
          key={index}
          className="max-w-md text-[0.8rem] leading-relaxed text-[var(--color-mist)]"
          style={{ animation: 'rise 0.7s var(--ease-soft) both' }}
        >
          {active.caption}
        </p>
        <span className="label-mono shrink-0 pt-0.5">
          {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Choose slide">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.caption}
            onClick={() => goTo(i)}
            className="group/tab relative h-[3px] flex-1 cursor-pointer bg-[var(--color-line)] transition-colors hover:bg-[var(--color-line-bright)]"
          >
            <span
              key={i === index ? `on-${index}-${running}` : 'off'}
              className="absolute inset-y-0 left-0 bg-[var(--color-moss)]"
              style={
                i === index
                  ? running
                    ? { animation: `progress ${INTERVAL}ms linear both` }
                    : { width: '100%' }
                  : { width: i < index ? '100%' : '0%', opacity: i < index ? 0.28 : 0 }
              }
            />
          </button>
        ))}
      </div>
    </div>
  )
}
