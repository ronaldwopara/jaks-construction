import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getServiceBySlug } from './services'

function withWidth(url, width) {
  try {
    const u = new URL(url)
    u.searchParams.set('w', String(width))
    return u.toString()
  } catch {
    return url
  }
}

export default function Gallery() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const service = useMemo(() => getServiceBySlug(slug), [slug])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!service) {
      navigate('/', { replace: true })
    }
  }, [service, navigate])

  useEffect(() => {
    if (!selected) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    if (selected) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [selected])

  if (!service) return null

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-20 pt-28 md:px-12 md:pb-28">
      <div className="mb-10 flex items-center justify-between gap-6">
        <button
          type="button"
          className="group inline-flex items-center gap-3 border border-black/20 bg-white/70 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-black/80 transition-colors hover:border-[#FF1E56] hover:text-black"
          data-cursor="hover"
          onClick={() => navigate('/', { state: { scrollTo: 'expertise' } })}
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Back
        </button>
        <Link
          to="/#contact"
          className="liquid-cta group relative hidden items-center gap-3 overflow-hidden border border-black/20 bg-white/70 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-black/80 transition-colors hover:border-[#FF1E56] hover:text-black md:inline-flex"
        >
          Start project
          <ArrowUpRight size={14} className="transition-transform group-hover:rotate-45" aria-hidden />
        </Link>
      </div>

      <header className="mb-10">
        <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.6em] text-[#FF1E56]">GALLERY</span>
        <h1 className="font-monumental text-4xl uppercase leading-[0.9] tracking-tight text-black md:text-6xl">
          {service.title}
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] font-light leading-relaxed text-black/70 md:text-[17px]">
          A focused set of recent work. Tap an image to isolate it.
        </p>
      </header>

      <section
        className={`relative ${selected ? 'opacity-55' : 'opacity-100'} transition-opacity duration-300`}
        aria-hidden={!!selected}
      >
        {/* Desktop: 5-row grid (auto-flow columns) */}
        <div className="hidden gap-4 md:grid md:grid-flow-col md:grid-rows-5 md:auto-cols-[minmax(0,1fr)]">
          {service.images.map((src) => (
            <button
              key={src}
              type="button"
              className="group relative overflow-hidden border border-black/20 bg-white shadow-sm shadow-black/5"
              onClick={() => setSelected(src)}
              data-cursor="view"
            >
              <img
                src={withWidth(src, 700)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover grayscale brightness-[0.65] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>

        {/* Mobile: sharp 2-col grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {service.images.map((src) => (
            <button
              key={src}
              type="button"
              className="group relative aspect-[4/3] overflow-hidden border border-black/20 bg-white shadow-sm shadow-black/5"
              onClick={() => setSelected(src)}
            >
              <img
                src={withWidth(src, 520)}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover grayscale brightness-[0.65] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-active:scale-[0.99]"
              />
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setSelected(null)}
          role="button"
          tabIndex={0}
          data-cursor="exit"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setSelected(null)
          }}
          aria-label="Close image"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden />
          <img
            src={withWidth(selected, 1600)}
            alt=""
            className="max-h-[85vh] max-w-[85vw] object-contain shadow-[0_20px_100px_rgba(0,0,0,0.55)]"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
      ) : null}
    </main>
  )
}

