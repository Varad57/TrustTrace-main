import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Loader'
import { useToast } from '../components/ui/Toast'
import AddExpense from '../components/AddExpense'
import { getLedger } from '../services/api'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.06 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const showToast = useToast()

  const fetchLedger = useCallback(async () => {
    try {
      const data = await getLedger()
      setLedger(data || [])
    } catch (err) {
      showToast('Failed to load ledger', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    setLoading(true)
    fetchLedger()
  }, [refreshKey, fetchLedger])

  const handleExpenseAdded = () => {
    // Trigger a refetch after a short delay to allow the backend queue to process
    setTimeout(() => setRefreshKey(k => k + 1), 600)
  }

  // Compute live stats from the ledger
  const totalBlocks = ledger.length
  const totalAudited = ledger
    .filter(r => r.expense?.id !== 'genesis')
    .reduce((sum, r) => sum + (r.expense?.amount || 0), 0)
  const recentEntries = ledger.slice(-5).reverse().filter(r => r.expense?.id !== 'genesis')

  const statsData = [
    { label: 'Total Audited', value: `₹${totalAudited.toLocaleString()}`, icon: '📊' },
    { label: 'Blocks Mined', value: totalBlocks.toString(), icon: '⛓️' },
    { label: 'Trust Score', value: totalBlocks > 1 ? '94.7%' : '—', icon: '🛡️' },
  ]

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5 pb-4">
      {/* Welcome Banner */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-blue/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-accent-purple/10 blur-3xl" />
          <div className="relative">
            <p className="text-text-muted text-xs font-medium tracking-wider uppercase mb-1">Welcome back</p>
            <h2 className="text-xl font-bold text-text-primary mb-1">Good Evening, Varad</h2>
            <p className="text-text-secondary text-sm">
              {totalBlocks > 0
                ? `${totalBlocks} blocks on-chain • Last sync just now`
                : 'All systems operational'}
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {statsData.map((stat) => (
          <motion.div key={stat.label} variants={stagger.item}>
            <GlassCard className="text-center">
              <span className="text-lg mb-1 block">{stat.icon}</span>
              <p className="text-lg font-bold text-text-primary leading-tight">{stat.value}</p>
              <p className="text-[10px] text-text-muted font-medium mt-0.5">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Add Expense Form */}
      <motion.div variants={stagger.item}>
        <AddExpense onSuccess={handleExpenseAdded} />
      </motion.div>

      {/* Recent Activity (Live from API) */}
      <motion.div variants={stagger.item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
          <button
            onClick={() => { setLoading(true); setRefreshKey(k => k + 1) }}
            className="text-xs font-medium text-accent-blue cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : recentEntries.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-text-muted text-sm mb-1">No transactions yet</p>
            <p className="text-text-muted text-xs">Submit an expense above to get started</p>
          </GlassCard>
        ) : (
          <div className="space-y-2.5">
            {recentEntries.map((item, i) => (
              <motion.div
                key={item.currentHash || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="!p-3.5" onTap={() => showToast(`Hash: ${item.currentHash?.slice(0, 16)}...`, 'info')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.expense?.description}</p>
                      <p className="text-[11px] text-text-muted font-mono truncate">{item.currentHash?.slice(0, 16)}...</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-text-primary">₹{item.expense?.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted">Queued</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
