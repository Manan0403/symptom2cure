import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ChapterNavigator from './components/ChapterNavigator'
import SymptomBasket from './components/SymptomBasket'
import RepertorizationResults from './components/RepertorizationResults'
import MateriaMedicaDrawer from './components/MateriaMedicaDrawer'
import OmniSearchModal from './components/OmniSearchModal'
import DatabaseModal from './components/DatabaseModal'
import { Sparkles, BookOpen, Layers, Info } from 'lucide-react'

export default function App() {
  const [status, setStatus] = useState(null)
  const [weights, setWeights] = useState({ 1: 3, 2: 2, 3: 1 })
  const [basket, setBasket] = useState([])
  const [resultsData, setResultsData] = useState(null)
  const [selectedRemedyId, setSelectedRemedyId] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDbModalOpen, setIsDbModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch initial engine status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status')
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        }
      } catch (err) {
        console.error('Error fetching status:', err)
      }
    }
    fetchStatus()
  }, [])

  // Keyboard shortcut for Command+K and Command+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (basket.length > 0) {
          e.preventDefault()
          handleRepertorize()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [basket, weights])

  // Helper to add rubric to basket
  const handleAddRubric = async (rubricId) => {
    if (basket.some((item) => item.rubric_id === rubricId)) return

    try {
      const res = await fetch(`/api/rubrics/${rubricId}`)
      if (res.ok) {
        const item = await res.json()
        setBasket((prev) => [...prev, item])
      }
    } catch (err) {
      console.error('Failed to add rubric:', err)
    }
  }

  // Helper to remove rubric from basket
  const handleRemoveRubric = (rubricId) => {
    setBasket((prev) => prev.filter((item) => item.rubric_id !== rubricId))
  }

  // Clear entire basket
  const handleClearBasket = () => {
    setBasket([])
    setResultsData(null)
  }

  // Execute repertorization
  const handleRepertorize = async () => {
    if (basket.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/repertorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rubric_ids: basket.map((item) => item.rubric_id),
          weights: weights
        })
      })
      if (res.ok) {
        const data = await res.json()
        setResultsData(data)
        
        // Smooth scroll down to results section
        setTimeout(() => {
          document.getElementById('repertorization-results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 100)
      }
    } catch (err) {
      console.error('Repertorization error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-sage/15 selection:text-sage">
      
      {/* Header Bar */}
      <Header
        status={status}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        weights={weights}
        onUpdateWeights={setWeights}
        selectedCount={basket.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Editorial Welcome Banner */}
        <div className="mb-6 pb-6 border-b border-archival flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-sage font-bold">
              Classical Homeopathic Methodology
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">
              Clinical Repertorization & Totality Synthesis
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl font-sans leading-relaxed">
              Construct the patient's totality of symptoms across Kent's 37 chapters.
              Assign weighted clinical intensities to evaluate polychrest remedies and uncover the true simillimum.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-ink-subtle">
            <span className="px-2.5 py-1 rounded-lg bg-paper-100 border border-archival">
              {status?.total_rubrics || 155} Rubrics
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-paper-100 border border-archival">
              {status?.total_remedies || 650} Remedies
            </span>
          </div>
        </div>

        {/* Dual Split Pane: Chapter Navigator (Left) + Case Totality Basket (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ChapterNavigator
              onAddRubric={handleAddRubric}
              onRemoveRubric={handleRemoveRubric}
              selectedRubricIds={basket.map((b) => b.rubric_id)}
            />
          </div>

          <div className="lg:col-span-5">
            <SymptomBasket
              basket={basket}
              onRemoveRubric={handleRemoveRubric}
              onClearBasket={handleClearBasket}
              onRepertorize={handleRepertorize}
              loading={loading}
            />
          </div>
        </div>

        {/* Repertorization Results Section */}
        <div id="repertorization-results">
          {resultsData && (
            <RepertorizationResults
              results={resultsData.remedies}
              rubrics={resultsData.rubrics}
              weights={weights}
              onSelectRemedy={(id) => setSelectedRemedyId(id)}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-archival bg-paper-100 py-6 mt-16 text-xs text-ink-subtle font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-ink">Kent's Repertory</span>
            <span>·</span>
            <span>Based on Dr. James Tyler Kent's Repertory of Homeopathic Materia Medica</span>
          </div>
          <div className="font-mono text-[11px]">
            Archival Edition · Crafted with 21st.dev & Motion.ui Principles
          </div>
        </div>
      </footer>

      {/* Slide-over Materia Medica Drawer */}
      <MateriaMedicaDrawer
        remedyId={selectedRemedyId}
        onClose={() => setSelectedRemedyId(null)}
        activeSymptoms={basket}
      />

      {/* OmniSearch Modal (⌘K) */}
      <OmniSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddRubric={handleAddRubric}
        onRemoveRubric={handleRemoveRubric}
        selectedRubricIds={basket.map((b) => b.rubric_id)}
      />

      {/* Database Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={status}
        onModeChanged={(newStatus) => setStatus(newStatus)}
      />

    </div>
  )
}
