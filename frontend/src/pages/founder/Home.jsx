import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.07 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

export default function FounderHome() {
  const navigate = useNavigate()
  const showToast = useToast()

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-4 pb-4">

      {/* Welcome Header */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-purple/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-accent-blue/10 blur-3xl" />
          <div className="relative">
            <p className="text-text-muted text-[10px] font-semibold tracking-widest uppercase mb-1">Founder Dashboard</p>
            <h2 className="text-xl font-bold text-text-primary mb-0.5">Welcome back, Founder</h2>
            <p className="text-text-secondary text-sm">Manage funds and build investor trust.</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Trust Score — Big Card */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-purple/5 to-transparent rounded-2xl" />
          <div className="relative flex items-center gap-5">
            {/* Circular score visual */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" strokeWidth="8" stroke="rgba(100,116,139,0.15)" fill="none" />
                <circle
                  cx="50" cy="50" r="42" strokeWidth="8" fill="none"
                  stroke="url(#scoreGrad)" strokeLinecap="round"
                  strokeDasharray={`${72 * 2.639} ${100 * 2.639}`}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-text-primary leading-none">72</span>
                <span className="text-[9px] text-text-muted font-medium">/ 100</span>
              </div>
            </div>
            {/* Sub-metrics */}
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-bold text-text-primary mb-2">Trust Score</h3>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-text-secondary">Transparency</span>
                  <span className="text-[11px] font-bold text-accent-blue">92%</span>
                </div>
                <div className="w-full bg-dark-bg/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-accent-blue h-1.5 rounded-full transition-all" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-text-secondary">Milestone Accuracy</span>
                  <span className="text-[11px] font-bold text-accent-purple">68%</span>
                </div>
                <div className="w-full bg-dark-bg/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-accent-purple h-1.5 rounded-full transition-all" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Fund Allocation Card */}
      <motion.div variants={stagger.item}>
        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Fund Allocation</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Total Raised</p>
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple">$4.2M</span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-text-secondary">Utilized</span>
              <span className="font-bold text-[#14b8a6]">$1.8M (42.8%)</span>
            </div>
            <div className="w-full bg-dark-bg/60 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#14b8a6] to-accent-blue h-2.5 rounded-full transition-all" style={{ width: '42.8%' }} />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-surface/50 rounded-xl p-3 border border-dark-border">
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Released</p>
              <p className="text-lg font-bold text-accent-green">$1.8M</p>
            </div>
            <div className="bg-dark-surface/50 rounded-xl p-3 border border-dark-border">
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Locked</p>
              <p className="text-lg font-bold text-accent-amber">$2.4M</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={stagger.item}>
        <GlassCard>
          <h3 className="text-sm font-bold text-text-primary mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button fullWidth onClick={() => navigate('/founder/updates')} className="!text-white">
              Post Update
            </Button>
            <Button fullWidth onClick={() => showToast('Release request submitted', 'success')} variant="secondary" className="!text-white !bg-dark-surface/80 border border-accent-purple/30 hover:border-accent-purple/60">
              Request Release
            </Button>
            <Button fullWidth onClick={() => navigate('/founder/ledger')} variant="secondary" className="!text-white !bg-dark-surface/80 border border-accent-blue/30 hover:border-accent-blue/60">
              Add Expense
            </Button>
            <Button fullWidth onClick={() => showToast('Ledger exported as CSV', 'success')} variant="secondary" className="!text-white !bg-dark-surface/80 border border-dark-border hover:border-text-muted/50">
              Export Ledger
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={stagger.item}>
        <h3 className="text-sm font-bold text-text-primary mb-3">Recent Activity</h3>
        <div className="space-y-2.5 relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-dark-border" />
          {[
            { title: 'Expense logged', desc: 'AWS Cloud — $12,400', time: '2 min ago', color: 'bg-accent-blue' },
            { title: 'Milestone approved', desc: 'MVP Launch — Vote passed', time: '1 hour ago', color: 'bg-accent-green' },
            { title: 'Update posted', desc: 'Q1 roadmap finalized', time: '3 hours ago', color: 'bg-accent-purple' },
            { title: 'Investor voted', desc: 'Release #4 — Approved', time: 'Yesterday', color: 'bg-[#14b8a6]' },
          ].map((item, i) => (
            <div key={i} className="relative pl-9">
              <div className={`absolute left-2.5 top-3 w-2 h-2 rounded-full ${item.color} ring-2 ring-dark-bg`} />
              <GlassCard className="!p-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider shrink-0 ml-2">{item.time}</span>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  )
}
