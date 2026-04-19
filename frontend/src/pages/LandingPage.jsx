import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function LandingPage() {
  const navigate = useNavigate()

  const stagger = {
    container: { show: { transition: { staggerChildren: 0.1 } } },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    },
  }

  return (
    <Layout>
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-12 pb-12 pt-4">
        
        {/* Hero Section */}
        <motion.div variants={stagger.item} className="text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent-blue/10 blur-[60px] -z-10" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple tracking-tight mb-4 leading-tight">
            Verification, <br />Not Trust.
          </h1>
          <p className="text-base text-text-secondary mb-8 max-w-sm mx-auto">
            Track investments with cryptographic transparency and zero-knowledge privacy.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button fullWidth onClick={() => navigate('/auth?role=investor')} className="!py-3 shadow-lg shadow-accent-blue/20">
              Join as Investor
            </Button>
            <Button fullWidth onClick={() => navigate('/auth?role=founder')} className="!py-3 !bg-dark-surface/50 !text-text-primary border border-accent-purple/30 hover:border-accent-purple/60">
              Join as Founder
            </Button>
          </div>
        </motion.div>

        {/* Problem Section */}
        <motion.div variants={stagger.item}>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase text-[11px] mb-1 text-accent-amber">The Problem</h2>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Why Startups Fail Investors</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="text-center !p-6 border-accent-amber/20">
              <div className="w-12 h-12 bg-accent-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🙈</span>
              </div>
              <h4 className="font-bold text-text-primary mb-2 text-sm">Lack of Transparency</h4>
              <p className="text-xs text-text-secondary">Funds disappear into black boxes with no clear visibility on burn rate.</p>
            </GlassCard>
            <GlassCard className="text-center !p-6 border-accent-amber/20">
              <div className="w-12 h-12 bg-accent-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💸</span>
              </div>
              <h4 className="font-bold text-text-primary mb-2 text-sm">Misuse of Funds</h4>
              <p className="text-xs text-text-secondary">Capital is often rerouted for unauthorized non-milestone expenditures.</p>
            </GlassCard>
            <GlassCard className="text-center !p-6 border-accent-amber/20">
              <div className="w-12 h-12 bg-accent-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⏳</span>
              </div>
              <h4 className="font-bold text-text-primary mb-2 text-sm">No Real-Time Tracking</h4>
              <p className="text-xs text-text-secondary">Quarterly reports are too slow. Investors react months after the damage is done.</p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Solution Section */}
        <motion.div variants={stagger.item}>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase text-[11px] mb-1 text-accent-green">The Solution</h2>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Cryptographic Governance</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Blockchain Integrity', icon: '⛓️', desc: 'Immutable ledger for every expense.' },
              { title: 'Encrypted Privacy (FHE)', icon: '🔐', desc: 'Verify balances without exposing raw data.' },
              { title: 'Real-Time Tracking', icon: '⚡', desc: 'Instant visibility on burn and runways.' },
              { title: 'Investor Voting', icon: '🗳️', desc: 'Consensus-driven milestone unlocks.' }
            ].map((feature, i) => (
              <GlassCard key={i} className="!p-4 border-accent-green/10 bg-accent-green/5">
                <span className="block text-xl mb-2">{feature.icon}</span>
                <h4 className="font-bold text-text-primary text-[13px] mb-1">{feature.title}</h4>
                <p className="text-[10px] text-text-secondary leading-tight">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div variants={stagger.item}>
           <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase text-[11px] mb-1 text-accent-blue">Workflow</h2>
            <h3 className="text-2xl font-bold text-text-primary mb-2">How It Works</h3>
          </div>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-dark-border" />
            <div className="space-y-6 relative">
              {[
                { title: 'Investor funds startup', icon: '1' },
                { title: 'Funds locked in escrow', icon: '2' },
                { title: 'Founder logs expenses', icon: '3' },
                { title: 'Data hashed & stored', icon: '4' },
                { title: 'Investors vote', icon: '5' },
                { title: 'Funds released', icon: '6', color: 'bg-accent-green text-dark-bg' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shrink-0 ${step.color || 'bg-dark-surface border border-dark-border text-text-primary'}`}>
                    {step.icon}
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={stagger.item} className="text-center mt-8">
          <GlassCard className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/30 !py-8">
            <h3 className="text-2xl font-bold text-text-primary mb-3">Start Investing with Confidence</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">Join the decentralized platform rebuilding trust in venture capital.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto justify-center w-full">
              <Button onClick={() => navigate('/auth?role=investor')} className="!py-2.5">
                Join as Investor
              </Button>
              <Button onClick={() => navigate('/auth?role=founder')} className="!py-2.5 !bg-transparent border border-accent-purple/50 text-text-primary">
                Join as Founder
              </Button>
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>
    </Layout>
  )
}
