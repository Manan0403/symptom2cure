import React, { useState, useEffect } from 'react'
import { ChevronRight, Folder, FolderOpen, Plus, Check, Search, BookOpen, Layers } from 'lucide-react'

export default function ChapterNavigator({
  onAddRubric,
  onRemoveRubric,
  selectedRubricIds = []
}) {
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [childRubrics, setChildRubrics] = useState([])
  const [activeSubParent, setActiveSubParent] = useState(null)
  const [subChildRubrics, setSubChildRubrics] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterText, setFilterText] = useState('')

  // Load root chapters on mount
  useEffect(() => {
    async function loadChapters() {
      try {
        setLoading(true)
        const res = await fetch('/api/chapters')
        if (res.ok) {
          const data = await res.json()
          setChapters(data)
          if (data.length > 0) {
            handleSelectChapter(data[0])
          }
        }
      } catch (err) {
        console.error('Failed to load chapters:', err)
      } finally {
        setLoading(false)
      }
    }
    loadChapters()
  }, [])

  // Handle selecting a root chapter
  const handleSelectChapter = async (chap) => {
    setSelectedChapter(chap)
    setActiveSubParent(null)
    setSubChildRubrics([])
    try {
      setLoading(true)
      const res = await fetch(`/api/rubrics/children/${chap.rubric_id}`)
      if (res.ok) {
        const data = await res.json()
        setChildRubrics(data)
      }
    } catch (err) {
      console.error('Failed to load children:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle drilling into a sub-rubric
  const handleSelectSubParent = async (rubric) => {
    if (activeSubParent?.rubric_id === rubric.rubric_id) {
      setActiveSubParent(null)
      setSubChildRubrics([])
      return
    }

    setActiveSubParent(rubric)
    try {
      const res = await fetch(`/api/rubrics/children/${rubric.rubric_id}`)
      if (res.ok) {
        const data = await res.json()
        setSubChildRubrics(data)
      }
    } catch (err) {
      console.error('Failed to load sub-children:', err)
    }
  }

  const filteredChildren = childRubrics.filter((r) =>
    r.name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="bg-paper-50 border border-archival rounded-2xl shadow-paper overflow-hidden flex flex-col h-[520px]">
      
      {/* Navigator Header */}
      <div className="px-4 py-3 border-b border-archival bg-paper-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sage" />
          <h2 className="font-serif text-sm font-semibold text-ink">
            Kent Taxonomy Explorer
          </h2>
        </div>
        <span className="text-[11px] font-mono text-ink-subtle">
          {chapters.length} Chapters
        </span>
      </div>

      <div className="grid grid-cols-12 flex-1 min-h-0 divide-x divide-archival">
        
        {/* Column 1: Kent's Root Chapters */}
        <div className="col-span-4 overflow-y-auto p-2 space-y-1 bg-paper-100/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle px-2 py-1">
            Chapters
          </div>
          {chapters.map((chap) => {
            const isSelected = selectedChapter?.rubric_id === chap.rubric_id
            return (
              <button
                key={chap.rubric_id}
                onClick={() => handleSelectChapter(chap)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-serif font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-paper-50 text-sage font-bold shadow-subtle border border-archival'
                    : 'text-ink-muted hover:bg-paper-200/60 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isSelected ? (
                    <FolderOpen className="w-3.5 h-3.5 text-sage shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                  )}
                  <span className="truncate">{chap.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-sage' : 'text-ink-subtle/50'}`} />
              </button>
            )
          })}
        </div>

        {/* Column 2: Selected Chapter's Child Rubrics */}
        <div className="col-span-8 flex flex-col min-h-0 bg-paper-50">
          
          {/* Quick Filter Bar */}
          <div className="p-2 border-b border-archival bg-paper-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-ink-subtle ml-1 shrink-0" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={`Filter in ${selectedChapter?.name || 'chapter'}...`}
              className="w-full bg-transparent text-xs text-ink placeholder-ink-subtle focus:outline-none font-sans"
            />
          </div>

          {/* Rubrics List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-ink-subtle font-mono">
                Loading rubrics...
              </div>
            ) : filteredChildren.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-subtle font-sans">
                No rubrics found under this chapter.
              </div>
            ) : (
              filteredChildren.map((rubric) => {
                const isSelected = selectedRubricIds.includes(rubric.rubric_id)
                const isExpanded = activeSubParent?.rubric_id === rubric.rubric_id

                return (
                  <div key={rubric.rubric_id} className="space-y-1">
                    <div
                      className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 text-xs ${
                        isExpanded
                          ? 'bg-paper-100 border-archival-dark'
                          : 'bg-paper-50 border-transparent hover:border-archival hover:bg-paper-100/60'
                      }`}
                    >
                      <div
                        onClick={() => rubric.has_children && handleSelectSubParent(rubric)}
                        className="flex-1 min-w-0 cursor-pointer flex items-center gap-1.5"
                      >
                        {rubric.has_children && (
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-ink-subtle shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90 text-sage' : ''
                            }`}
                          />
                        )}
                        <span className="font-serif font-medium text-ink truncate">
                          {rubric.name}
                        </span>
                        {rubric.has_children && (
                          <span className="text-[10px] text-ink-subtle font-mono bg-paper-200 px-1 rounded">
                            sub
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <button
                            onClick={() => onRemoveRubric(rubric.rubric_id)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-sage bg-sage-light border border-sage/40 rounded hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                            title="Remove from basket"
                          >
                            <Check className="w-3 h-3" />
                            <span>Added</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onAddRubric(rubric.rubric_id)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-ink-muted hover:text-ink bg-paper-100 hover:bg-paper-200 border border-archival rounded transition-colors"
                            title="Add rubric to basket"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sub-children drilldown (Nested Level) */}
                    {isExpanded && (
                      <div className="pl-5 pr-1 py-1 space-y-1 border-l-2 border-sage/40 ml-2">
                        {subChildRubrics.length === 0 ? (
                          <div className="text-[11px] text-ink-subtle italic py-1">
                            No further modalities
                          </div>
                        ) : (
                          subChildRubrics.map((sub) => {
                            const isSubSelected = selectedRubricIds.includes(sub.rubric_id)
                            return (
                              <div
                                key={sub.rubric_id}
                                className="p-1.5 rounded-lg bg-paper-100/80 hover:bg-paper-200/80 flex items-center justify-between text-xs transition-colors"
                              >
                                <span className="font-sans text-ink-muted truncate pr-2">
                                  {sub.name}
                                </span>
                                {isSubSelected ? (
                                  <button
                                    onClick={() => onRemoveRubric(sub.rubric_id)}
                                    className="p-1 text-sage hover:text-rose-600 rounded"
                                    title="Remove from basket"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onAddRubric(sub.rubric_id)}
                                    className="p-1 text-ink-subtle hover:text-ink rounded hover:bg-paper-300"
                                    title="Add to basket"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
