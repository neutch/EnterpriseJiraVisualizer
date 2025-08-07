import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock fetch responses
const mockSankeyData = {
  nodes: [
    { id: 'TEST-1', name: 'Test Project', category: 'project', value: 5, metadata: {} }
  ],
  links: [],
  metadata: {
    totalIssues: 1,
    projectCount: 1,
    lastUpdated: '2023-01-01T00:00:00Z',
    jqlFilter: 'test filter'
  }
}

const mockStats = {
  totalNodes: 1,
  totalLinks: 0,
  nodesByCategory: { project: 1 },
  linksByType: {},
  averageStoryPoints: 0,
  statusDistribution: { 'In Progress': 1 }
}

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders the app header', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSankeyData })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats })
      } as Response)

    render(<App />)
    
    expect(screen.getByText('Enterprise Jira Visualizer')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSankeyData })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats })
      } as Response)

    render(<App />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays error message when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  it('handles refresh button click', async () => {
    mockFetch
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockSankeyData })
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStats })
      } as Response)

    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Refresh'))
    
    expect(mockFetch).toHaveBeenCalledWith('/api/issues')
    expect(mockFetch).toHaveBeenCalledWith('/api/stats')
  })
})