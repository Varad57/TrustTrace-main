import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div 
          className="w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Select Your Role</h1>
            <p className="text-sm text-text-secondary">How do you want to use TrustTrace?</p>
          </div>

          <GlassCard className="relative overflow-hidden cursor-pointer" onTap={() => navigate('/auth?role=investor')}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                    <path d="M12 18V6"/>
                  </svg>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-text-primary">Investor</h3>
                   <p className="text-sm text-text-secondary">Track funds securely</p>
                </div>
             </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden cursor-pointer" onTap={() => navigate('/auth?role=founder')}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-text-primary">Founder</h3>
                   <p className="text-sm text-text-secondary">Release milestones</p>
                </div>
             </div>
          </GlassCard>

        </motion.div>
      </div>
    </Layout>
  )
}
