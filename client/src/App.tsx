import React, { useState, useEffect } from 'react'
import { SankeyVisualization } from './components/SankeyVisualization'
import { StatsPanel } from './components/StatsPanel'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorMessage } from './components/ErrorMessage'
import type { SankeyData, GraphStats } from '@/types/jira'
import './App.css'

function App() {
  const [sankeyData, setSankeyData] = useState<SankeyData | null>(null)
  const [stats, setStats] = useState<GraphStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [issuesResponse, statsResponse] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/stats')
      ])

      if (!issuesResponse.ok) {
        throw new Error(`Issues API error: ${issuesResponse.statusText}`)
      }

      if (!statsResponse.ok) {
        throw new Error(`Stats API error: ${statsResponse.statusText}`)
      }

      const issuesData = await issuesResponse.json()
      const statsData = await statsResponse.json()

      if (!issuesData.success) {
        throw new Error(issuesData.error?.message || 'Failed to fetch issues')
      }

      if (!statsData.success) {
        throw new Error(statsData.error?.message || 'Failed to fetch stats')
      }

      setSankeyData(issuesData.data)
      setStats(statsData.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Enterprise Jira Visualizer</h1>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="refresh-button"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRefresh}
          />
        )}

        {!loading && !error && sankeyData && stats && (
          <div className="app-content">
            <aside className="app-sidebar">
              <StatsPanel stats={stats} metadata={sankeyData.metadata} />
            </aside>
            
            <section className="app-visualization">
              <SankeyVisualization data={sankeyData} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App