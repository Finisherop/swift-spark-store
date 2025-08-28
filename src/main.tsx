import React from 'react'
import { createRoot } from 'react-dom/client'

// Minimal stub entry for Vite build (Lovable tooling only)
// Does not affect Next.js runtime
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      {/* Intentionally render nothing. Next.js app runs separately. */}
      <></>
    </React.StrictMode>
  )
}
