import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'investor' // Default to investor if missing
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProceed = () => {
    if (role === 'founder') {
      navigate('/founder/home')
    } else {
      navigate('/investor-dashboard')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          className="w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Create Account</h1>
            <p className="text-sm text-text-secondary">Join TrustTrace to proceed</p>
          </div>

          <GlassCard className="relative overflow-hidden">
             {/* Fields */}
             <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe"
                    className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com"
                    className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Password</label>
                  <input
                    type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••"
                    className="w-full bg-dark-surface/80 border border-dark-border rounded-xl py-3 px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                  />
                </div>
             </div>

             {/* Buttons */}
             <div className="flex flex-col gap-3">
                <Button fullWidth onClick={handleProceed} className={role === 'founder' ? '!bg-accent-purple/20 !text-white hover:!bg-accent-purple/40 border border-accent-purple/30' : '!bg-accent-green/20 !text-white hover:!bg-accent-green/40 border border-accent-green/30'}>
                  Continue as {role === 'founder' ? 'Founder' : 'Investor'}
                </Button>
             </div>
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  )
}
