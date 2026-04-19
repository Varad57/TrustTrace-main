import { useState } from 'react'
import { motion } from 'framer-motion'
import FounderAddExpense from '../../components/FounderAddExpense'
import GlassCard from '../../components/ui/GlassCard'
import ExpenseCard from '../../components/ExpenseCard'
import ProofModal from '../../components/ProofModal'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.06 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

const INITIAL_EXPENSES = [
  {
    id: 1,
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
    id: 2,
    description: 'Adobe Creative Cloud License',
    amount: '$4,500',
    timestamp: 'Apr 17, 2026 — 11:15 AM',
    hash: '0xf2d8c36618bc2a23b7e91c4d5a8f3b6e2d9c1a4f7b8e3d6c9a2f5b8e1d4c7a0',
    prevHash: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    receiptUrl: null,
    receiptName: null,
    status: 'Verified',
  },
  {
    id: 3,
    description: 'Legal Consultation — Series A',
    amount: '$15,000',
    timestamp: 'Apr 16, 2026 — 9:30 AM',
    hash: '0xa1f8e23408ba1c43d9f2c91b7a8fd32e1c0b5a7d6e9f3c2a4b8d6e1f3c5a7b9d',
    prevHash: '0xf2d8c36618bc2a23b7e91c4d5a8f3b6e2d9c1a4f7b8e3d6c9a2f5b8e1d4c7a0',
    receiptUrl: null,
    receiptName: null,
    status: 'Verified',
  },
]

export default function FounderLedger() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES)
  const [proofExpense, setProofExpense] = useState(null)

  const handleExpenseAdded = (newExpense) => {
    if (newExpense) {
      setExpenses(prev => [newExpense, ...prev])
    }
  }

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-4 pb-4">

      {/* Add Expense Form */}
      <motion.div variants={stagger.item}>
        <FounderAddExpense onSuccess={handleExpenseAdded} />
      </motion.div>

      {/* Hash Chain Visualizer */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 via-accent-purple/5 to-transparent rounded-2xl" />
          <h3 className="text-sm font-bold text-text-primary mb-3 relative">Hash Chain Integrity</h3>
          <div className="flex items-center justify-between gap-1 relative overflow-x-auto pb-1">
            {expenses.slice(0, 3).map((exp, i) => (
              <div key={exp.id} className="flex items-center gap-1 shrink-0">
                <div className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg border bg-dark-surface border-accent-blue/30 text-accent-blue">
                  Exp #{i + 1}
                </div>
                {i < 2 && (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <div className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg border bg-dark-surface border-accent-purple/30 text-accent-purple">
                      Hash
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Expense Cards */}
      <motion.div variants={stagger.item}>
        <h3 className="text-sm font-bold text-text-primary mb-3">Immutable Records</h3>
        <div className="space-y-2.5">
          {expenses.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ExpenseCard
                expense={expense}
                variant="founder"
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
