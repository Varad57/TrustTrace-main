import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import Header from './components/layout/Header'
import FounderBottomNav from './components/layout/FounderBottomNav'
import AnimatedPage from './components/ui/AnimatedPage'

import FounderHome from './pages/founder/Home'
import FounderLedger from './pages/founder/Ledger'
import FounderStats from './pages/founder/Stats'
import FounderUpdates from './pages/founder/Updates'

const TABS_ORDER = ['home', 'ledger', 'stats', 'updates']

export default function FounderApp() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Extract trailing path to determine active tab (e.g. /founder/home -> home)
  const currentPath = location.pathname.split('/').pop()
  const activeTab = TABS_ORDER.includes(currentPath) ? currentPath : 'home'
  
  const [direction, setDirection] = useState(0)

  const handleTabChange = (tabId) => {
    const oldIdx = TABS_ORDER.indexOf(activeTab)
    const newIdx = TABS_ORDER.indexOf(tabId)
    setDirection(newIdx > oldIdx ? 1 : -1)
    navigate(`/founder/${tabId}`)
  }

  return (
    <Layout
      header={<Header />}
      bottomNav={<FounderBottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="home" element={<AnimatedPage direction={direction}><FounderHome /></AnimatedPage>} />
          <Route path="ledger" element={<AnimatedPage direction={direction}><FounderLedger /></AnimatedPage>} />
          <Route path="stats" element={<AnimatedPage direction={direction}><FounderStats /></AnimatedPage>} />
          <Route path="updates" element={<AnimatedPage direction={direction}><FounderUpdates /></AnimatedPage>} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}
