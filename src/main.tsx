// Minimal stub for Lovable preview using Vite. Does not affect Next.js runtime.
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  // No JSX to avoid requiring the React plugin during Vite build
  root.render(React.createElement(React.StrictMode, null));
}
