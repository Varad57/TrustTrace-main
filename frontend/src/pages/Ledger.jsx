import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Loader'
import { useToast } from '../components/ui/Toast'
import { getLedger } from '../services/api'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.07 } } },
  item: {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

export default function Ledger() {
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [expandedHash, setExpandedHash] = useState(null)
  const [error, setError] = useState(null)

  const fetchLedger = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLedger()
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
      showToast('Failed to fetch ledger', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedger()
  }, [])

  const copyHash = (hash) => {
    navigator.clipboard?.writeText(hash)
    showToast('Hash copied to clipboard', 'success')
  }

  const shortHash = (hash, len = 12) =>
    hash && hash.length > len ? `${hash.slice(0, len)}...${hash.slice(-4)}` : hash

  // Separate genesis from transactions
  const genesis = entries.find(e => e.expense?.id === 'genesis')
  const transactions = entries.filter(e => e.expense?.id !== 'genesis')

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5 pb-4">
      {/* Header */}
      <motion.div variants={stagger.item}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Immutable Ledger</h2>
            <p className="text-xs text-text-muted mt-0.5">SHA-256 hash-chained audit trail</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-green/10 border border-accent-green/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="text-[11px] font-semibold text-accent-green">
                {entries.length} Block{entries.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div variants={stagger.item}>
          <SkeletonList count={4} />
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div variants={stagger.item}>
          <GlassCard className="text-center py-8">
            <p className="text-accent-red text-sm font-medium mb-3">⚠️ {error}</p>
            <Button variant="secondary" size="sm" onClick={fetchLedger}>
              Retry
            </Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && entries.length === 0 && (
        <motion.div variants={stagger.item}>
          <GlassCard className="text-center py-10">
            <div className="text-3xl mb-3 opacity-50">📭</div>
            <p className="text-text-secondary text-sm font-medium mb-1">No transactions yet</p>
            <p className="text-text-muted text-xs">Submit an expense from the Dashboard to see it appear here</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Genesis Block */}
      {!loading && genesis && (
        <motion.div variants={stagger.item}>
          <GlassCard className="border-accent-blue/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center gradient-glow flex-shrink-0">
                <span className="text-base">🔗</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Genesis Block</p>
                <p className="text-[11px] text-text-muted font-mono truncate">
                  {shortHash(genesis.previousHash)}
                </p>
              </div>
              <div className="px-2 py-1 rounded-lg bg-accent-blue/10">
                <span className="text-[10px] font-semibold text-accent-blue">#0</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Live Transaction Entries */}
      {!loading && transactions.map((entry, idx) => {
        const isExpanded = expandedHash === entry.currentHash
        return (
          <motion.div key={entry.currentHash || idx} variants={stagger.item}>
            <GlassCard
              onTap={() => setExpandedHash(isExpanded ? null : entry.currentHash)}
              className="relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-surface flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{entry.expense?.description || 'Transaction'}</p>
                    <span className="text-[10px] font-semibold text-text-muted ml-2 px-2 py-0.5 rounded-lg bg-dark-surface">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-base font-bold gradient-text">
                    ₹{(entry.expense?.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono mt-1">
                    {shortHash(entry.currentHash)}
                  </p>
                </div>
              </div>

              {/* Expanded Hash Details */}
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-3 border-t border-dark-border/50 space-y-2.5">
                  <div>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Expense ID</p>
                    <p className="text-[11px] text-text-secondary font-mono break-all">{entry.expense?.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Previous Hash</p>
                    <p className="text-[11px] text-text-secondary font-mono break-all">{entry.previousHash}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Current Hash</p>
                    <p className="text-[11px] text-accent-blue font-mono break-all">{entry.currentHash}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); copyHash(entry.currentHash) }}
                  >
                    Copy Hash
                  </Button>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>
        )
      })}

      {/* Refresh Button */}
      {!loading && entries.length > 0 && (
        <motion.div variants={stagger.item}>
          <Button variant="secondary" fullWidth size="sm" onClick={fetchLedger}>
            Refresh Ledger
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
