// Minimal stub for Lovable preview using Vite. Does not affect Next.js runtime.
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lovable Preview</h1>
          <p className="text-muted-foreground">Your Next.js app is running in development mode</p>
        </div>
      </div>
    </React.StrictMode>
  );
}
