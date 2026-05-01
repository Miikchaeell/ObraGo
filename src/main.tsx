import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
const VERSION = "22.3.0";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
