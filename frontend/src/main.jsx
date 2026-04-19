import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import FounderApp from './FounderApp.jsx'
import { ToastProvider } from './components/ui/Toast'
import { WalletProvider } from './hooks/useWallet'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/investor-dashboard/*" element={<App />} />
            <Route path="/founder/*" element={<FounderApp />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </ToastProvider>
  </StrictMode>,
)
