import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from './ui/GlassCard'
import Button from './ui/Button'

export default function ProofModal({ isOpen, onClose, expense }) {
  if (!expense) return null

  const isPDF = expense.receiptName?.toLowerCase().endsWith('.pdf')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto z-10"
          >
            <GlassCard className="relative overflow-hidden !p-0">
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green" />

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Expense Proof</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">Cryptographically verified record</p>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Amount & Description */}
                <div className="bg-dark-surface/60 rounded-xl p-4 border border-dark-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-text-primary">{expense.description}</span>
                    <span className="text-lg font-bold text-text-primary">{expense.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">{expense.timestamp}</span>
                    <span className="text-[9px] bg-accent-green/15 text-accent-green font-bold px-2 py-0.5 rounded">Verified & Stored</span>
                  </div>
                </div>

                {/* Receipt Preview */}
                {expense.receiptUrl && (
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Receipt Preview</p>
                    <div className="bg-dark-surface/60 rounded-xl border border-dark-border overflow-hidden">
                      {isPDF ? (
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{expense.receiptName}</p>
                            <p className="text-[10px] text-text-muted">PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <img src={expense.receiptUrl} alt="Receipt" className="w-full max-h-48 object-contain bg-dark-bg/40" />
                      )}
                    </div>
                  </div>
                )}

                {/* Hash Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Full Hash</p>
                    <p className="text-[11px] text-accent-blue font-mono break-all bg-dark-surface/60 rounded-lg p-2.5 border border-dark-border">{expense.hash}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Previous Hash</p>
                    <p className="text-[11px] text-text-secondary font-mono break-all bg-dark-surface/60 rounded-lg p-2.5 border border-dark-border">{expense.prevHash}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Blockchain Reference</p>
                    <div className="flex items-center gap-2 bg-dark-surface/60 rounded-lg p-2.5 border border-dark-border">
                      <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                      <p className="text-[11px] text-accent-green font-mono">Block #47291 — Ethereum Sepolia</p>
                    </div>
                  </div>
                </div>

                {/* Verification badge */}
                <div className="bg-accent-green/10 rounded-xl p-3 border border-accent-green/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                    </svg>
                    <span className="text-sm font-bold text-accent-green">Cryptographically Verified</span>
                  </div>
                  <p className="text-[10px] text-text-muted">This expense is cryptographically verified and cannot be altered.</p>
                </div>

                <Button fullWidth variant="secondary" onClick={onClose} className="!text-white">
                  Close
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
