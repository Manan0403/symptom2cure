import React, { useEffect, useState } from 'react'
import { X, BookOpen, Compass, Thermometer, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MateriaMedicaDrawer({
  remedyId,
  onClose,
  activeSymptoms = []
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!remedyId) return

    async function fetchRemedyDetails() {
      try {
        setLoading(true)
        const res = await fetch(`/api/remedies/${remedyId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to load remedy details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRemedyDetails()
  }, [remedyId])

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!remedyId) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-ink/30 backdrop-blur-xs flex justify-end">
        
        {/* Backdrop click */}
        <div className="flex-1" onClick={onClose} />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-xl bg-paper-50 border-l border-archival shadow-2xl h-full flex flex-col overflow-hidden relative z-10"
        >
          
          {/* Drawer Masthead */}
          <div className="p-6 border-b border-archival bg-paper-100/90 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs uppercase tracking-widest text-sage font-bold">
                  Materia Medica Archival Entry
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-paper-200 border border-archival text-ink-muted">
                  ID: #{remedyId}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-ink">
                {data?.full_name || 'Loading Remedy...'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm font-bold text-terracotta">
                  {data?.abbreviation}
                </span>
                {data?.common_name && (
                  <span className="text-xs text-ink-muted font-sans italic">
                    · {data.common_name}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-archival text-ink-subtle hover:text-ink hover:bg-paper-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-ink-subtle">
                Retrieving Boericke & Kent archival entries...
              </div>
            ) : data ? (
              <>
                {/* Taxonomy & Botanical Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-paper-100 border border-archival">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
                      Classification & Kingdom
                    </div>
                    <div className="font-serif text-sm font-semibold text-ink mt-0.5">
                      {data.kingdom || 'Classical Polycrest'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-paper-100 border border-archival">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
                      Thermal Disposition
                    </div>
                    <div className="font-serif text-sm font-semibold text-ink mt-0.5">
                      {data.thermal || 'Constitutional'}
                    </div>
                  </div>
                </div>

                {/* Classical Keynotes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sage" />
                    <h3 className="font-serif text-base font-bold text-ink">
                      Classical Keynotes & Mental State
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl bg-paper-100 border border-archival font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {data.keynotes}
                  </div>
                </div>

                {/* Modalities (Aggravation & Amelioration) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sage" />
                    <h3 className="font-serif text-base font-bold text-ink">
                      Clinical Modalities
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl bg-paper-100 border border-archival font-sans text-xs text-ink-muted leading-relaxed">
                    {data.modalities}
                  </div>
                </div>

                {/* Clinical Indications */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                    <h3 className="font-serif text-base font-bold text-ink">
                      Primary Clinical Indications
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl bg-paper-100 border border-archival font-sans text-xs text-ink-muted leading-relaxed">
                    {data.clinical_indications}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-archival bg-paper-100 flex items-center justify-between text-xs font-mono text-ink-subtle">
            <span>Kent's Repertory Archive</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-paper-50 hover:bg-paper-200 text-ink border border-archival text-xs font-serif transition-colors"
            >
              Close Entry
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
