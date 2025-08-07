import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatsPanel } from './StatsPanel'
import type { GraphStats, SankeyData } from '@/types/jira'

const mockStats: GraphStats = {
  totalNodes: 10,
  totalLinks: 5,
  nodesByCategory: {
    project: 2,
    feature: 3,
    epic: 2,
    story: 3
  },
  linksByType: {
    'project_to_feature': 2,
    'feature_to_epic': 2,
    'epic_to_story': 1
  },
  averageStoryPoints: 5.5,
  statusDistribution: {
    'To Do': 3,
    'In Progress': 4,
    'Done': 3
  }
}

const mockMetadata: SankeyData['metadata'] = {
  totalIssues: 10,
  projectCount: 2,
  lastUpdated: '2023-12-01T10:00:00Z',
  jqlFilter: 'project in (TEST) AND issuetype in (Story,Epic)'
}

describe('StatsPanel', () => {
  it('renders project overview title', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('📊 Project Overview')).toBeInTheDocument()
  })

  it('displays summary statistics', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('Total Issues:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Projects:')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Avg Story Points:')).toBeInTheDocument()
    expect(screen.getByText('5.5')).toBeInTheDocument()
  })

  it('displays issue type breakdown', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('📈 Issue Types')).toBeInTheDocument()
    expect(screen.getByText('Projects:')).toBeInTheDocument()
    expect(screen.getByText('Features:')).toBeInTheDocument()
    expect(screen.getByText('Epics:')).toBeInTheDocument()
    expect(screen.getByText('Storys:')).toBeInTheDocument()
  })

  it('displays status distribution with emojis', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('📋 Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('⏳ To Do:')).toBeInTheDocument()
    expect(screen.getByText('🟡 In Progress:')).toBeInTheDocument()
    expect(screen.getByText('✅ Done:')).toBeInTheDocument()
  })

  it('displays JQL filter information', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('🔍 Query Info')).toBeInTheDocument()
    expect(screen.getByText('JQL Filter:')).toBeInTheDocument()
    expect(screen.getByText('project in (TEST) AND issuetype in (Story,Epic)')).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(<StatsPanel stats={mockStats} metadata={mockMetadata} />)
    
    expect(screen.getByText('Last Updated:')).toBeInTheDocument()
    // Date format may vary by locale, just check that some formatted date is present
    expect(screen.getByText(/2023/)).toBeInTheDocument()
  })
})