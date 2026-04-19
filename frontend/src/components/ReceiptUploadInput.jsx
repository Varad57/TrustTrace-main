import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function ReceiptUploadInput({ file, onChange, disabled }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      onChange(selected)
    }
  }

  const removeFile = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isPDF = file?.name?.toLowerCase().endsWith('.pdf')

  return (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
        Upload Receipt
      </label>

      {!file ? (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full bg-dark-surface/80 border border-dashed border-dark-border-light rounded-xl py-4 px-4 flex flex-col items-center gap-2 cursor-pointer hover:border-accent-blue/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-xs text-text-muted">Tap to upload image or PDF</span>
        </motion.button>
      ) : (
        <div className="bg-dark-surface/80 border border-dark-border rounded-xl p-3 flex items-center gap-3">
          {/* Preview */}
          {isPDF ? (
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          ) : (
            <img
              src={URL.createObjectURL(file)}
              alt="Receipt preview"
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{file.name}</p>
            <p className="text-[10px] text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={removeFile}
            className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center cursor-pointer hover:bg-accent-red/20 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
