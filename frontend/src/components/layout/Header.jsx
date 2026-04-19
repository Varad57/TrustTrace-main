import { motion } from 'framer-motion'
import { useWallet } from '../../hooks/useWallet'
import { Spinner } from '../ui/Loader'
import { useToast } from '../ui/Toast'

export default function Header() {
  const { status, shortAddress, source, isCorrectNetwork, connect, disconnect } = useWallet()
  const showToast = useToast()

  const handleWalletClick = async () => {
    if (status === 'connected') {
      disconnect()
      showToast('Wallet disconnected', 'info')
      return
    }

    try {
      const { address } = await connect()
      showToast(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <header className="glass-strong px-5 py-3.5 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center gradient-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-tight">TrustTrace</h1>
          <p className="text-[10px] font-medium text-text-muted -mt-0.5 tracking-wider uppercase">Secure Audit Protocol</p>
        </div>
      </div>

      {/* Wallet Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleWalletClick}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass border border-dark-border-light/50 cursor-pointer"
      >
        {status === 'connecting' ? (
          <Spinner size={14} />
        ) : status === 'connected' ? (
          <>
            {!isCorrectNetwork ? (
              <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            )}
            <span className="text-xs font-semibold text-text-secondary">{shortAddress}</span>
            {source === 'hardhat' && (
              <span className="text-[8px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded font-bold">LOCAL</span>
            )}
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span className="text-xs font-semibold text-text-secondary">Connect</span>
          </>
        )}
      </motion.button>
    </header>
  )
}
