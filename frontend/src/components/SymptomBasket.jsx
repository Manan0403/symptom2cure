import React from 'react'
import { ShoppingBag, Trash2, ArrowRight, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SymptomBasket({
  basket,
  onRemoveRubric,
  onClearBasket,
  onRepertorize,
  loading
}) {
  const count = basket.length

  return (
    <div className="bg-paper-50 border border-archival rounded-2xl shadow-paper overflow-hidden flex flex-col h-[520px]">
      
      {/* Basket Header */}
      <div className="px-4 py-3 border-b border-archival bg-paper-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sage" />
          <h2 className="font-serif text-sm font-semibold text-ink">
            Clinical Case Totality
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sage-light text-sage border border-sage/30">
            {count} {count === 1 ? 'symptom' : 'symptoms'}
          </span>
          {count > 0 && (
            <button
              onClick={onClearBasket}
              className="text-ink-subtle hover:text-rose-600 p-1 rounded transition-colors"
              title="Clear all symptoms"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Basket Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {count === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-archival rounded-xl">
            <div className="w-12 h-12 rounded-full bg-paper-200/70 flex items-center justify-center mb-3 text-ink-subtle">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="font-serif text-sm font-medium text-ink">
              Your Symptom Basket is Empty
            </p>
            <p className="text-xs text-ink-subtle mt-1 max-w-xs font-sans">
              Select symptoms from Kent's taxonomy on the left or press <kbd className="font-mono bg-paper-200 px-1 py-0.5 rounded text-[10px]">⌘K</kbd> to search instantly.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {basket.map((item, idx) => {
              const pathParts = item.path ? item.path.split(' > ') : [item.name]
              const rootChapter = pathParts[0]
              const leafSymptom = pathParts[pathParts.length - 1]
              const subPath = pathParts.slice(1, -1).join(' › ')

              return (
                <motion.div
                  key={item.rubric_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="p-3 rounded-xl bg-paper-100 border border-archival hover:border-archival-dark transition-all shadow-subtle group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] text-ink-subtle">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-paper-200 text-sage border border-archival font-semibold">
                        {rootChapter}
                      </span>
                      {subPath && (
                        <span className="text-[11px] text-ink-subtle truncate">
                          {subPath}
                        </span>
                      )}
                    </div>
                    <div className="font-serif text-sm font-semibold text-ink leading-snug">
                      {leafSymptom}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveRubric(item.rubric_id)}
                    className="p-1.5 text-ink-subtle hover:text-rose-600 rounded-lg hover:bg-paper-200 transition-colors opacity-70 group-hover:opacity-100"
                    title="Remove symptom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Basket Footer / Repertorize Action */}
      <div className="p-3 border-t border-archival bg-paper-100 flex flex-col gap-2">
        <button
          onClick={onRepertorize}
          disabled={count === 0 || loading}
          className={`w-full py-2.5 px-4 rounded-xl font-serif text-sm font-semibold flex items-center justify-center gap-2 shadow-subtle transition-all cursor-pointer ${
            count === 0 || loading
              ? 'bg-paper-300 text-ink-subtle/50 cursor-not-allowed shadow-none'
              : 'bg-sage hover:bg-sage-hover text-paper-50 active:scale-[0.99]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-paper-50/40 border-t-paper-50 rounded-full animate-spin" />
              <span>Analyzing Materia Medica Totality...</span>
            </>
          ) : (
            <>
              <span>Repertorize Simillimum</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {count > 0 && (
          <div className="flex items-center justify-between text-[11px] text-ink-subtle font-mono px-1">
            <span>Kent Weight Scoring</span>
            <span className="text-sage font-medium">Ready for synthesis</span>
          </div>
        )}
      </div>

    </div>
  )
}
