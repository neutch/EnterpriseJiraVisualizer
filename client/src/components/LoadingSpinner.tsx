import React from 'react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <div className="loading-text">
        <div className="loading-step">📊 Fetching Jira issues...</div>
        <div className="loading-step">🔄 Transforming data...</div>
        <div className="loading-step">📈 Generating visualization...</div>
      </div>
    </div>
  )
}