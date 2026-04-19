import { motion } from 'framer-motion'
import GlassCard from './ui/GlassCard'

export default function ExpenseCard({ expense, onViewProof, variant = 'founder' }) {
  const shortHash = (hash) => hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : '—'
  const isInvestor = variant === 'investor'

  return (
    <GlassCard className="!p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isInvestor ? 'bg-accent-blue/10' : 'bg-accent-green/10'
        }`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isInvestor ? '#3B82F6' : '#10B981'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-text-primary truncate">{expense.description}</p>
            <p className="text-sm font-bold text-text-primary ml-2 shrink-0">{expense.amount}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[10px] text-text-muted">{expense.timestamp}</span>
            <span className="text-[9px] bg-accent-green/15 text-accent-green font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </span>
            {expense.receiptUrl && (
              <span className="text-[9px] bg-accent-blue/15 text-accent-blue font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Receipt
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-muted font-mono">{shortHash(expense.hash)}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewProof?.(expense)}
              className="text-[10px] font-bold text-accent-blue cursor-pointer px-2.5 py-1 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors"
            >
              View Proof
            </motion.button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
