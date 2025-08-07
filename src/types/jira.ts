export interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  status: {
    name: string
    category: string
  }
  priority: {
    name: string
    id: string
  }
  issuetype: {
    name: string
    hierarchyLevel?: number
  }
  project: {
    key: string
    name: string
    id: string
  }
  parent?: {
    id: string
    key: string
    summary: string
  }
  assignee?: {
    displayName: string
    emailAddress: string
  }
  reporter: {
    displayName: string
    emailAddress: string
  }
  created: string
  updated: string
  resolution?: {
    name: string
    date: string
  }
  storyPoints?: number
  labels: string[]
  components: Array<{
    name: string
    id: string
  }>
  versions: Array<{
    name: string
    id: string
    releaseDate?: string
  }>
}

export interface JiraSearchResponse {
  startAt: number
  maxResults: number
  total: number
  issues: JiraIssue[]
}

export interface SankeyNode {
  id: string
  name: string
  category: 'project' | 'feature' | 'epic' | 'story'
  value?: number
  metadata: {
    issueKey?: string
    status?: string
    priority?: string
    assignee?: string
    storyPoints?: number
    created?: string
    updated?: string
  }
}

export interface SankeyLink {
  source: string
  target: string
  value: number
  metadata: {
    linkType: 'project_to_feature' | 'feature_to_epic' | 'epic_to_story'
    sourceKey?: string
    targetKey?: string
  }
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
  metadata: {
    totalIssues: number
    projectCount: number
    lastUpdated: string
    jqlFilter: string
  }
}

export interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  jqlFilter: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface GraphStats {
  totalNodes: number
  totalLinks: number
  nodesByCategory: Record<string, number>
  linksByType: Record<string, number>
  averageStoryPoints: number
  statusDistribution: Record<string, number>
}

export type IssueHierarchy = 'project' | 'feature' | 'epic' | 'story'

export interface HierarchyMapping {
  [key: string]: IssueHierarchy
}