import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Menu, X, ArrowUpRight, Star, Phone, Mail, MapPin } from 'lucide-react'
import HeroCanvas from './HeroCanvas'

const observerMap = new Map()

function getSharedObserver(options) {
  const key = `${options.threshold ?? 0.1}|${options.rootMargin ?? '0px'}`
  if (!observerMap.has(key)) {
    const callbacks = new Map()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = callbacks.get(entry.target)
          if (cb) {
            cb()
            callbacks.delete(entry.target)
            observer.unobserve(entry.target)
          }
        }
      }
    }, { threshold: options.threshold ?? 0.1, rootMargin: options.rootMargin ?? '0px' })
    observerMap.set(key, { observer, callbacks })
  }
  return observerMap.get(key)
}

function useInView({ threshold = 0.1, rootMargin = '0px', enabled = true } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const { observer, callbacks } = getSharedObserver({ threshold, rootMargin })
    callbacks.set(el, () => setIsVisible(true))
    observer.observe(el)
    return () => {
      callbacks.delete(el)
      observer.unobserve(el)
    }
  }, [enabled, threshold, rootMargin])

  return [ref, isVisible]
}

// Grain texture (data-URL SVG must apply the filter to a rect or nothing shows)
const FilmGrain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[999] opacity-[0.05] mix-blend-screen"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '150px 150px',
    }}
    aria-hidden
  />
)

const TiltSlab = ({ children }) => {
  const ref = useRef(null)
  const [style, setStyle] = useState({})

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height
    const rotateX = (0.5 - y) * 14
    const rotateY = (x - 0.5) * 14

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(1200px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`,
      transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
    })
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className="h-full w-full will-change-transform">
      {children}
    </div>
  )
}


const RevealText = ({ text, delay = 0, startReveal = true, wrapperClass = '', itemClass = '' }) => {
  const words = useMemo(() => text.split(' '), [text])
  const [ref, isVisible] = useInView({ threshold: 0.1, enabled: startReveal })

  return (
    <span ref={ref} className={`inline-flex flex-wrap overflow-visible ${wrapperClass}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`mr-[0.25em] inline-block ${itemClass}`}
          style={{
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? 'blur(0px)' : 'blur(20px)',
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40%) scale(0.9)',
            transition: `all 1.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.12}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

const FadeIn = ({ children, delay = 0, className = '', direction = 'up' }) => {
  const [domRef, isVisible] = useInView({ threshold: 0.1, rootMargin: '0px 0px -100px 0px' })

  const translateMap = {
    up: 'translate-y-24',
    down: '-translate-y-24',
    left: 'translate-x-24',
    right: '-translate-x-24',
    scale: 'scale-90',
  }

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `opacity-0 ${translateMap[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'expertise', label: 'Our Services', href: '#expertise' },
  { id: 'our-work', label: 'Our Work', href: '#our-work' },
  { id: 'about', label: 'About Us', href: '#about' },
  { id: 'financing', label: 'Financing', href: '#financing' },
]

export default function JaksConcrete() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const [appLoaded, setAppLoaded] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [activeService, setActiveService] = useState(null)
  const heroScrollRef = useRef(0)
  const legacyTextRef = useRef(null)
  const heroCanvasWrapRef = useRef(null)

  const heroSectionRef = useRef(null)
  const heroTextRef = useRef(null)
  const imageRevealRef = useRef(null)
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const labelRef = useRef(null)
  const brandCrimson = '#FF1E56'
  // Light theme palette (paper + ink).
  const bgPaper = '#F6F3EE'
  const textInk = '#111827'

  useEffect(() => {
    const t1 = setTimeout(() => setAppLoaded(true), 600)
    const t2 = setTimeout(() => {
      setDoorOpen(true)
      window.scrollTo(0, 0)
    }, 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    let wasScrolled = false

    const handleScroll = () => {
      const sy = window.scrollY
      const nowScrolled = sy > 50
      if (nowScrolled !== wasScrolled) {
        wasScrolled = nowScrolled
        setIsScrolled(nowScrolled)
      }

      const heroEl = heroSectionRef.current
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect()
        const sectionH = heroEl.offsetHeight - window.innerHeight
        if (sectionH > 0) {
          const p = Math.min(Math.max(-rect.top / sectionH, 0), 1)
          heroScrollRef.current = p

          if (heroTextRef.current) {
            const fadeOut = Math.max(1 - p * 3, 0)
            const lift = p * 80
            heroTextRef.current.style.opacity = fadeOut
            heroTextRef.current.style.transform = `translate3d(0, ${-lift}px, 0)`
          }
        }
      }

      if (legacyTextRef.current) {
        legacyTextRef.current.style.transform = `translate(-50%, calc(-50% + ${sy * 0.05}px))`
      }

      const scrollPos = sy + 120
      const navOrder = ['home', 'about', 'expertise', 'our-work', 'financing']
      let next = 'home'
      for (const sectionId of navOrder) {
        const el = document.getElementById(sectionId)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (scrollPos >= top) next = sectionId
      }
      setActiveNav((prev) => (prev === next ? prev : next))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX, ringY = mouseY
    let dotX = mouseX, dotY = mouseY
    let ringSize = 40, targetRingSize = 40
    let ringOpacity = 0.4, targetRingOpacity = 0.4
    let dotScale = 1, targetDotScale = 1
    let labelOpacity = 0, targetLabelOpacity = 0
    let reqId
    let currentState = 'default'

    const RING_LERP = 0.065
    const DOT_LERP = 0.25
    const SIZE_LERP = 0.1
    const OPACITY_LERP = 0.08

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const resolveState = (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) return target.getAttribute('data-cursor')
      if (e.target.closest('a, button, [role="button"]')) return 'hover'
      return 'default'
    }

    const onMouseOver = (e) => {
      const newState = resolveState(e)
      if (newState === currentState) return
      currentState = newState

      if (newState === 'view') {
        targetRingSize = 120
        targetRingOpacity = 1
        targetDotScale = 0
        targetLabelOpacity = 1
      } else if (newState === 'hover') {
        targetRingSize = 64
        targetRingOpacity = 0.7
        targetDotScale = 0.6
        targetLabelOpacity = 0
      } else {
        targetRingSize = 40
        targetRingOpacity = 0.4
        targetDotScale = 1
        targetLabelOpacity = 0
      }
    }

    const animate = () => {
      ringX += (mouseX - ringX) * RING_LERP
      ringY += (mouseY - ringY) * RING_LERP
      dotX += (mouseX - dotX) * DOT_LERP
      dotY += (mouseY - dotY) * DOT_LERP
      ringSize += (targetRingSize - ringSize) * SIZE_LERP
      ringOpacity += (targetRingOpacity - ringOpacity) * OPACITY_LERP
      dotScale += (targetDotScale - dotScale) * SIZE_LERP
      labelOpacity += (targetLabelOpacity - labelOpacity) * OPACITY_LERP

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
        ringRef.current.style.width = `${ringSize}px`
        ringRef.current.style.height = `${ringSize}px`
        ringRef.current.style.opacity = ringOpacity
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${dotScale})`
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = labelOpacity
        labelRef.current.style.transform = `scale(${0.6 + labelOpacity * 0.4})`
      }

      reqId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    reqId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(reqId)
    }
  }, [])



  const services = [
    { id: 'I', title: 'Driveways', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' },
    { id: 'II', title: 'Garage Pads', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop' },
    { id: 'III', title: 'Patios', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=800&auto=format&fit=crop' },
    { id: 'IV', title: 'Structural Steps', img: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?q=80&w=800&auto=format&fit=crop' },
    { id: 'V', title: 'Exposed Aggregate', img: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop' },
    { id: 'VI', title: 'Stamped Finishes', img: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=800&auto=format&fit=crop' },
  ]

  const testimonials = [
    {
      quote:
        'Smooth transaction start to finish .. highly recommended for your concrete work .. warranty included! .. Helped us through a bad experience with a prior contractor .. really clean job and clear communication. Thanks Kal and team! 👍🏽',
      author: 'Jimmy Bautista',
      stars: 5,
    },
    {
      quote:
        "I'm so happy that my friend recommended Jaks Concrete. They did a fantastic job and always on time. Great quality of work for the price. I highly recommend Jaks Concrete.",
      author: 'David Head',
    },
    {
      quote:
        'Highly recommended! Jaks stood out from the others I contacted because they were very responsive, keen and passionate about their work. They provided a competitive quote and answered all of my questions regarding the different concrete finishing options. They were easy to coordinate with and schedule. They arrived on time, were very efficient and did a professional job pouring my hottub pad, while being very polite and respectful of my property. I would use them again, and have already recommended them to friends.',
      author: 'Ten Two Media',
    },
  ]

  return (
    <div
      className="min-h-screen font-sans antialiased selection:bg-[#FF1E56] selection:text-white md:cursor-none"
      style={{ backgroundColor: bgPaper, color: textInk }}
    >
      <FilmGrain />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        html { scroll-behavior: smooth; }
        .font-monumental { font-family: 'Playfair Display', 'Cinzel', serif; }
        .door-transition { transition: transform 2s cubic-bezier(0.7, 0, 0.2, 1); }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 50s linear infinite; }
        .liquid-cta::before {
          content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 0%;
          background: ${brandCrimson}; transition: height 0.6s cubic-bezier(0.7, 0, 0.2, 1); z-index: -1;
        }
        .liquid-cta:hover::before { height: 100%; }
      `,
        }}
      />

      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full border border-black/60 md:flex"
        style={{
          width: '40px',
          height: '40px',
          opacity: 0.4,
          mixBlendMode: 'multiply',
          willChange: 'transform, width, height, opacity',
        }}
      >
        <span
          ref={labelRef}
          className="select-none whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.3em] text-black"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          View
        </span>
      </div>

      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden h-2 w-2 rounded-full bg-black md:block"
        style={{ mixBlendMode: 'multiply', willChange: 'transform' }}
      />

      <div className={`pointer-events-none fixed inset-0 z-[9999] flex flex-col ${doorOpen ? 'invisible delay-[2000ms] transition-all' : 'visible'}`}>
        <div
          className={`door-transition flex h-1/2 w-full items-end justify-center border-b border-black/20 bg-[#F6F3EE] px-6 pb-16 ${doorOpen ? '-translate-y-full' : 'translate-y-0'}`}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="overflow-hidden">
              <img
                src="/logo.png"
                alt="Jaks Concrete"
                decoding="async"
                className={`mx-auto h-16 w-auto max-w-[min(220px,70vw)] object-contain object-bottom transition-transform duration-1000 ease-out md:h-20 ${appLoaded ? 'translate-y-0' : 'translate-y-[150%]'}`}
              />
            </div>
            <div className="overflow-hidden">
              <span
                className={`block text-center text-[11px] font-bold uppercase tracking-[1em] text-black/60 transition-transform delay-100 duration-1000 ease-out ${appLoaded ? 'translate-y-0' : 'translate-y-[150%]'}`}
              >
                JAKS CONCRETE
              </span>
            </div>
          </div>
        </div>
        <div
          className={`door-transition flex h-1/2 w-full items-start justify-center border-t border-black/20 bg-[#F6F3EE] pt-16 ${doorOpen ? 'translate-y-full' : 'translate-y-0'}`}
        >
          <div
            className="h-24 w-[3px] origin-top bg-[#FF1E56] transition-transform delay-500 duration-1200"
            style={{ transform: appLoaded ? 'scaleY(1)' : 'scaleY(0)' }}
          />
        </div>
      </div>

      <header
        className={`fixed top-0 z-[90] w-full transition-all duration-1000 ${
          isScrolled || mobileMenuOpen ? 'border-b border-black/20 bg-white/80 py-4 shadow-2xl backdrop-blur-3xl' : 'bg-transparent py-6'
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12">
            <div className="group flex cursor-pointer items-center gap-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.png"
                alt="Logo"
                decoding="async"
                className="h-10 transition-transform duration-700 group-hover:scale-110 md:h-11"
              />
              <div className="hidden flex-col border-l border-black/25 pl-4 sm:flex">
                <span className="text-[12px] font-bold uppercase tracking-[0.3em]">JAKS CONCRETE</span>
                <span className="mt-0.5 max-w-[11rem] text-[8px] font-medium leading-snug tracking-normal text-black/60 sm:max-w-none sm:text-[9px]">
                  Your best construction contractors
                </span>
              </div>
            </div>
          <nav className="hidden items-center gap-8 lg:flex xl:gap-10" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`group relative py-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                    isActive ? 'font-bold text-black' : 'font-normal text-black/55 hover:text-black/80'
                  }`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#FF1E56] transition-all duration-500 group-hover:w-full" />
                </a>
              )
            })}
          </nav>
          <div className="hidden lg:block">
              <a
                href="#contact"
                className="liquid-cta group relative flex items-center gap-3 overflow-hidden border border-black/25 px-6 py-3 transition-colors hover:border-[#FF1E56]"
              >
                <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.3em]">START PROJECT</span>
                <ArrowUpRight size={14} className="relative z-10 transition-transform group-hover:rotate-45" />
              </a>
          </div>
          <button type="button" className="text-black lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-x-0 top-[72px] z-[89] max-h-[calc(100vh-72px)] overflow-y-auto border-b border-black/20 bg-white/95 px-6 py-6 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`group relative inline-block py-3 text-[12px] uppercase tracking-[0.28em] transition-colors ${
                    isActive ? 'font-bold text-black' : 'font-normal text-black/55'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-[#FF1E56] transition-all duration-500 group-hover:w-full" />
                </a>
              )
            })}
          </nav>
        </div>
      ) : null}

      <section ref={heroSectionRef} id="home" className="relative h-[250vh]">
        <div className="sticky top-0 flex h-screen min-h-[700px] flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div ref={heroCanvasWrapRef} className="absolute inset-0 origin-center will-change-transform">
              <div className="absolute inset-0 opacity-80 brightness-[0.9] contrast-[1.1] filter">
                <HeroCanvas scrollRef={heroScrollRef} wrapRef={heroCanvasWrapRef} />
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F6F3EE_100%)] opacity-70" />
          </div>

          <div
            ref={heroTextRef}
            className="relative z-10 w-full max-w-[1600px] px-6 text-center will-change-[opacity,transform]"
          >
            <div className="mb-8 overflow-hidden">
              <span
                className={`block text-[11px] font-bold uppercase tracking-[0.8em] text-[#FF1E56] transition-all delay-[2500ms] duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${doorOpen ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}`}
              >
                Master Builders of Calgary
              </span>
            </div>

            <h1 className="font-monumental flex flex-col items-center text-[11vw] font-normal leading-[0.85] tracking-[-0.03em] text-black lg:text-[7rem] xl:text-[9rem]">
              <RevealText text="FOUNDATIONS" delay={2.0} startReveal={doorOpen} wrapperClass="py-4 -my-4" />
              <div className="mt-4 flex items-center gap-6 md:gap-10">
                <div
                  className={`h-[2px] w-12 bg-[#FF1E56] transition-transform delay-[3000ms] duration-[2000ms] md:w-32 ${doorOpen ? 'scale-x-100' : 'scale-x-0'}`}
                />
                <span
                  className="inline-block italic text-black/60 transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transitionDelay: '2.8s',
                    opacity: doorOpen ? 1 : 0,
                    filter: doorOpen ? 'blur(0px)' : 'blur(20px)',
                    transform: doorOpen ? 'translateY(0) scale(1)' : 'translateY(40%) scale(0.9)',
                  }}
                >
                  of stone
                </span>
                <div
                  className={`h-[2px] w-12 bg-[#FF1E56] transition-transform delay-[3000ms] duration-[2000ms] md:w-32 ${doorOpen ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </div>
            </h1>

            <div
              className={`mx-auto mt-12 max-w-2xl px-6 transition-all delay-[3200ms] duration-[2200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${doorOpen ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
            >
              <p className="text-center text-[13px] font-medium uppercase leading-relaxed tracking-[0.3em] text-black/70 md:text-[15px]">
              Expert craftsmanship, reliable service, and unmatched quality
              </p>
            </div>

            <div className={`mt-16 transition-all delay-[3600ms] duration-[2000ms] ${doorOpen ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.55em] text-black/90 drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
                  Scroll
                </span>
                <div className="h-12 w-[2px] rounded-full bg-black/75 shadow-[0_0_0_1px_rgba(255,255,255,0.35)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-8 py-24 md:px-16 md:py-40" id="about">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <FadeIn>
              <span className="mb-6 block text-[11px] font-bold uppercase tracking-[0.6em] text-[#FF1E56]">THE GENESIS</span>
              <h2 className="font-monumental mb-10 text-5xl uppercase leading-[0.85] tracking-tighter md:text-7xl lg:text-8xl">
                BUILT ON <br /> INTEGRITY.
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="h-[2px] w-20 shrink-0 bg-[#FF1E56]" />
                <span className="max-w-md text-[11px] font-medium leading-snug tracking-wide text-black/55">
                  Your best construction contractors
                </span>
              </div>
            </FadeIn>
          </div>
          <div className="lg:col-span-7">
            <FadeIn delay={400}>
              <div className="group relative max-w-3xl border-l border-black/20 py-6 pl-8 md:pl-16">
                <div className="absolute left-[-2px] top-0 h-0 w-[4px] bg-[#FF1E56] opacity-100 transition-all duration-[2.5s] ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:h-full" />
                <p className="mb-10 font-serif text-2xl italic leading-snug text-black md:text-4xl">
                  &ldquo;With over 20 years of experience, Jaks Concrete Ltd has been proudly serving Calgary and surrounding areas with top-quality products and exceptional service.&rdquo;
                </p>
                <p className="mb-12 max-w-2xl text-[15px] font-light leading-relaxed text-black/70 md:text-[17px]">
                  Whether you need concrete, landscaping, or snow removal, we deliver attention to detail at a fair price. Our expert team ensures your residential or commercial project is completed efficiently and professionally.
                </p>
                  <a
                    href="#contact"
                    className="liquid-cta group relative inline-flex items-center gap-4 border border-black/25 px-8 py-4 shadow-2xl transition-all hover:border-[#FF1E56]"
                  >
                    <span className="relative z-10 text-[12px] font-bold uppercase tracking-[0.4em]">VIEW PORTFOLIO</span>
                    <ArrowUpRight size={16} className="relative z-10 transition-all group-hover:translate-x-2" />
                  </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="relative z-10 flex overflow-hidden whitespace-nowrap border-y border-black/20 bg-white/70 py-8">
        <div className="animate-marquee flex items-center gap-16 opacity-60 transition-opacity duration-1000 hover:opacity-100">
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="font-monumental text-2xl uppercase tracking-[0.5em] text-black md:text-3xl">CONSTRUCTING WITH PERMANENCE</span>
              <span className="text-2xl text-[#FF1E56]">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-[1600px] px-8 py-24 md:px-16 md:py-40" id="expertise">
        <div className="mb-16 flex flex-col items-center text-center md:mb-24">
          <FadeIn>
            <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.8em] text-[#FF1E56]">OUR DISCIPLINE</span>
            <h2 className="font-monumental text-5xl uppercase leading-[0.8] tracking-tight md:text-8xl lg:text-9xl">EXPERTISE.</h2>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="z-10 border-t border-black/20 lg:col-span-7">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between border-b border-black/20 py-6 transition-all duration-700 hover:bg-black/[0.05] hover:px-8 md:flex-row md:items-center md:py-8"
                onMouseEnter={() => setActiveService(index)}
                onMouseLeave={() => setActiveService(null)}
                data-cursor="view"
              >
                <div className="flex items-center gap-6 md:gap-10">
                  <span className="w-8 font-serif text-[15px] italic opacity-20 transition-all duration-500 group-hover:text-[#FF1E56] group-hover:opacity-100">
                    {service.id}
                  </span>
                  <h3 className="font-monumental text-3xl uppercase tracking-tighter transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4 md:text-5xl">
                    {service.title}
                  </h3>
                </div>
                <ArrowUpRight
                  size={32}
                  className="hidden translate-y-full transform opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 md:block md:text-[#FF1E56]"
                />
              </div>
            ))}
          </div>

          <div className="sticky top-24 hidden h-[550px] lg:col-span-5 lg:block">
            <div className="relative h-full w-full overflow-hidden border border-black/20 bg-white shadow-[0_0_60px_rgba(0,0,0,0.12)]">
              <div ref={imageRevealRef} className="absolute inset-0 h-full w-full">
                {services.map((service, index) => (
                  <img
                    key={service.id}
                    src={service.img}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover brightness-50 grayscale transition-all duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      activeService === index ? 'scale-100 opacity-100 blur-0' : 'scale-110 opacity-0 blur-3xl'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <FadeIn delay={200}>
          <div className="mt-16 flex flex-col items-center justify-center">
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.8em] text-black/50">We Offer Snow Removal Too!</span>
              <a
                href="#contact"
                className="liquid-cta group relative flex items-center gap-4 overflow-hidden border border-[#FF1E56]/30 px-10 py-5 shadow-md shadow-black/10 transition-all hover:border-[#FF1E56]"
              >
                <span className="relative z-10 text-[12px] font-bold uppercase tracking-[0.4em]">SEE ALL OUR SERVICES</span>
                <ArrowUpRight size={18} className="relative z-10 transition-transform group-hover:rotate-45" />
              </a>
          </div>
        </FadeIn>
      </section>

      <section className="border-t border-black/20 bg-white/40 py-24 md:py-40" id="our-work">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-16 px-8 md:px-16 lg:grid-cols-12 lg:gap-20">
          <div className="h-fit lg:col-span-5 lg:sticky lg:top-24">
            <FadeIn direction="left">
              <span className="mb-6 block text-[12px] font-bold uppercase tracking-[0.6em] text-[#FF1E56]">EXECUTION PROTOCOL</span>
              <h2 className="font-monumental mb-10 text-5xl uppercase leading-[0.85] tracking-tight md:text-7xl lg:text-8xl">
                THE <br /> METHOD.
              </h2>
              <p className="mb-8 max-w-md text-[16px] font-light leading-relaxed opacity-60">
                We approach concrete as a science of timing. A rigorous, multi-stage architecture designed for structural absolute permanence.
              </p>
              <div className="h-[3px] w-24 bg-[#FF1E56]" />
            </FadeIn>
          </div>

          <div className="flex flex-col gap-16 md:gap-24 lg:col-span-7">
            {[
              {
                num: '01',
                title: 'Preparation',
                desc: 'Surgical site grading and mathematically compacted aggregate bases.',
                img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop',
              },
              {
                num: '02',
                title: 'Reinforcement',
                desc: 'High-tension rebar matrices installed to exact structural load specs.',
                img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop',
              },
              {
                num: '03',
                title: 'Monolithic Pour',
                desc: 'Continuous high-PSI deployment with masterful artisan finishing.',
                img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop',
              },
            ].map((step, i) => (
              <div key={step.num} className="group">
                <FadeIn delay={i * 200}>
                  <TiltSlab>
                    <div className="relative aspect-[16/10] overflow-hidden border border-black/20 bg-white shadow-2xl">
                      <img
                        src={step.img}
                        alt={step.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover brightness-[0.4] grayscale transition-all duration-[3s] ease-out group-hover:scale-110 group-hover:brightness-50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                        <span className="mb-3 block text-[12px] font-bold tracking-[0.8em] text-[#FF1E56]">{step.num}</span>
                        <h3 className="font-monumental text-3xl uppercase tracking-tighter text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.75)] md:text-5xl">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                  </TiltSlab>
                  <p className="mt-6 max-w-xl border-l-4 border-[#FF1E56] pl-6 text-[16px] font-light leading-relaxed opacity-60 md:text-[18px]">
                    {step.desc}
                  </p>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1600px] overflow-hidden border-t border-black/20 px-8 py-24 text-center md:px-16 md:py-40" id="legacy">
        <div
          ref={legacyTextRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full text-center will-change-transform"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <span className="font-monumental select-none text-[25vw] uppercase leading-none text-black/[0.06]">STRENGTH</span>
        </div>

        <FadeIn>
          <span className="mb-6 block text-[12px] font-bold uppercase tracking-[0.8em] text-[#FF1E56]">LEGACY</span>
          <h2 className="font-monumental mx-auto mb-20 max-w-[min(64rem,95vw)] text-4xl uppercase leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
            BUILT TO WITHSTAND <br /> THE WEIGHT OF TIME.
          </h2>
        </FadeIn>

        <div className="relative z-10 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-12">
          {[
            { val: '20+', label: 'Years Field Intelligence' },
            { val: '500+', label: 'Master Developments' },
            { val: '100%', label: 'Absolute Guarantee' },
          ].map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 200}>
              <div className="group cursor-default">
                <h3 className="font-monumental mb-4 text-7xl transition-all duration-700 group-hover:scale-105 group-hover:text-[#FF1E56] md:text-8xl lg:text-9xl">
                  {stat.val}
                </h3>
                <span className="text-[12px] font-bold uppercase tracking-[0.5em] opacity-50">{stat.label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section
        className="border-t border-black/20 bg-white/40 py-24 md:py-40"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto max-w-[1600px] px-8 md:px-16">
          <div className="mb-16 text-center md:mb-20">
            <FadeIn>
              <span className="mb-6 block text-[12px] font-bold uppercase tracking-[0.8em] text-[#FF1E56]">TESTIMONIALS</span>
              <h2 id="testimonials-heading" className="font-monumental text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                Words from <br className="md:hidden" /> those we&apos;ve served
              </h2>
              <div className="mx-auto mt-8 h-[2px] w-20 bg-[#FF1E56]" />
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            {testimonials.map((t, i) => (
              <FadeIn key={t.author} delay={i * 120}>
                <blockquote className="flex h-full flex-col border border-black/20 bg-[#F6F3EE]/80 p-8 text-left shadow-sm shadow-black/5 md:p-10">
                  {t.stars ? (
                    <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
                      {Array.from({ length: t.stars }).map((_, si) => (
                        <Star key={si} size={16} className="fill-[#FF1E56] text-[#FF1E56]" aria-hidden />
                      ))}
                    </div>
                  ) : null}
                  <p className="font-serif text-[17px] font-light italic leading-relaxed text-black/80 md:text-[18px]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-8 border-t border-black/15 pt-6">
                    <cite className="not-italic">
                      <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-black/60">{t.author}</span>
                    </cite>
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/20 bg-white/40 py-20 md:py-28" id="financing" aria-labelledby="financing-heading">
        <div className="mx-auto max-w-[1600px] px-8 text-center md:px-16">
          <FadeIn>
            <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.8em] text-[#FF1E56]">FINANCING</span>
            <h2 id="financing-heading" className="font-monumental text-3xl uppercase leading-tight tracking-tight md:text-5xl">
              Payment options for your project
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] font-light leading-relaxed text-black/70">
              Ask us about financing when you plan your concrete work. We&apos;ll explain what&apos;s available and help you move forward with confidence.
            </p>
            <a
              href="#contact"
              className="liquid-cta group relative mt-10 inline-flex items-center gap-3 overflow-hidden border border-black/25 px-8 py-4 transition-colors hover:border-[#FF1E56]"
            >
              <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.35em]">Discuss financing</span>
              <ArrowUpRight size={16} className="relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </FadeIn>
        </div>
      </section>

      <footer
        className="relative z-10 overflow-hidden border-t border-black/20 bg-[#F0EBE3] pb-10 pt-20 text-black md:pt-28"
        id="contact"
      >
        <div className="relative z-10 mx-auto max-w-[1600px] px-8 md:px-16">
          <div className="mb-16 border-b border-black/15 pb-16 text-center md:mb-20 md:pb-20">
            <FadeIn>
              <span className="mb-6 block text-[12px] font-bold uppercase tracking-[0.8em] text-[#FF1E56]">
                COMMISSION A PROJECT
              </span>
              <h2 className="font-monumental mx-auto max-w-5xl cursor-default text-[12vw] uppercase leading-[0.85] tracking-tighter transition-colors duration-1000 md:text-7xl lg:text-8xl">
                SPEAK <br className="sm:hidden" /> WITH US.
              </h2>
              <p className="mx-auto mt-8 max-w-lg text-[15px] font-light leading-relaxed text-black/60">
                Residential and commercial concrete in Calgary. Call or email for an estimate—we reply promptly.
              </p>
              <div className="mx-auto mt-12 grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-2 sm:gap-4">
                <a
                  href="tel:4036048687"
                  className="liquid-cta group relative flex min-h-[52px] w-full items-center gap-3 overflow-hidden border border-black/25 px-5 py-3.5 font-sans transition-colors hover:border-[#FF1E56]"
                >
                  <Phone size={18} className="relative z-10 shrink-0 text-[#FF1E56]" aria-hidden />
                  <span className="relative z-10 min-w-0 flex-1 text-left text-[14px] font-bold leading-tight tracking-tight text-black md:text-[15px]">
                    (403) 604-8687
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="relative z-10 shrink-0 text-black/45 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black"
                    aria-hidden
                  />
                </a>
                <a
                  href="mailto:jaksconcrete403@gmail.com"
                  className="liquid-cta group relative flex min-h-[52px] w-full items-center gap-3 overflow-hidden border border-black/25 px-5 py-3.5 font-sans transition-colors hover:border-[#FF1E56]"
                >
                  <Mail size={18} className="relative z-10 shrink-0 text-[#FF1E56]" aria-hidden />
                  <span className="relative z-10 min-w-0 flex-1 break-all text-left text-[12px] font-bold leading-snug tracking-tight text-black sm:text-[13px]">
                    jaksconcrete403@gmail.com
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="relative z-10 shrink-0 text-black/45 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black"
                    aria-hidden
                  />
                </a>
              </div>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 gap-14 border-b border-black/15 pb-14 lg:grid-cols-12 lg:gap-12 lg:pb-16">
            <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
              <img
                src="/logo.png"
                alt="Jaks Concrete Ltd."
                loading="lazy"
                decoding="async"
                className="h-12 w-auto cursor-pointer object-contain opacity-90 transition-opacity hover:opacity-100 md:h-14"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
              <p className="mt-5 max-w-sm text-[14px] font-light leading-relaxed text-black/65">
                Foundations of stone—driveways, pads, patios, and structural work built to last.
              </p>
              <p className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em] text-black/50 lg:justify-start">
                <MapPin size={14} className="shrink-0 text-[#FF1E56]" aria-hidden />
                Calgary, Alberta
              </p>
            </div>

            <nav className="lg:col-span-3" aria-label="Footer">
              <h3 className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-black/45 lg:text-left">
                Navigate
              </h3>
              <ul className="flex flex-col gap-3 text-center lg:text-left">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className="text-[13px] font-medium text-black/70 transition-colors hover:text-black"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-5">
              <h3 className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-black/45 lg:text-left">
                Contact
              </h3>
              <ul className="space-y-4 text-center lg:text-left">
                <li>
                  <a
                    href="tel:4036048687"
                    className="inline-flex items-center justify-center gap-3 text-[15px] text-black/80 transition-colors hover:text-[#FF1E56] lg:justify-start"
                  >
                    <Phone size={18} className="shrink-0 text-[#FF1E56]" aria-hidden />
                    (403) 604-8687
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:jaksconcrete403@gmail.com"
                    className="inline-flex items-center justify-center gap-3 break-all text-[15px] text-black/80 transition-colors hover:text-[#FF1E56] lg:justify-start"
                  >
                    <Mail size={18} className="shrink-0 text-[#FF1E56]" aria-hidden />
                    jaksconcrete403@gmail.com
                  </a>
                </li>
              </ul>
              <p className="mt-8 text-center text-[12px] leading-relaxed text-black/50 lg:text-left">
                Your best construction contractors · Serving Calgary and surrounding areas
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-8 pt-10 md:flex-row md:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <div className="flex items-center gap-2.5 rounded-sm border border-black/20 bg-white/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black/70">
                <Star size={15} className="fill-[#FF1E56] text-[#FF1E56]" aria-hidden />
                100% Satisfaction
              </div>
              <div className="flex items-center gap-2.5 rounded-sm border border-black/20 bg-white/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#FF1E56] text-[9px] font-black text-black">
                  BBB
                </span>
                Accredited
              </div>
            </div>
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-black/45">
              © {new Date().getFullYear()} Jaks Concrete Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
