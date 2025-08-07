import React from 'react'
import type { GraphStats, SankeyData } from '@/types/jira'

interface StatsPanelProps {
  stats: GraphStats
  metadata: SankeyData['metadata']
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, metadata }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusEmoji = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('done') || lowerStatus.includes('resolved')) return '✅'
    if (lowerStatus.includes('progress') || lowerStatus.includes('active')) return '🟡'
    if (lowerStatus.includes('todo') || lowerStatus.includes('open')) return '⏳'
    return '📋'
  }

  return (
    <div className="stats-panel">
      <h2>📊 Project Overview</h2>
      
      <div className="stat-section">
        <h3>🔢 Summary</h3>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Total Issues:</span>
            <span className="stat-value">{metadata.totalIssues}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Projects:</span>
            <span className="stat-value">{metadata.projectCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{stats.totalNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Links:</span>
            <span className="stat-value">{stats.totalLinks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Story Points:</span>
            <span className="stat-value">{stats.averageStoryPoints.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="stat-section">
        <h3>📈 Issue Types</h3>
        <div className="stat-list">
          {Object.entries(stats.nodesByCategory).map(([category, count]) => (
            <div key={category} className="stat-item">
              <span className="stat-label">
                {category.charAt(0).toUpperCase() + category.slice(1)}s:
              </span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-section">
        <h3>🔗 Relationships</h3>
        <div className="stat-list">
          {Object.entries(stats.linksByType).map(([type, count]) => (
            <div key={type} className="stat-item">
              <span className="stat-label">
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              </span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-section">
        <h3>📋 Status Distribution</h3>
        <div className="stat-list">
          {Object.entries(stats.statusDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([status, count]) => (
            <div key={status} className="stat-item">
              <span className="stat-label">
                {getStatusEmoji(status)} {status}:
              </span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-section">
        <h3>🔍 Query Info</h3>
        <div className="query-info">
          <div className="stat-item">
            <span className="stat-label">JQL Filter:</span>
            <div className="jql-filter">{metadata.jqlFilter}</div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{formatDate(metadata.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}