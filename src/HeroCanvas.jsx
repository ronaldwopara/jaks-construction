import { useEffect, useRef } from 'react'

const TOTAL_FRAMES = 192

function framePath(i) {
  return `/frames/frames_${String(i).padStart(3, '0')}.webp`
}

export default function HeroCanvas({ scrollRef, wrapRef }) {
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const readyRef = useRef(false)
  const rafRef = useRef(null)
  const lastDrawn = useRef(-1)

  useEffect(() => {
    let cancelled = false
    const imgs = new Array(TOTAL_FRAMES)
    let loaded = 0

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        imgs[i] = img
        loaded++
        if (loaded === TOTAL_FRAMES && !cancelled) {
          framesRef.current = imgs
          readyRef.current = true
        }
      }
      img.src = framePath(i + 1)
    }

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef?.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function render() {
      rafRef.current = requestAnimationFrame(render)
      if (!readyRef.current) return

      const sp = scrollRef.current
      const frameIdx = Math.min(
        Math.max(Math.floor(sp * (TOTAL_FRAMES - 1)), 0),
        TOTAL_FRAMES - 1
      )

      if (frameIdx === lastDrawn.current) return
      lastDrawn.current = frameIdx

      const img = framesRef.current[frameIdx]
      if (!img) return

      const cw = canvas.width
      const ch = canvas.height
      if (cw === 0 || ch === 0) return

      const imgAspect = img.naturalWidth / img.naturalHeight
      const canvasAspect = cw / ch
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (imgAspect > canvasAspect) {
        sw = img.naturalHeight * canvasAspect
        sx = (img.naturalWidth - sw) / 2
      } else {
        sh = img.naturalWidth / canvasAspect
        sy = (img.naturalHeight - sh) / 2
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)

      if (wrap) {
        const scale = 1 + sp * 0.06
        wrap.style.transform = `scale(${scale})`
      }
    }

    render()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [scrollRef, wrapRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    function resize() {
      const parent = canvas.parentElement?.parentElement || canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
    }
    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement?.parentElement || canvas.parentElement)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
    />
  )
}
