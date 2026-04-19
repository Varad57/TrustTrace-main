import { motion } from 'framer-motion'
import GlassCard from '../../components/ui/GlassCard'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.06 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

const analytics = [
  { category: 'Development', amount: '$1.2M', percentage: '66%', color: 'bg-accent-blue' },
  { category: 'Marketing', amount: '$320K', percentage: '18%', color: 'bg-accent-purple' },
  { category: 'Operations', amount: '$180K', percentage: '10%', color: 'bg-[#14b8a6]' },
  { category: 'Miscellaneous', amount: '$100K', percentage: '6%', color: 'bg-accent-amber' },
]

const fraudAlerts = [
  { title: 'Spending spike detected', message: '4 transactions over $50K within 12 hours.', type: 'spike', severity: 'High' },
  { title: 'Repeated vendor flagged', message: 'Unrecognized recurring payments to same vendor (3x/week).', type: 'vendor', severity: 'Medium' },
]

export default function FounderStats() {
  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-4 pb-4">

      {/* Header */}
      <motion.div variants={stagger.item}>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Spending Analytics</h2>
            <p className="text-sm text-text-secondary mt-0.5">Breakdown of utilized funds</p>
          </div>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-accent-purple to-accent-blue">$1.8M</span>
        </div>
      </motion.div>

      {/* Visual bar */}
      <motion.div variants={stagger.item}>
        <GlassCard className="!p-4">
          <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5">
            <div className="bg-accent-blue rounded-l-full" style={{ width: '66%' }} />
            <div className="bg-accent-purple" style={{ width: '18%' }} />
            <div className="bg-[#14b8a6]" style={{ width: '10%' }} />
            <div className="bg-accent-amber rounded-r-full" style={{ width: '6%' }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {analytics.map((item, i) => (
          <motion.div key={i} variants={stagger.item}>
            <GlassCard className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{item.category}</span>
              </div>
              <p className="text-lg font-bold text-text-primary">{item.amount}</p>
              <p className="text-[11px] font-semibold text-text-secondary mt-0.5">{item.percentage}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Fraud Alerts */}
      <motion.div variants={stagger.item}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-text-primary">Fraud & Risk Alerts</h2>
          <span className="bg-red-500/15 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-red-500/20">{fraudAlerts.length} Active</span>
        </div>

        <div className="space-y-3">
          {fraudAlerts.map((alert, i) => (
            <GlassCard key={i} className="!p-4 border border-red-500/20">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  {alert.type === 'spike' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-red-400">{alert.title}</h4>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-accent-amber/20 text-accent-amber'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{alert.message}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

    </motion.div>
  )
}
