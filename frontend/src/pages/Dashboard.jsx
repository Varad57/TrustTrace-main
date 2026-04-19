import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Loader'
import { useToast } from '../components/ui/Toast'
import AddExpense from '../components/AddExpense'
import ExpenseCard from '../components/ExpenseCard'
import ProofModal from '../components/ProofModal'
import { getLedger } from '../services/api'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.06 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

// Mock verified expenses visible to investors
const VERIFIED_EXPENSES = [
  {
    id: 101,
    description: 'AWS Cloud Infrastructure',
    amount: '$12,400',
    timestamp: 'Apr 18, 2026 — 3:42 PM',
    hash: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prevHash: '0xa1f8e23408ba1c43d9f2c91b7a8fd32e1c0b5a7d6e9f3c2a4b8d6e1f3c5a7b9d',
    receiptUrl: null,
    receiptName: null,
    status: 'Verified',
  },
  {
    id: 102,
    description: 'Legal Consultation — Series A',
    amount: '$15,000',
    timestamp: 'Apr 16, 2026 — 9:30 AM',
    hash: '0xa1f8e23408ba1c43d9f2c91b7a8fd32e1c0b5a7d6e9f3c2a4b8d6e1f3c5a7b9d',
    prevHash: '0xf2d8c36618bc2a23b7e91c4d5a8f3b6e2d9c1a4f7b8e3d6c9a2f5b8e1d4c7a0',
    receiptUrl: null,
    receiptName: null,
    status: 'Verified',
  },
  {
    id: 103,
    description: 'Marketing Campaign — Q1',
    amount: '$28,000',
    timestamp: 'Apr 15, 2026 — 2:18 PM',
    hash: '0xb4c9d72a10fe3e88a5d2f71c83e9b046d1a7c3f5e8b2d6a9c4f1e7b0d3a6c9f2',
    prevHash: '0xa1f8e23408ba1c43d9f2c91b7a8fd32e1c0b5a7d6e9f3c2a4b8d6e1f3c5a7b9d',
    receiptUrl: null,
    receiptName: null,
    status: 'Verified',
  },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [ledger, setLedger] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [proofExpense, setProofExpense] = useState(null)
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

      {/* ── Verified Expenses (Investor View) ── */}
      <motion.div variants={stagger.item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Verified Expenses</h3>
          <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded">{VERIFIED_EXPENSES.length} Verified</span>
        </div>

        {/* Mini hash chain */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
          {VERIFIED_EXPENSES.slice(0, 3).map((exp, i) => (
            <div key={exp.id} className="flex items-center gap-1 shrink-0">
              <div className="text-[8px] font-mono px-2 py-1 rounded-lg border bg-dark-surface border-accent-blue/30 text-accent-blue">
                #{i + 1}
              </div>
              {i < 2 && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {VERIFIED_EXPENSES.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ExpenseCard
                expense={expense}
                variant="investor"
                onViewProof={(exp) => setProofExpense(exp)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Proof Modal */}
      <ProofModal
        isOpen={!!proofExpense}
        onClose={() => setProofExpense(null)}
        expense={proofExpense}
      />
    </motion.div>
  )
}
