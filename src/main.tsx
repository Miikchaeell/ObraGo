import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const VERSION = "22.2.1";
if (localStorage.getItem("obrago_version") !== VERSION) {
  localStorage.setItem("obrago_version", VERSION);
  window.location.reload();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
