import { PERSONAL, PROFILE } from '../content'
import { useReveal } from '../hooks'

export function Personal() {
  const { ref, shown } = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      id="about"
      data-shown={shown}
      className="reveal grain relative scroll-mt-20 border-t border-[var(--color-line)] py-24 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-50"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--color-moss) 9%, transparent), transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[104rem] px-6 sm:px-10 lg:px-16">
        <div className="flex items-baseline gap-6 border-b border-[var(--color-line)] pb-6">
          <span className="font-mono text-xs text-[var(--color-moss)]">05</span>
          <span className="label-mono">Personal</span>
        </div>

        <div className="mt-12 grid gap-16 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[0.98] tracking-[-0.025em] text-[var(--color-bone)]">
              {PERSONAL.heading}
            </h2>
            <div className="mt-8 space-y-5">
              {PERSONAL.body.map((p, i) => (
                <p key={i} className="max-w-xl text-[0.9375rem] leading-[1.8] text-[var(--color-mist)]">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-12">
              <p className="label-mono">Toolbox</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PERSONAL.toolbox.map((t) => (
                  <li
                    key={t}
                    className="border border-[var(--color-line)] px-2.5 py-1 font-mono text-[10px] tracking-wide text-[var(--color-mist)] transition-colors duration-400 hover:border-[var(--color-moss)] hover:text-[var(--color-bone)]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 space-y-6">
              <p className="label-mono">Education</p>
              {PERSONAL.education.map((e) => (
                <div key={e.school} className="border-t border-[var(--color-line)] pt-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm text-[var(--color-bone)]">{e.degree}</p>
                    <span className="font-mono text-[10px] text-[var(--color-dust)]">{e.years}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-mist)]">{e.school}</p>
                  {e.note && (
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-dust)]">{e.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <p className="label-mono">Selected publications</p>
            <ol className="mt-5">
              {PERSONAL.selected.map((p, i) => (
                <li key={i} className="border-t border-[var(--color-line)]">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group block py-5"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] text-[var(--color-dust)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="text-[0.9375rem] leading-[1.55] text-[var(--color-bone)]/85 transition-colors duration-400 group-hover:text-[var(--color-bone)]">
                          {p.cite}
                        </p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-display text-sm italic text-[var(--color-steel)]">
                            {p.venue}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-dust)]">
                            {p.year}
                          </span>
                          {p.note && (
                            <span className="border border-[var(--color-line-bright)] px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-[var(--color-moss)]">
                              {p.note}
                            </span>
                          )}
                        </p>
                      </div>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        fill="none"
                        aria-hidden
                        className="mt-1 shrink-0 text-[var(--color-dust)] transition-all duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-moss)]"
                      >
                        <path
                          d="M2 9 9 2M9 2H3.5M9 2v5.5"
                          stroke="currentColor"
                          strokeWidth="1.1"
                          strokeLinecap="square"
                        />
                      </svg>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-[var(--color-line)] pt-5 text-xs text-[var(--color-dust)]">
              13 publications total, including four in review and five in preparation.
            </p>

            {/* contact card */}
            <div className="mt-14 border border-[var(--color-line)] bg-[var(--color-panel)] p-7">
              <p className="label-mono">Get in touch</p>
              <a
                href={`mailto:${PROFILE.email}`}
                className="group mt-4 block font-display text-2xl leading-tight tracking-[-0.01em] text-[var(--color-bone)] transition-colors hover:text-[var(--color-moss)] sm:text-[1.75rem]"
              >
                {PROFILE.email}
              </a>
              <p className="mt-3 font-mono text-xs text-[var(--color-dust)]">{PROFILE.phone}</p>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                {PROFILE.links.slice(0, 3).map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-mist)] uppercase transition-colors hover:text-[var(--color-bone)]"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
