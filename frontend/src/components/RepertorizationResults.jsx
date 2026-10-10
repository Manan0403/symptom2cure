import React, { useState } from 'react'
import { Download, SlidersHorizontal, Search, ArrowUpRight, BarChart3, Grid, ListFilter, Info, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RepertorizationResults({
  results,
  rubrics = [],
  weights,
  onSelectRemedy
}) {
  const [activeTab, setActiveTab] = useState('cards') // 'cards' | 'grid' | 'viz'
  const [searchFilter, setSearchFilter] = useState('')
  const [minCoverage, setMinCoverage] = useState(1)
  const [hoveredCell, setHoveredCell] = useState(null) // { remedyId, rubricId }

  if (!results || results.length === 0) {
    return null
  }

  // Filtered remedies
  const filteredRemedies = results.filter((r) => {
    const matchesCoverage = r.coverage_count >= minCoverage
    const matchesSearch =
      r.abbreviation.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.full_name.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCoverage && matchesSearch
  })

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRemedies.length === 0) return
    const headers = ['Abbreviation', 'Full Name', 'Coverage', 'Coverage Count', 'Total Score', 'Covered Symptoms']
    const rows = filteredRemedies.map((r) => [
      `"${r.abbreviation}"`,
      `"${r.full_name}"`,
      `"${r.coverage}"`,
      r.coverage_count,
      r.total_score,
      `"${r.details.replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'kent_repertorization_totality.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="mt-8 bg-paper-50 border border-archival rounded-2xl shadow-paper overflow-hidden">
      
      {/* Top Banner with Navigation Tabs */}
      <div className="px-6 py-4 border-b border-archival bg-paper-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">
              Homeopathic Simillimum Synthesis
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-paper-200 border border-archival text-ink-muted">
              {filteredRemedies.length} remedies ranked
            </span>
          </div>
          <p className="text-xs text-ink-subtle font-sans mt-0.5">
            Ranked primarily by symptom totality coverage and secondarily by weighted clinical intensity.
          </p>
        </div>

        {/* Tab Switcher (Motion Primitives) */}
        <div className="flex items-center gap-1 p-1 bg-paper-200/80 rounded-xl border border-archival text-xs font-mono">
          <button
            onClick={() => setActiveTab('cards')}
            className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'cards' ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'cards' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-paper-50 rounded-lg shadow-subtle border border-archival"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5" />
              <span>Simillimum Cards</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'grid' ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'grid' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-paper-50 rounded-lg shadow-subtle border border-archival"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Grid className="w-3.5 h-3.5" />
              <span>Kent Matrix</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('viz')}
            className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'viz' ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'viz' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-paper-50 rounded-lg shadow-subtle border border-archival"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Distribution</span>
            </span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-6 py-3 border-b border-archival bg-paper-50 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          
          {/* Remedy Name Filter */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by remedy name or abbrev..."
              className="w-full pl-8 pr-3 py-1.5 bg-paper-100 border border-archival rounded-lg text-ink placeholder-ink-subtle focus:outline-none focus:border-ink/40 text-xs"
            />
          </div>

          {/* Min Coverage Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ink-muted">Min Symptoms Covered:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].filter((n) => n <= rubrics.length).map((num) => (
                <button
                  key={num}
                  onClick={() => setMinCoverage(num)}
                  className={`w-6 h-6 rounded font-mono text-xs font-medium border transition-colors ${
                    minCoverage === num
                      ? 'bg-sage text-paper-50 border-sage'
                      : 'bg-paper-100 text-ink-muted border-archival hover:bg-paper-200'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-archival bg-paper-100 hover:bg-paper-200 text-ink-muted hover:text-ink font-mono text-xs transition-colors"
          title="Export CSV Report"
        >
          <Download className="w-3.5 h-3.5 text-sage" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Content Body Based on Active Tab */}
      <div className="p-6">
        
        {/* ======================================================== */}
        {/* TAB 1: SIMILLIMUM CANDIDATE CARDS                        */}
        {/* ======================================================== */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            {filteredRemedies.length === 0 ? (
              <div className="p-12 text-center text-ink-subtle font-sans">
                No remedies match your current filter criteria.
              </div>
            ) : (
              filteredRemedies.map((remedy, idx) => (
                <div
                  key={remedy.remedy_id}
                  className="p-5 rounded-2xl bg-paper-100 border border-archival hover:border-archival-dark transition-all shadow-subtle group hover:shadow-paper"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Remedy Rank & Titles */}
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="font-serif text-3xl font-light text-ink-subtle/40 select-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-ink">
                            {remedy.full_name}
                          </h4>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-paper-200 text-ink border border-archival">
                            {remedy.abbreviation}
                          </span>
                          {remedy.kingdom && (
                            <span className="text-[11px] font-sans text-ink-subtle italic">
                              · {remedy.kingdom}
                            </span>
                          )}
                        </div>

                        {remedy.common_name && (
                          <div className="text-xs text-ink-muted font-sans mt-0.5">
                            Common Name: <span className="font-medium text-ink">{remedy.common_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Scores & Action CTA */}
                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
                          Totality Coverage
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-mono text-sm font-bold text-ink">
                            {remedy.coverage}
                          </span>
                          <span className="text-xs font-mono text-sage">
                            ({Math.round(remedy.coverage_pct)}%)
                          </span>
                        </div>
                      </div>

                      <div className="text-right pl-4 border-l border-archival">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
                          Score
                        </div>
                        <div className="font-mono text-lg font-bold text-terracotta">
                          {remedy.total_score}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectRemedy(remedy.remedy_id)}
                        className="px-3.5 py-2 rounded-xl bg-paper-50 hover:bg-sage hover:text-paper-50 text-ink border border-archival hover:border-sage text-xs font-serif font-semibold transition-all flex items-center gap-1.5 shadow-subtle group-hover:border-archival-dark"
                      >
                        <span>Materia Medica</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Covered Symptoms Chips */}
                  <div className="mt-4 pt-3 border-t border-archival/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-ink-subtle mr-1">
                      Covered Rubrics:
                    </span>
                    {Object.entries(remedy.grid_vals).map(([rubricId, grade]) => {
                      const matchedRubric = rubrics.find((r) => r.rubric_id === Number(rubricId))
                      const rubricName = matchedRubric ? matchedRubric.name : `Rubric #${rubricId}`

                      return (
                        <span
                          key={rubricId}
                          className={`inline-flex items-center gap-1 px-2 py-0.8 rounded-lg text-xs font-mono border ${
                            grade === 1
                              ? 'bg-terracotta-light text-terracotta border-terracotta/30 font-semibold'
                              : grade === 2
                              ? 'bg-cobalt-light text-cobalt border-cobalt/30 font-medium'
                              : 'bg-paper-200 text-ink-muted border-archival'
                          }`}
                          title={`${matchedRubric?.path || rubricName} (Grade ${grade})`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span className="font-serif truncate max-w-[200px]">{rubricName}</span>
                          <span className="text-[10px] opacity-80">(g.{grade})</span>
                        </span>
                      )
                    })}
                  </div>

                  {/* Materia Medica Keynote Snippet */}
                  {remedy.materia_summary && (
                    <div className="mt-3 p-3 rounded-xl bg-paper-50/80 border border-archival/80 text-xs text-ink-muted font-sans leading-relaxed italic">
                      "{remedy.materia_summary}"
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KENT CLINICAL MATRIX (CROSSHAIR GRID)             */}
        {/* ======================================================== */}
        {activeTab === 'grid' && (
          <div>
            <div className="text-xs text-ink-subtle mb-3 flex items-center justify-between">
              <span>Cross-reference matrix comparing homeopathic remedies against active symptoms totality.</span>
              <span className="font-mono text-[11px]">Hover a cell to track crosshairs</span>
            </div>

            <div className="overflow-x-auto border border-archival rounded-xl shadow-subtle bg-paper-50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-paper-200/80 border-b border-archival text-ink">
                    <th className="p-3 font-serif font-bold sticky left-0 bg-paper-200 z-20 border-r border-archival min-w-[140px]">
                      Remedy
                    </th>
                    <th className="p-3 font-mono text-center border-r border-archival w-16">
                      Cov
                    </th>
                    <th className="p-3 font-mono text-center border-r border-archival w-16">
                      Score
                    </th>
                    {rubrics.map((rubric) => {
                      const isColHovered = hoveredCell?.rubricId === rubric.rubric_id
                      return (
                        <th
                          key={rubric.rubric_id}
                          className={`p-3 font-serif font-medium border-r border-archival min-w-[140px] max-w-[180px] transition-colors ${
                            isColHovered ? 'bg-sage-light text-sage font-bold' : ''
                          }`}
                          title={rubric.path}
                        >
                          <div className="truncate">{rubric.name}</div>
                          <div className="text-[10px] font-sans text-ink-subtle truncate">
                            {rubric.path ? rubric.path.split(' > ')[0] : ''}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-archival">
                  {filteredRemedies.map((remedy) => {
                    const isRowHovered = hoveredCell?.remedyId === remedy.remedy_id

                    return (
                      <tr
                        key={remedy.remedy_id}
                        className={`transition-colors ${
                          isRowHovered ? 'bg-paper-200/60' : 'hover:bg-paper-100/50'
                        }`}
                      >
                        {/* Remedy Sticky Column */}
                        <td
                          onClick={() => onSelectRemedy(remedy.remedy_id)}
                          className={`p-3 sticky left-0 bg-paper-50 z-10 border-r border-archival cursor-pointer ${
                            isRowHovered ? 'bg-paper-200/90 text-sage font-bold' : ''
                          }`}
                        >
                          <div className="font-serif font-bold text-ink hover:text-sage flex items-center gap-1.5">
                            <span>{remedy.abbreviation}</span>
                            <span className="text-[10px] font-mono text-ink-subtle">↗</span>
                          </div>
                          <div className="text-[10px] text-ink-subtle truncate max-w-[130px]">
                            {remedy.full_name}
                          </div>
                        </td>

                        {/* Coverage Column */}
                        <td className="p-3 font-mono text-center border-r border-archival font-semibold text-ink">
                          {remedy.coverage}
                        </td>

                        {/* Total Score Column */}
                        <td className="p-3 font-mono text-center border-r border-archival font-bold text-terracotta">
                          {remedy.total_score}
                        </td>

                        {/* Rubrics Matrix Cells */}
                        {rubrics.map((rubric) => {
                          const grade = remedy.grid_vals[rubric.rubric_id]
                          const isCellHovered =
                            hoveredCell?.remedyId === remedy.remedy_id &&
                            hoveredCell?.rubricId === rubric.rubric_id

                          return (
                            <td
                              key={rubric.rubric_id}
                              onMouseEnter={() =>
                                setHoveredCell({
                                  remedyId: remedy.remedy_id,
                                  rubricId: rubric.rubric_id
                                })
                              }
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-3 text-center border-r border-archival transition-all ${
                                isCellHovered
                                  ? 'bg-sage/15 ring-2 ring-sage/40'
                                  : hoveredCell?.remedyId === remedy.remedy_id ||
                                    hoveredCell?.rubricId === rubric.rubric_id
                                  ? 'bg-paper-200/40'
                                  : ''
                              }`}
                            >
                              {grade ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                    grade === 1
                                      ? 'bg-terracotta text-paper-50 shadow-subtle'
                                      : grade === 2
                                      ? 'bg-cobalt text-paper-50 shadow-subtle'
                                      : 'bg-paper-300 text-ink'
                                  }`}
                                  title={`${remedy.abbreviation} covers "${rubric.name}" at Grade ${grade}`}
                                >
                                  {grade === 1 ? '●●● 3' : grade === 2 ? '●●○ 2' : '●○○ 1'}
                                </span>
                              ) : (
                                <span className="text-ink-subtle/30 font-mono">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Legend */}
            <div className="mt-4 p-4 rounded-xl bg-paper-100 border border-archival flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-serif font-semibold text-ink">Grade Intensity Key:</span>
                <span className="flex items-center gap-1.5 font-mono text-terracotta font-medium">
                  <span className="px-1.5 py-0.2 bg-terracotta text-paper-50 rounded text-[10px]">●●● 3</span>
                  <span>Grade 1 (Bold/Red · {weights[1]}x)</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-cobalt font-medium">
                  <span className="px-1.5 py-0.2 bg-cobalt text-paper-50 rounded text-[10px]">●●○ 2</span>
                  <span>Grade 2 (Italics/Blue · {weights[2]}x)</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-ink-muted">
                  <span className="px-1.5 py-0.2 bg-paper-300 text-ink rounded text-[10px]">●○○ 1</span>
                  <span>Grade 3 (Standard · {weights[3]}x)</span>
                </span>
              </div>
              <span className="text-ink-subtle text-[11px] font-sans">
                Swapped clinical weighting schema applied
              </span>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: VISUAL DISTRIBUTION (INTERACTIVE SVG BARS)        */}
        {/* ======================================================== */}
        {activeTab === 'viz' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-paper-100 border border-archival">
              <h4 className="font-serif text-sm font-semibold text-ink mb-1">
                Comparative Ranking of Top 15 Remedies
              </h4>
              <p className="text-xs text-ink-subtle mb-6">
                Relative comparison of Weighted Intensity Score and Symptom Coverage Totality.
              </p>

              {/* Responsive SVG Bar Chart */}
              <div className="space-y-3">
                {filteredRemedies.slice(0, 15).map((rem, index) => {
                  const maxScore = Math.max(...filteredRemedies.map((r) => r.total_score), 1)
                  const scoreWidthPct = (rem.total_score / maxScore) * 100
                  const covWidthPct = rem.coverage_pct

                  return (
                    <div
                      key={rem.remedy_id}
                      onClick={() => onSelectRemedy(rem.remedy_id)}
                      className="group cursor-pointer p-2 rounded-lg hover:bg-paper-200/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-ink-subtle w-5">{index + 1}.</span>
                          <span className="font-serif font-bold text-ink group-hover:text-sage text-sm">
                            {rem.abbreviation}
                          </span>
                          <span className="text-ink-subtle text-[11px] font-sans hidden sm:inline">
                            ({rem.full_name})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-sage font-medium">
                            {rem.coverage} ({Math.round(rem.coverage_pct)}%)
                          </span>
                          <span className="font-bold text-terracotta min-w-[50px] text-right">
                            {rem.total_score} pts
                          </span>
                        </div>
                      </div>

                      {/* Bar tracks */}
                      <div className="space-y-1">
                        {/* Score bar */}
                        <div className="w-full bg-paper-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-terracotta h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${scoreWidthPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-3 border-t border-archival flex items-center justify-between text-xs text-ink-subtle font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-terracotta rounded"></span>
                  <span>Weighted Intensity Score</span>
                </span>
                <span>Click any remedy to view full Boericke & Kent keynotes</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  )
}
