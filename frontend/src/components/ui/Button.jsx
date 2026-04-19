import { motion } from 'framer-motion'

const variants = {
  primary: 'gradient-primary gradient-glow text-white font-semibold shadow-lg',
  secondary: 'bg-transparent border border-dark-border-light text-text-secondary hover:text-text-primary hover:border-accent-blue/50',
  ghost: 'bg-dark-surface/50 text-text-secondary hover:bg-dark-surface hover:text-text-primary',
  danger: 'bg-accent-red/15 text-accent-red border border-accent-red/20',
}

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-3 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  onClick,
  className = '',
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      onClick={disabled ? undefined : onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium cursor-pointer
        min-h-[44px]
        transition-colors duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}
