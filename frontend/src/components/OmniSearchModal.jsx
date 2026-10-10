import React, { useState, useEffect, useRef } from 'react'
import { Search, CornerDownLeft, Check, Plus, X, Layers, Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OmniSearchModal({
  isOpen,
  onClose,
  onAddRubric,
  onRemoveRubric,
  selectedRubricIds = []
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      if (query.trim() === '') {
        // Pre-fetch default/common symptoms
        fetchInitialSuggestions()
      }
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  const fetchInitialSuggestions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/rubrics/search?q=a&limit=15')
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (err) {
      console.error('Initial suggestions error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (!isOpen) return
    if (!query.trim()) {
      fetchInitialSuggestions()
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/rubrics/search?q=${encodeURIComponent(query.trim())}&limit=40`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setSelectedIndex(0)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      scrollIntoView(selectedIndex + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      scrollIntoView(selectedIndex - 1)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleToggle(results[selectedIndex].rubric_id)
    }
  }

  const scrollIntoView = (index) => {
    if (listRef.current) {
      const items = listRef.current.children
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' })
      }
    }
  }

  const handleToggle = (rubricId) => {
    if (selectedRubricIds.includes(rubricId)) {
      onRemoveRubric(rubricId)
    } else {
      onAddRubric(rubricId)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-paper-50 border border-archival rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Search Header */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-archival bg-paper-100">
            <Search className="w-5 h-5 text-ink-subtle mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by symptom, chapter, modality (e.g. 'isolation', 'acute morning', 'music')..."
              className="w-full bg-transparent text-sm sm:text-base text-ink placeholder-ink-subtle focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-ink-subtle hover:text-ink rounded mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-ink-subtle hover:text-ink rounded text-xs font-mono border border-archival px-1.5 py-0.5 bg-paper-50"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-archival/30"
          >
            {loading && results.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-subtle font-mono">
                Scanning Kent's Repertory rubrics...
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <Compass className="w-8 h-8 text-ink-subtle/50 mx-auto mb-2" />
                <p className="text-sm font-serif text-ink">No matching symptoms found</p>
                <p className="text-xs text-ink-subtle mt-1">
                  Try searching for a broader term like "pain", "morning", "music", or "fear".
                </p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = selectedRubricIds.includes(item.rubric_id)
                const isFocused = idx === selectedIndex
                const pathParts = item.path ? item.path.split(' > ') : [item.name]
                const rootChapter = pathParts[0]
                const subPath = pathParts.slice(1).join(' › ')

                return (
                  <div
                    key={item.rubric_id}
                    onClick={() => handleToggle(item.rubric_id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group px-3 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${
                      isFocused ? 'bg-paper-200/80' : 'hover:bg-paper-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-paper-200 text-sage border border-archival font-semibold">
                          {rootChapter}
                        </span>
                        <span className="font-serif text-sm font-medium text-ink truncate">
                          {item.name}
                        </span>
                      </div>
                      {subPath && (
                        <div className="text-xs text-ink-subtle truncate pl-1 flex items-center gap-1 font-sans">
                          <span>{subPath}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-mono text-sage bg-sage-light border border-sage/40 px-2 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>In Basket</span>
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-xs font-mono text-ink-muted border border-archival px-2 py-1 rounded-lg transition-colors ${
                          isFocused ? 'bg-paper-50 text-ink border-ink/40' : 'bg-transparent'
                        }`}>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 bg-paper-100 border-t border-archival flex items-center justify-between text-[11px] text-ink-subtle font-mono">
            <div className="flex items-center gap-3">
              <span><kbd className="border border-archival bg-paper-50 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="border border-archival bg-paper-50 px-1 py-0.5 rounded">↵</kbd> Add / Remove</span>
              <span><kbd className="border border-archival bg-paper-50 px-1 py-0.5 rounded">esc</kbd> Close</span>
            </div>
            <div>
              {results.length} symptoms indexed
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
