import React, { useState } from 'react'
import { X, Database, CheckCircle2, AlertCircle, HardDrive, Wifi, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DatabaseModal({
  isOpen,
  onClose,
  status,
  onModeChanged
}) {
  const [mode, setMode] = useState(status?.mode || 'local')
  const [dbUrl, setDbUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!isOpen) return null

  const handleSave = async () => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          db_url: dbUrl.trim() || undefined
        })
      })
      if (res.ok) {
        const data = await res.json()
        onModeChanged(data)
        setMsg({ type: 'success', text: `Switched to ${data.mode_label}` })
        setTimeout(() => onClose(), 1000)
      } else {
        setMsg({ type: 'error', text: 'Failed to switch database mode.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-paper-50 border border-archival rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-archival bg-paper-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-sage" />
              <div>
                <h3 className="font-serif text-base font-bold text-ink">
                  Data Engine & Storage Source
                </h3>
                <p className="text-xs text-ink-subtle">
                  Toggle between offline local CSV backups and live Supabase PostgreSQL
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink-subtle hover:text-ink rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 text-xs font-sans">
            
            {/* Status overview cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-paper-100 border border-archival">
                <div className="text-[10px] font-mono uppercase text-ink-subtle">Rubrics</div>
                <div className="font-mono text-sm font-bold text-ink mt-0.5">{status?.total_rubrics || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-paper-100 border border-archival">
                <div className="text-[10px] font-mono uppercase text-ink-subtle">Remedies</div>
                <div className="font-mono text-sm font-bold text-ink mt-0.5">{status?.total_remedies || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-paper-100 border border-archival">
                <div className="text-[10px] font-mono uppercase text-ink-subtle">Mappings</div>
                <div className="font-mono text-sm font-bold text-ink mt-0.5">{status?.total_mappings || 0}</div>
              </div>
            </div>

            {/* Mode selection radio cards */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-ink block">
                Select Active Data Source:
              </label>

              <div
                onClick={() => setMode('local')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  mode === 'local'
                    ? 'bg-sage-light border-sage/60 ring-1 ring-sage/30'
                    : 'bg-paper-100 border-archival hover:border-archival-dark'
                }`}
              >
                <HardDrive className={`w-5 h-5 shrink-0 mt-0.5 ${mode === 'local' ? 'text-sage' : 'text-ink-subtle'}`} />
                <div className="flex-1">
                  <div className="font-serif font-semibold text-ink text-sm">
                    Offline Local Backup Archive
                  </div>
                  <div className="text-ink-subtle text-[11px] mt-0.5">
                    Instant sub-millisecond query responses directly from local bundled CSV files. Recommended for offline and testing environments.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setMode('live')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  mode === 'live'
                    ? 'bg-sage-light border-sage/60 ring-1 ring-sage/30'
                    : 'bg-paper-100 border-archival hover:border-archival-dark'
                }`}
              >
                <Wifi className={`w-5 h-5 shrink-0 mt-0.5 ${mode === 'live' ? 'text-sage' : 'text-ink-subtle'}`} />
                <div className="flex-1">
                  <div className="font-serif font-semibold text-ink text-sm">
                    Live Supabase PostgreSQL Database
                  </div>
                  <div className="text-ink-subtle text-[11px] mt-0.5">
                    Connects directly to the live cloud Supabase database for dynamic sync and clinical ingestion.
                  </div>
                </div>
              </div>
            </div>

            {/* DB URL Input (if live) */}
            {mode === 'live' && (
              <div>
                <label className="block text-xs font-mono text-ink-muted mb-1">
                  Supabase Connection URL (Optional override):
                </label>
                <input
                  type="password"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="postgresql://postgres:***@db.***.supabase.co:5432/postgres"
                  className="w-full p-2.5 rounded-xl border border-archival bg-paper-100 text-xs font-mono text-ink focus:outline-none focus:border-sage"
                />
              </div>
            )}

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success' ? 'bg-sage-light text-sage border border-sage/40' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-archival bg-paper-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-archival bg-paper-50 hover:bg-paper-200 text-xs font-sans text-ink-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-sage hover:bg-sage-hover text-paper-50 text-xs font-serif font-semibold transition-colors flex items-center gap-1.5"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Save & Switch Engine</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
