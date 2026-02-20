"use client"

import { useEffect, useRef } from "react"

export function SakuraPetals() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Inject keyframes once via a style tag
    const styleId = "sakura-keyframes"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        @keyframes sakura-drift {
          0% { transform: translateY(-5vh) translateX(0px) rotate(0deg); opacity: 0.8; }
          25% { transform: translateY(25vh) translateX(15px) rotate(180deg); opacity: 0.7; }
          50% { transform: translateY(50vh) translateX(-10px) rotate(360deg); opacity: 0.6; }
          75% { transform: translateY(75vh) translateX(20px) rotate(540deg); opacity: 0.3; }
          100% { transform: translateY(105vh) translateX(5px) rotate(720deg); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    // Create petal elements
    const petals: HTMLDivElement[] = []
    for (let i = 0; i < 10; i++) {
      const petal = document.createElement("div")
      petal.style.cssText = `
        position: absolute;
        left: ${(i * 10) + Math.random() * 5}%;
        top: -20px;
        width: ${8 + Math.random() * 6}px;
        height: ${8 + Math.random() * 6}px;
        opacity: ${0.15 + Math.random() * 0.15};
        animation: sakura-drift ${14 + Math.random() * 8}s ${i * 1.5}s linear infinite;
        pointer-events: none;
      `
      petal.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="100%" height="100%"><path d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2Z" fill="#f9a8d4"/></svg>`
      container.appendChild(petal)
      petals.push(petal)
    }

    return () => {
      petals.forEach((p) => p.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    />
  )
}
