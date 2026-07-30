import { useEffect, useState } from 'react'
import { PROFILE, WORKS } from '../content'

const ITEMS = [...WORKS.map((w) => ({ id: w.id, label: w.kicker })), { id: 'about', label: 'Personal' }]

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { threshold: [0.2, 0.5], rootMargin: '-20% 0px -40% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700"
      style={{
        backgroundColor: solid
          ? 'color-mix(in oklab, var(--color-void) 82%, transparent)'
          : 'transparent',
        backdropFilter: solid ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${solid ? 'var(--color-line)' : 'transparent'}`,
      }}
    >
      <div className="mx-auto flex w-full max-w-[104rem] items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a href="#top" className="group flex items-baseline gap-3">
          <span className="font-display text-lg tracking-[-0.01em] text-[var(--color-bone)]">
            {PROFILE.name}
          </span>
          <span className="label-mono hidden transition-colors group-hover:text-[var(--color-mist)] sm:inline">
            {PROFILE.suffix}
          </span>
        </a>

        <nav aria-label="Sections">
          <ul className="flex items-center gap-5 sm:gap-8">
            {ITEMS.map((item) => (
              <li key={item.id} className="hidden md:block">
                <a
                  href={`#${item.id}`}
                  className="relative font-mono text-[10px] tracking-[0.16em] uppercase transition-colors duration-400"
                  style={{
                    color: active === item.id ? 'var(--color-bone)' : 'var(--color-dust)',
                  }}
                >
                  {item.label}
                  <span
                    className="absolute -bottom-1.5 left-0 h-px bg-[var(--color-moss)] transition-[width] duration-500 ease-[var(--ease-soft)]"
                    style={{ width: active === item.id ? '100%' : '0%' }}
                  />
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${PROFILE.email}`}
                className="border border-[var(--color-line-bright)] px-3.5 py-2 font-mono text-[10px] tracking-[0.16em] text-[var(--color-mist)] uppercase transition-colors duration-400 hover:border-[var(--color-moss)] hover:text-[var(--color-bone)]"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
