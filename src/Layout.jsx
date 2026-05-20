import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

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

export default function Layout({ children }) {
  const location = useLocation()
  const isGallery = location.pathname.startsWith('/gallery')
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const labelRef = useRef(null)

  const brandCrimson = '#FF1E56'
  const bgPaper = '#F6F3EE'
  const textInk = '#111827'

  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (!scrollTo) return

    const id = scrollTo
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(raf)
  }, [location.key, location.state])

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let dotX = mouseX
    let dotY = mouseY

    let ringSize = 40
    let targetRingSize = 40
    let ringOpacity = isGallery ? 0.9 : 0.4
    let targetRingOpacity = isGallery ? 0.9 : 0.4
    let dotScale = 1
    let targetDotScale = 1
    let labelOpacity = 0
    let targetLabelOpacity = 0
    let targetLabelText = ''
    let currentState = 'default'
    let reqId

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

    const applyState = (state) => {
      if (state === 'view') {
        targetRingSize = 120
        targetRingOpacity = 1
        targetDotScale = 0
        targetLabelOpacity = 1
        targetLabelText = 'View'
      } else if (state === 'exit') {
        targetRingSize = 110
        targetRingOpacity = 1
        targetDotScale = 0
        targetLabelOpacity = 1
        targetLabelText = 'Exit'
      } else if (state === 'hover') {
        targetRingSize = 64
        targetRingOpacity = isGallery ? 1 : 0.7
        targetDotScale = 0.6
        targetLabelOpacity = 0
        targetLabelText = ''
      } else {
        targetRingSize = 40
        targetRingOpacity = isGallery ? 0.9 : 0.4
        targetDotScale = 1
        targetLabelOpacity = 0
        targetLabelText = ''
      }

      if (labelRef.current) {
        labelRef.current.textContent = targetLabelText
      }
    }

    const onMouseOver = (e) => {
      const newState = resolveState(e)
      if (newState === currentState) return
      currentState = newState
      applyState(newState)
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
        ringRef.current.style.borderColor = isGallery
          ? 'rgba(255,255,255,1)'
          : currentState === 'exit'
            ? brandCrimson
            : 'rgba(0,0,0,0.6)'
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${dotScale})`
        dotRef.current.style.opacity = currentState === 'exit' ? '0' : '1'
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = labelOpacity
        labelRef.current.style.transform = `scale(${0.6 + labelOpacity * 0.4})`
        labelRef.current.style.color = isGallery
          ? 'rgba(255,255,255,1)'
          : currentState === 'exit'
            ? brandCrimson
            : '#111827'
      }

      reqId = requestAnimationFrame(animate)
    }

    applyState('default')
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    reqId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(reqId)
    }
  }, [isGallery, brandCrimson])

  return (
    <div
      className="min-h-screen font-sans antialiased selection:bg-[#FF1E56] selection:text-white md:cursor-none"
      style={{ backgroundColor: bgPaper, color: textInk }}
    >
      <FilmGrain />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; background: ${bgPaper}; }
        body { background: ${bgPaper}; overflow-x: hidden; max-width: 100vw; }
        img, video, canvas, svg, iframe, embed, object { max-width: 100%; height: auto; }
        pre, code { max-width: 100%; overflow-x: auto; }
        .animate-marquee { max-width: none !important; width: max-content; }
        .font-monumental { font-family: 'Playfair Display', 'Cinzel', serif; }
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
        className={`pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full md:flex ${
          isGallery ? 'border-2' : 'border'
        }`}
        style={{
          width: '40px',
          height: '40px',
          opacity: isGallery ? 0.9 : 0.4,
          mixBlendMode: isGallery ? 'normal' : 'multiply',
          willChange: 'transform, width, height, opacity',
        }}
      >
        <span
          ref={labelRef}
          className={`select-none whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.3em] ${
            isGallery ? 'text-white' : 'text-black'
          }`}
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          View
        </span>
      </div>

      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[101] hidden h-2 w-2 rounded-full md:block ${
          isGallery ? '' : 'bg-black'
        }`}
        style={{
          mixBlendMode: isGallery ? 'normal' : 'multiply',
          willChange: 'transform',
          backgroundColor: isGallery ? 'rgba(255,255,255,1)' : undefined,
        }}
      />

      {children}
    </div>
  )
}

