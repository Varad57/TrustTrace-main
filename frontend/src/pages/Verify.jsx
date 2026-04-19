import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import { useToast } from '../components/ui/Toast'
import { verifyFHE } from '../services/api'

// Animation Variants
const containerVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}

// FHE Verification Stages
const STAGES = {
  IDLE: 'IDLE',
  ENCRYPTING: 'ENCRYPTING',
  COMPUTING: 'COMPUTING',
  VERIFIED: 'VERIFIED',
  ERROR: 'ERROR'
}

export default function Verify() {
  const showToast = useToast()
  const [stage, setStage] = useState(STAGES.IDLE)
  const [apiResult, setApiResult] = useState(null)

  const handleVerify = async () => {
    if (stage !== STAGES.IDLE && stage !== STAGES.ERROR && stage !== STAGES.VERIFIED) return

    setStage(STAGES.ENCRYPTING)
    setApiResult(null)

    // Simulate encryption time for UI flow
    await new Promise(resolve => setTimeout(resolve, 2000))

    setStage(STAGES.COMPUTING)

    try {
      // Parallel: Keep UI engaged for at least 3s total while Backend runs
      const [data] = await Promise.all([
        verifyFHE({ action: "verify_investor_solvency" }),
        new Promise(resolve => setTimeout(resolve, 3000)) 
      ])
      
      setApiResult(data)
      setStage(STAGES.VERIFIED)
      showToast('FHE Verification Successful', 'success')
    } catch (err) {
      setStage(STAGES.ERROR)
      showToast(err.message || 'Verification Failed', 'error')
    }
  }

  const renderVisualizer = () => {
    switch (stage) {
      case STAGES.IDLE:
      case STAGES.ERROR:
        return (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-48"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent-blue/20 blur-xl rounded-full" />
              <div className="w-16 h-16 rounded-2xl bg-dark-surface/80 border border-accent-blue/30 flex items-center justify-center relative z-10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            <p className="mt-6 text-sm font-semibold text-text-primary text-center">Ready to Sequence</p>
            <p className="mt-1 text-xs text-text-muted text-center max-w-[200px]">
              Tap below to initiate cryptographic verification
            </p>
          </motion.div>
        )

      case STAGES.ENCRYPTING:
        return (
          <motion.div
            key="encrypting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-48"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-accent-purple/30 blur-2xl rounded-full"
              />
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </motion.div>
              </div>
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 text-sm font-bold text-accent-purple tracking-widest uppercase"
            >
              Encrypting Balance...
            </motion.p>
            <div className="mt-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: ['8px', '24px', '8px'] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1.5 bg-accent-purple/50 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )

      case STAGES.COMPUTING:
        return (
          <motion.div
            key="computing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center justify-center h-48"
          >
            <div className="relative w-full max-w-[240px] h-20 flex items-center justify-between">
              {/* Encrypted Data Node */}
              <div className="w-12 h-12 rounded-xl bg-accent-purple/20 border border-accent-purple flex items-center justify-center z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>

              {/* Connecting Flow animation */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-dark-border overflow-hidden">
                <motion.div
                  className="h-full w-12 bg-gradient-to-r from-transparent via-accent-cyan to-transparent shadow-[0_0_10px_#06b6d4]"
                  animate={{ x: [-48, 200] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              </div>

              {/* Verification Node */}
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/>
                  <line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
            </div>
            
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-6 text-sm font-bold text-accent-cyan tracking-widest uppercase"
            >
              Computing on encrypted data...
            </motion.p>
            <p className="mt-1 text-[10px] text-text-muted font-mono tracking-widest uppercase">
              Homomorphic Evaluation in progress
            </p>
          </motion.div>
        )

      case STAGES.VERIFIED:
        return (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-48"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1.2], opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-accent-green rounded-full blur-2xl" 
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-accent-green/20 border-2 border-accent-green flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.5)] bg-blur-lg"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-base font-bold text-accent-green"
            >
              Balance Verified ✅
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-1 text-xs font-semibold text-text-secondary"
            >
              Without Data Exposure
            </motion.p>
            {apiResult && apiResult.message && (
               <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="mt-1 text-[10px] font-mono text-text-muted"
             >
               Server: {apiResult.message}
             </motion.p>
            )}
          </motion.div>
        )
    }
  }

  return (
    <motion.div variants={containerVariant} initial="hidden" animate="show" className="space-y-6 pb-4">
      {/* Header */}
      <motion.div variants={itemVariant}>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Privacy-Preserving Verification</h2>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Verify investor solvency credentials entirely on-chain without exposing private financial data through Zero-Knowledge and FHE.
          </p>
        </div>
      </motion.div>

      {/* Main Visualizer Card */}
      <motion.div variants={itemVariant}>
        <GlassCard className="relative overflow-hidden border-accent-blue/10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/5 to-transparent pointer-events-none" />
          
          <div className="h-56 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {renderVisualizer()}
            </AnimatePresence>
          </div>

          <div className="pt-2 pb-1">
            <Button
              fullWidth
              size="lg"
              variant={stage === STAGES.VERIFIED ? 'ghost' : 'primary'}
              disabled={stage === STAGES.ENCRYPTING || stage === STAGES.COMPUTING}
              onClick={handleVerify}
            >
              {stage === STAGES.ENCRYPTING || stage === STAGES.COMPUTING ? (
                 <span className="flex items-center gap-2">
                   Processing Proof...
                 </span>
              ) : stage === STAGES.VERIFIED ? (
                'Run Another Verification'
              ) : (
                'Verify Investor Solvency'
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Storytelling Element */}
      <motion.div variants={itemVariant}>
        <GlassCard className="bg-dark-surface/30">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-1">Zero-Data Exposure</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your financial data is never decrypted during evaluation. We compute directly on encrypted cyphertexts using advanced Fully Homomorphic Encryption (FHE).
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

    </motion.div>
  )
}
