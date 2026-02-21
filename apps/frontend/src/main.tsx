import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function renderApp() {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui;color:#f87171;">Error: #root element not found</div>'
    return
  }

  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    rootEl.setAttribute('data-app-mounted', 'true')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error('App failed to load:', err)
    rootEl.innerHTML = `
      <div style="min-height:100vh;padding:2rem;font-family:system-ui;background:#111;color:#fff;">
        <h2 style="color:#f87171;">Failed to load app</h2>
        <p style="color:#94a3b8;">${msg}</p>
        <pre style="font-size:12px;overflow:auto;background:#222;padding:1rem;border-radius:8px;">${stack || 'No stack'}</pre>
        <p style="color:#64748b;margin-top:1rem;">Check the browser Console (F12) for details.</p>
      </div>
    `
  }
}

renderApp()





