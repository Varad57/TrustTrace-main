import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', onTap, noPadding = false }) {
  return (
    <motion.div
      whileTap={onTap ? { scale: 0.98, y: -2 } : undefined}
      onClick={onTap}
      className={`
        glass rounded-2xl
        ${noPadding ? '' : 'p-5'}
        ${onTap ? 'cursor-pointer active:shadow-lg' : ''}
        transition-shadow duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
