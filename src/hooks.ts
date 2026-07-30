import { useEffect, useRef, useState } from 'react'

/** Adds data-shown="true" once the element scrolls into view. */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown, threshold])

  return { ref, shown }
}

/** True while the element is anywhere near the viewport. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, inView }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Autoplaying index with pause support. Advances only while `active`.
 * Returns the current index plus manual controls that reset the timer.
 */
export function useAutoplay(count: number, interval: number, active: boolean) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const reduced = usePrefersReducedMotion()
  const running = active && !paused && !reduced && count > 1

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearTimeout(id)
  }, [running, index, count, interval, tick])

  const goTo = (i: number) => {
    setIndex(((i % count) + count) % count)
    setTick((t) => t + 1)
  }

  return {
    index,
    goTo,
    next: () => goTo(index + 1),
    prev: () => goTo(index - 1),
    running,
    setPaused,
    paused: paused || reduced,
  }
}
