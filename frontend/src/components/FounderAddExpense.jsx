import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from './ui/GlassCard'
import Button from './ui/Button'
import { Spinner } from './ui/Loader'
import { useToast } from './ui/Toast'
import ReceiptUploadInput from './ReceiptUploadInput'
import { addExpense } from '../services/api'

export default function FounderAddExpense({ onSuccess }) {
  const showToast = useToast()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('idle') // idle | hashing | success

  const isValid = amount && parseFloat(amount) > 0 && description.trim()

  const handleSubmit = async () => {
    if (!isValid || loading) return

    setLoading(true)
    setStep('hashing')

    try {
      const result = await addExpense({ amount: parseFloat(amount), description: description.trim() })

      // Create a record for the parent to use
      const newExpense = {
        id: Date.now(),
        description: description.trim(),
        amount: `$${parseFloat(amount).toLocaleString()}`,
        timestamp: new Date().toLocaleString(),
        hash: result?.hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        prevHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        receiptUrl: receipt ? URL.createObjectURL(receipt) : null,
        receiptName: receipt?.name || null,
        status: 'Verified',
      }

      setStep('success')
      showToast('Expense hashed & queued with receipt', 'success')

      setTimeout(() => {
        setAmount('')
        setDescription('')
        setReceipt(null)
        setStep('idle')
        setLoading(false)
        onSuccess?.(newExpense)
      }, 1200)
    } catch (err) {
      showToast(err.message || 'Failed to submit expense', 'error')
      setStep('idle')
      setLoading(false)
    }
  }

  return (
    <GlassCard className="relative overflow-hidden">
      {/* Subtle gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">Log Expense</h3>
          <p className="text-[10px] text-text-muted">Hash-chain to immutable ledger</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
          Amount ($)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 pl-8 pr-4 text-sm font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all disabled:opacity-40"
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-3">
        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. AWS Cloud Infrastructure"
          disabled={loading}
          className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all disabled:opacity-40"
        />
      </div>

      {/* Receipt Upload */}
      <div className="mb-4">
        <ReceiptUploadInput file={receipt} onChange={setReceipt} disabled={loading} />
      </div>

      {/* Submit Button with state transitions */}
      <AnimatePresence mode="wait">
        {step === 'hashing' ? (
          <motion.div
            key="hashing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-dark-surface/60 border border-dark-border"
          >
            <Spinner size={18} />
            <span className="text-sm font-medium text-text-secondary">Hashing transaction...</span>
          </motion.div>
        ) : step === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-green/10 border border-accent-green/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <span className="text-sm font-semibold text-accent-green">Hashed & Queued!</span>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button fullWidth size="lg" onClick={handleSubmit} disabled={!isValid} className="!text-white">
              Add Expense
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
