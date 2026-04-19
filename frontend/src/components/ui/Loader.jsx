import { motion } from 'framer-motion'

export function Spinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(30, 37, 64, 0.6)',
          borderTopColor: '#3B82F6',
          borderRightColor: '#8B5CF6',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, minHeight: height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <SkeletonLine width="40%" height="0.75rem" />
      <SkeletonLine width="70%" height="1.5rem" />
      <SkeletonLine width="55%" height="0.75rem" />
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="60%" height="0.75rem" />
            <SkeletonLine width="40%" height="0.6rem" />
          </div>
          <SkeletonLine width="4rem" height="0.75rem" />
        </div>
      ))}
    </div>
  )
}
