import React from 'react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <div className="error-content">
        <h3>Something went wrong</h3>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="error-retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}