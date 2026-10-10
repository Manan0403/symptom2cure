import React, { useState } from 'react'
import { Search, Database, Sliders, Sparkles, BookOpen, RefreshCw } from 'lucide-react'

export default function Header({ 
  status, 
  onOpenSearch, 
  onOpenDbModal, 
  weights, 
  onUpdateWeights,
  selectedCount
}) {
  const [showWeightsMenu, setShowWeightsMenu] = useState(false)

  return (
    <header className="border-b border-archival bg-paper/95 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3.5 flex items-center justify-between gap-4">
          
          {/* Masthead Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sage text-paper-50 flex items-center justify-center font-serif text-lg font-bold shadow-subtle">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-ink leading-tight">
                  Kent's Repertory
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-paper-200 text-ink-muted rounded border border-archival">
                  v2.4 Archival
                </span>
              </div>
              <p className="text-xs text-ink-subtle font-sans hidden sm:block">
                Clinical Repertorization & Materia Medica Totality
              </p>
            </div>
          </div>

          {/* Center Search Trigger (Raycast / 21st.dev style) */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-ink-muted bg-paper-100 hover:bg-paper-200/70 border border-archival rounded-lg shadow-paper transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-ink-subtle group-hover:text-sage transition-colors" />
                <span>Search Kent's rubrics across all chapters...</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] bg-paper-50 border border-archival px-1.5 py-0.5 rounded text-ink-subtle shadow-subtle">
                <span>⌘</span>
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right Controls: Weights & Database Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-ink-muted hover:text-ink hover:bg-paper-200 rounded-lg border border-archival"
              title="Search Rubrics"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Grade Weights Quick Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWeightsMenu(!showWeightsMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                  showWeightsMenu 
                    ? 'bg-paper-200 border-ink/40 text-ink' 
                    : 'bg-paper-100 border-archival hover:bg-paper-200 text-ink-muted'
                }`}
                title="Configure Grade Weights"
              >
                <Sliders className="w-3.5 h-3.5 text-sage" />
                <span className="hidden sm:inline">Weights:</span>
                <span className="font-semibold text-ink">{weights[1]}:{weights[2]}:{weights[3]}</span>
              </button>

              {/* Weights Popover */}
              {showWeightsMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-paper-50 border border-archival rounded-xl shadow-elevated p-4 z-50 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-archival mb-3">
                    <span className="font-serif font-semibold text-ink text-sm">Grade Intensity Multipliers</span>
                    <button 
                      onClick={() => onUpdateWeights({ 1: 3, 2: 2, 3: 1 })}
                      className="text-[10px] text-sage hover:underline font-mono"
                    >
                      Reset (3:2:1)
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-terracotta">
                          <span className="w-2 h-2 rounded-full bg-terracotta inline-block"></span>
                          Grade 1 (Bold / Red)
                        </span>
                        <span className="font-mono font-bold text-ink">{weights[1]}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={weights[1]}
                        onChange={(e) => onUpdateWeights({ ...weights, 1: Number(e.target.value) })}
                        className="w-full accent-terracotta cursor-pointer"
                      />
                      <div className="text-[10px] text-ink-subtle">Highest clinical keynote confirmation</div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-cobalt">
                          <span className="w-2 h-2 rounded-full bg-cobalt inline-block"></span>
                          Grade 2 (Italics / Blue)
                        </span>
                        <span className="font-mono font-bold text-ink">{weights[2]}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={weights[2]}
                        onChange={(e) => onUpdateWeights({ ...weights, 2: Number(e.target.value) })}
                        className="w-full accent-cobalt cursor-pointer"
                      />
                      <div className="text-[10px] text-ink-subtle">Moderate clinical confirmation</div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-ink-muted">
                          <span className="w-2 h-2 rounded-full bg-ink-subtle inline-block"></span>
                          Grade 3 (Standard / Roman)
                        </span>
                        <span className="font-mono font-bold text-ink">{weights[3]}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={weights[3]}
                        onChange={(e) => onUpdateWeights({ ...weights, 3: Number(e.target.value) })}
                        className="w-full accent-ink-muted cursor-pointer"
                      />
                      <div className="text-[10px] text-ink-subtle">Standard repertory link</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-archival flex justify-end">
                    <button
                      onClick={() => setShowWeightsMenu(false)}
                      className="px-3 py-1 bg-sage text-paper-50 rounded text-xs font-medium hover:bg-sage-hover transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Database Connection Status Button */}
            <button
              onClick={onOpenDbModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                status?.mode === 'live'
                  ? 'bg-sage-light border-sage/40 text-sage hover:bg-sage/10'
                  : 'bg-paper-100 border-archival text-ink-muted hover:bg-paper-200'
              }`}
              title="Database Settings"
            >
              <Database className="w-3.5 h-3.5 text-sage" />
              <span className="font-medium hidden sm:inline">
                {status?.mode === 'live' ? 'Live Supabase' : 'Offline Backup'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${status?.mode === 'live' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`}></span>
            </button>

          </div>
        </div>
      </div>
    </header>
  )
}
