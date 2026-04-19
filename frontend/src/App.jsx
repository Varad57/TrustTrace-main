import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import BottomNav from './components/layout/BottomNav'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Verify from './pages/Verify'
import Voting from './pages/Voting'
import AnimatedPage from './components/ui/AnimatedPage'

const tabs = ['dashboard', 'ledger', 'verify', 'voting']

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [direction, setDirection] = useState(0)

  const handleTabChange = (tab) => {
    const oldIdx = tabs.indexOf(activeTab)
    const newIdx = tabs.indexOf(tab)
    setDirection(newIdx > oldIdx ? 1 : -1)
    setActiveTab(tab)
  }

  const renderPage = () => {
    const pages = {
      dashboard: <Dashboard />,
      ledger: <Ledger />,
      verify: <Verify />,
      voting: <Voting />,
    }
    return (
      <AnimatePresence mode="wait" custom={direction}>
        <AnimatedPage key={activeTab} direction={direction}>
          {pages[activeTab]}
        </AnimatedPage>
      </AnimatePresence>
    )
  }

  return (
    <Layout
      header={<Header />}
      bottomNav={<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    >
      {renderPage()}
    </Layout>
  )
}
