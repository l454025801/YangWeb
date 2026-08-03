import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Personal } from './components/Personal'
import { WorkSection } from './components/WorkSection'
import { PROFILE, WORKS } from './content'

function Interlude() {
  return (
    <div className="relative overflow-hidden border-t border-[var(--color-line)] py-6">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-10 whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex gap-10" aria-hidden={dup === 1}>
            {PROFILE.marquee.map((m) => (
              <span key={m} className="flex items-center gap-10">
                <span className="font-display text-xl text-[var(--color-dust)] italic sm:text-2xl">
                  {m}
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-moss)] opacity-60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)]">
      <div className="mx-auto flex w-full max-w-[104rem] flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-10 lg:px-16">
        <p className="label-mono">
          © {new Date().getFullYear()} {PROFILE.name} — {PROFILE.role}
        </p>
        <a
          href="#top"
          className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-[var(--color-dust)] uppercase transition-colors hover:text-[var(--color-bone)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M5 9V1M1.5 4.5 5 1l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="square"
            />
          </svg>
          Back to top
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {/* <Interlude /> */}
        {WORKS.map((work, i) => (
          <WorkSection key={work.id} work={work} order={i} />
        ))}
        <Personal />
      </main>
      <Footer />
    </>
  )
}
