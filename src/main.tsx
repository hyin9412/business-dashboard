import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@arco-design/theme-ve-o-design/css/arco.css'
import '@tod-m/materials/ve-o/es/style/index.css'
import '@tod-m/materials/es/style/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
