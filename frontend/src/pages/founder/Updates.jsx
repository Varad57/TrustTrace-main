import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Loader'
import { useToast } from '../../components/ui/Toast'

const stagger = {
  container: { show: { transition: { staggerChildren: 0.06 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  },
}

export default function FounderUpdates() {
  const showToast = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const [updates, setUpdates] = useState([
    { id: 1, title: 'Q1 Product Roadmap finalized', desc: 'We have updated our internal milestones to prioritize the AI matching engine based on recent investor feedback.', time: '2 hours ago', status: 'Published' },
    { id: 2, title: 'New Hire: Lead Smart Contract Dev', desc: 'Welcome Alice! She joins from a heavy DeFi background and will lead our V2 Escrow contract development.', time: 'Yesterday', status: 'Published' },
    { id: 3, title: 'Series A term sheet received', desc: 'We have received a term sheet and are currently in diligence. More details will follow next week.', time: '3 days ago', status: 'Published' },
  ])

  const isValid = title.trim() && description.trim()

  const handlePostUpdate = () => {
    if (!isValid || loading) return
    setLoading(true)
    setTimeout(() => {
      setUpdates(prev => [{ id: Date.now(), title, desc: description, time: 'Just now', status: 'Published' }, ...prev])
      setTitle('')
      setDescription('')
      setLoading(false)
      showToast('Update published to investors!', 'success')
    }, 800)
  }

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-4 pb-4">

      {/* Header */}
      <motion.div variants={stagger.item}>
        <h2 className="text-xl font-bold text-text-primary">Investor Updates</h2>
        <p className="text-sm text-text-secondary mt-0.5">Communicate progress and build trust.</p>
      </motion.div>

      {/* Post Update Form */}
      <motion.div variants={stagger.item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue to-accent-purple" />
          <h3 className="text-sm font-bold text-text-primary mb-4">Post an Update</h3>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading}
                placeholder="Brief summary..."
                className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all disabled:opacity-40"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading}
                placeholder="Share details with investors..." rows={3}
                className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all disabled:opacity-40 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button disabled className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-dark-surface/50 border border-dark-border text-xs text-text-muted cursor-not-allowed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                Attach File
              </button>
              <span className="text-[10px] text-text-muted">Optional</span>
            </div>
          </div>

          <Button fullWidth onClick={handlePostUpdate} disabled={!isValid || loading} className="!text-white">
            {loading ? <Spinner size={16} /> : 'Post Update'}
          </Button>
        </GlassCard>
      </motion.div>

      {/* Feed */}
      <motion.div variants={stagger.item}>
        <h3 className="text-sm font-bold text-text-primary mb-3">Published Updates</h3>
        <div className="space-y-3 relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-dark-border" />
          <AnimatePresence>
            {updates.map((update) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative pl-9"
              >
                <div className="absolute left-2.5 top-4 w-2 h-2 rounded-full bg-accent-purple ring-2 ring-dark-bg" />
                <GlassCard className="!p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text-primary">{update.title}</h4>
                      <span className="text-[9px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded">{update.status}</span>
                    </div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider shrink-0 ml-2">{update.time}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{update.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

    </motion.div>
  )
}
