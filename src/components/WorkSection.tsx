import type { Work } from '../content'
import { Slider } from './Slider'
import { useReveal } from '../hooks'

export function WorkSection({ work, order }: { work: Work; order: number }) {
  const { ref, shown } = useReveal<HTMLElement>()
  const flip = order % 2 === 1

  return (
    <section
      ref={ref}
      id={work.id}
      data-shown={shown}
      className="reveal relative scroll-mt-20 border-t border-[var(--color-line)] py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[104rem] px-6 sm:px-10 lg:px-16">
        {/* section header */}
        <div className="flex items-baseline gap-6 border-b border-[var(--color-line)] pb-6">
          <span className="font-mono text-xs text-[var(--color-moss)]">{work.index}</span>
          <span className="label-mono">{work.kicker}</span>
          <span aria-hidden className="ml-auto hidden h-px flex-1 bg-[var(--color-line)] sm:block" />
        </div>

        <div
          className={`mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16 ${
            flip ? '' : ''
          }`}
        >
          {/* text column */}
          <div className={`lg:col-span-6 xl:col-span-6 ${flip ? 'lg:order-2' : ''}`}>
            <h2 className="font-display text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[0.98] tracking-[-0.025em] text-[var(--color-bone)]">
              {work.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-[var(--color-mist)] sm:text-[1.0625rem]">
              {work.lede}
            </p>

            <ul className="mt-12 space-y-0">
              {work.bullets.map((b, i) => (
                <li
                  key={i}
                  className="group grid grid-cols-[2.5rem_1fr] gap-1 border-t border-[var(--color-line)] py-5 transition-colors duration-500 hover:border-[var(--color-line-bright)]"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  <span className="font-mono text-[10px] leading-6 text-[var(--color-dust)] transition-colors duration-500 group-hover:text-[var(--color-moss)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-2xl text-[0.9375rem] leading-[1.7] text-[var(--color-bone)]/80 transition-colors duration-500 group-hover:text-[var(--color-bone)]">
                    {b}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* media column */}
          <div className={`lg:col-span-6 xl:col-span-5 ${flip ? 'lg:order-1' : 'xl:col-start-8'}`}>
            <div className="lg:sticky lg:top-24">
              <Slider slides={work.slides} seedBase={order + 3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
