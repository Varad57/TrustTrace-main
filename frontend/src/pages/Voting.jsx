import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { Spinner } from '../components/ui/Loader'
import { useToast } from '../components/ui/Toast'
import { useWallet } from '../hooks/useWallet'
import {
  getReadProvider,
  getContract,
  voteMilestone,
  depositToEscrow,
  getMilestoneData,
  getTotalDeposits,
  getCurrentMilestone,
} from '../services/blockchain'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

// Proposal metadata for the UI (matches the single milestone in the contract)
const proposalMeta = [
  {
    title: 'Milestone 1: MVP Delivery',
    description: 'Release 100% of escrowed funds upon successful delivery of the MVP with verified audit trail.',
    category: 'Escrow',
  },
]

export default function Voting() {
  const showToast = useToast()
  const wallet = useWallet()

  const [contractAddr, setContractAddr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [txState, setTxState] = useState('idle') // idle | pending | confirming | confirmed | error
  const [milestoneInfo, setMilestoneInfo] = useState(null)
  const [totalDeposits, setTotalDeposits] = useState('0')
  const [currentMs, setCurrentMs] = useState(0)
  const [userDeposit, setUserDeposit] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)

  // Load contract data when we have an address
  const loadContractData = async (addr, signerOrProvider) => {
    try {
      const contract = getContract(addr, signerOrProvider)
      const [msData, deposits, curMs] = await Promise.all([
        getMilestoneData(contract, 0),
        getTotalDeposits(contract),
        getCurrentMilestone(contract),
      ])
      setMilestoneInfo(msData)
      setTotalDeposits(deposits)
      setCurrentMs(curMs)
    } catch (err) {
      console.error('Failed to load contract data:', err)
    }
  }

  // Deploy a fresh contract for the demo
  const handleDeploy = async () => {
    if (wallet.status !== 'connected') {
      showToast('Connect your wallet first', 'error')
      return
    }

    setDeploying(true)
    try {
      const provider = getReadProvider()
      const signer = await provider.getSigner(1)
      const beneficiary = await signer.getAddress()
      const refHashes = [ethers.zeroPadBytes('0x00', 32)]

      // Fetch bytecode from compiled artifact
      const artifactRes = await fetch('/artifacts/MilestoneEscrow.json')
      let bytecode
      if (artifactRes.ok) {
        const artifact = await artifactRes.json()
        bytecode = artifact.bytecode
      } else {
        // Try direct file access through vite proxy
        throw new Error('Could not load contract artifact')
      }

      const factory = new ethers.ContractFactory(
        [
          'constructor(address _beneficiary, bytes32[] _referenceHashes, uint8[] _percentages)',
          'function deposit() payable',
          'function vote(uint256 _milestoneId)',
          'function releaseFunds()',
          'function getMilestone(uint256 _id) view returns (bytes32, uint256, uint8, bool)',
          'function totalDeposits() view returns (uint256)',
          'function currentMilestone() view returns (uint256)',
          'function deposits(address) view returns (uint256)',
        ],
        bytecode,
        signer
      )

      const contract = await factory.deploy(beneficiary, refHashes, [100])
      await contract.waitForDeployment()
      const addr = await contract.getAddress()

      setContractAddr(addr)
      showToast('Contract deployed!', 'success')
      await loadContractData(addr, signer)
    } catch (err) {
      showToast(err.message || 'Deploy failed', 'error')
    } finally {
      setDeploying(false)
    }
  }

  // Deposit ETH into the escrow
  const handleDeposit = async () => {
    if (!contractAddr || !userDeposit || parseFloat(userDeposit) <= 0) return

    setDepositLoading(true)
    try {
      const provider = getReadProvider()
      // Use an investor account (Account #2 from Hardhat)
      const investorSigner = await provider.getSigner(2)
      const contract = getContract(contractAddr, investorSigner)

      await depositToEscrow(contract, userDeposit)
      showToast(`Deposited ${userDeposit} ETH to escrow`, 'success')
      setUserDeposit('')
      await loadContractData(contractAddr, provider)
    } catch (err) {
      showToast(err.message?.slice(0, 80) || 'Deposit failed', 'error')
    } finally {
      setDepositLoading(false)
    }
  }

  // Vote on the current milestone
  const handleVote = async () => {
    if (!contractAddr) return

    setTxState('pending')
    try {
      const provider = getReadProvider()
      // Use the investor account that deposited
      const investorSigner = await provider.getSigner(2)
      const contract = getContract(contractAddr, investorSigner)

      setTxState('confirming')
      await voteMilestone(contract, currentMs)

      setTxState('confirmed')
      showToast('Vote submitted on-chain!', 'success')
      await loadContractData(contractAddr, provider)

      setTimeout(() => setTxState('idle'), 3000)
    } catch (err) {
      setTxState('error')
      const msg = err.message?.includes('Already voted')
        ? 'Already voted on this milestone'
        : err.message?.includes('Not an investor')
          ? 'Must deposit first to vote'
          : err.message?.slice(0, 80) || 'Transaction failed'
      showToast(msg, 'error')
      setTimeout(() => setTxState('idle'), 2000)
    }
  }

  const votePercent = milestoneInfo && totalDeposits !== '0'
    ? Math.round((parseFloat(milestoneInfo.totalVotes) / parseFloat(totalDeposits)) * 100)
    : 0

  const categoryColors = {
    Escrow: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
  }

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5 pb-4">
      {/* Header */}
      <motion.div variants={stagger.item}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">On-Chain Voting</h2>
            <p className="text-xs text-text-muted mt-0.5">Milestone escrow governance</p>
          </div>
          {contractAddr && (
            <div className="px-3 py-1.5 rounded-xl bg-accent-green/10 border border-accent-green/20">
              <span className="text-[11px] font-semibold text-accent-green">Live</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Wallet Status */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-accent-purple/8 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Wallet</p>
              {wallet.status === 'connected' ? (
                <>
                  <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">{wallet.shortAddress}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {wallet.source === 'hardhat' ? 'Hardhat Local' : 'MetaMask'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-muted mt-0.5">Not connected</p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Deploy Contract (if none active) */}
      {!contractAddr && (
        <motion.div variants={stagger.item}>
          <GlassCard className="text-center py-6">
            <div className="text-3xl mb-3">📄</div>
            <p className="text-sm font-medium text-text-primary mb-1">No Active Contract</p>
            <p className="text-xs text-text-muted mb-4">Deploy a MilestoneEscrow to start voting</p>
            <Button
              fullWidth
              onClick={handleDeploy}
              disabled={deploying || wallet.status !== 'connected'}
            >
              {deploying ? (
                <span className="flex items-center gap-2">
                  <Spinner size={16} /> Deploying...
                </span>
              ) : (
                'Deploy Escrow Contract'
              )}
            </Button>
          </GlassCard>
        </motion.div>
      )}

      {/* Contract Info */}
      {contractAddr && (
        <>
          {/* Contract Address */}
          <motion.div variants={stagger.item}>
            <GlassCard>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Contract</p>
              <p className="text-xs font-mono text-accent-blue break-all">{contractAddr}</p>
              <div className="flex gap-3 mt-3">
                <div>
                  <p className="text-[10px] text-text-muted">Total Deposits</p>
                  <p className="text-sm font-bold text-text-primary">{totalDeposits} ETH</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Current Milestone</p>
                  <p className="text-sm font-bold text-text-primary">#{currentMs}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Deposit Section */}
          <motion.div variants={stagger.item}>
            <GlassCard>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">Deposit to Escrow</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">Ξ</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={userDeposit}
                    onChange={(e) => setUserDeposit(e.target.value)}
                    placeholder="1.0"
                    disabled={depositLoading}
                    className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-2.5 pl-7 pr-3 text-sm font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 transition-all disabled:opacity-40"
                  />
                </div>
                <Button size="md" onClick={handleDeposit} disabled={depositLoading || !userDeposit}>
                  {depositLoading ? <Spinner size={16} /> : 'Deposit'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Milestone Card */}
          <motion.div variants={stagger.item}>
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${categoryColors.Escrow}`}>
                  {proposalMeta[0]?.category || 'Escrow'}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${milestoneInfo?.released ? 'bg-accent-green' : 'bg-accent-blue animate-pulse'}`} />
                  <span className={`text-[10px] font-semibold ${milestoneInfo?.released ? 'text-accent-green' : 'text-accent-blue'}`}>
                    {milestoneInfo?.released ? 'Released' : 'Active'}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-text-primary mb-1.5">{proposalMeta[0]?.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">{proposalMeta[0]?.description}</p>

              {/* Vote Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-accent-green font-semibold">Votes — {votePercent}%</span>
                  <span className="text-text-muted">{milestoneInfo?.totalVotes || '0'} ETH</span>
                </div>
                <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(votePercent, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className="text-text-muted">Threshold: 50%</span>
                  <span className="text-text-muted">{totalDeposits} ETH total</span>
                </div>
              </div>

              {/* Vote Button with Transaction States */}
              {!milestoneInfo?.released && (
                <AnimatePresence mode="wait">
                  {txState === 'pending' ? (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-dark-surface/60 border border-dark-border"
                    >
                      <Spinner size={18} />
                      <span className="text-sm font-medium text-text-secondary">Transaction Pending...</span>
                    </motion.div>
                  ) : txState === 'confirming' ? (
                    <motion.div
                      key="confirming"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 animate-pulse-glow"
                    >
                      <Spinner size={18} />
                      <span className="text-sm font-medium text-accent-amber">Confirming on-chain...</span>
                    </motion.div>
                  ) : txState === 'confirmed' ? (
                    <motion.div
                      key="confirmed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-green/10 border border-accent-green/30"
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
                      <span className="text-sm font-semibold text-accent-green">Transaction Confirmed ✅</span>
                    </motion.div>
                  ) : txState === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-red/10 border border-accent-red/30"
                    >
                      <span className="text-sm font-semibold text-accent-red">Transaction Failed</span>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button fullWidth size="lg" onClick={handleVote}>
                        Approve Milestone
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
