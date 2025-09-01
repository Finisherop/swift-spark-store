"use client"

import { useEffect, useState } from "react"

export function AnimatedLogo() {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-1000 ${isAnimated ? "scale-100 rotate-0" : "scale-0 rotate-180"}`}
      >
        {/* Cart body */}
        <path
          d="M8 8L12 8L16 24L32 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 delay-300 ${isAnimated ? "stroke-dasharray-0" : "stroke-dasharray-100"}`}
        />

        {/* Cart wheels */}
        <circle
          cx="18"
          cy="30"
          r="2"
          fill="currentColor"
          className={`transition-all duration-500 delay-700 ${isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
        />
        <circle
          cx="28"
          cy="30"
          r="2"
          fill="currentColor"
          className={`transition-all duration-500 delay-800 ${isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
        />

        {/* Motion lines */}
        <path
          d="M2 12L6 12M4 16L8 16M2 20L6 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`transition-all duration-700 delay-1000 ${isAnimated ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
        />

        {/* Cart basket */}
        <path
          d="M12 8L32 8L30 20L14 20L12 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className={`transition-all duration-800 delay-500 ${isAnimated ? "opacity-100" : "opacity-0"}`}
        />
      </svg>

      <span
        className={`text-2xl font-bold transition-all duration-1000 delay-200 ${
          isAnimated ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
      >
        Swift<span className="text-primary">Mart</span>
      </span>
    </div>
  )
}