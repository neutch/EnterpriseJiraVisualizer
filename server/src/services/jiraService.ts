import axios, { type AxiosInstance } from 'axios'
import type { 
  JiraConfig, 
  JiraSearchResponse, 
  JiraIssue,
  SankeyData,
  SankeyNode,
  SankeyLink,
  GraphStats,
  IssueHierarchy
} from '@/types/jira'
import { ISSUE_TYPE_HIERARCHY } from '../../../src/utils/constants'

export class JiraService {
  private client: AxiosInstance
  private config: JiraConfig

  constructor(config: JiraConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      auth: {
        username: config.email,
        password: config.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })
  }

  async discoverProjects(): Promise<Array<{ key: string; name: string; id: string }>> {
    try {
      const response = await this.client.get('/rest/api/3/project/search', {
        params: {
          maxResults: 100,
          expand: 'description,lead,issueTypes'
        }
      })

      return response.data.values.map((project: any) => ({
        key: project.key,
        name: project.name,
        id: project.id
      }))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch projects: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  async discoverIssueTypes(): Promise<Array<{ id: string; name: string; hierarchyLevel?: number }>> {
    try {
      const response = await this.client.get('/rest/api/3/issuetype')

      return response.data.map((issueType: any) => ({
        id: issueType.id,
        name: issueType.name,
        hierarchyLevel: ISSUE_TYPE_HIERARCHY[issueType.name] || 999
      })).sort((a: any, b: any) => (a.hierarchyLevel || 999) - (b.hierarchyLevel || 999))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch issue types: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  async generateOptimalJQL(projectKeys?: string[], issueTypeNames?: string[]): Promise<string> {
    try {
      let projects = projectKeys
      let issueTypes = issueTypeNames

      if (!projects) {
        const discoveredProjects = await this.discoverProjects()
        projects = discoveredProjects.slice(0, 5).map(p => p.key) // Limit to first 5 projects
      }

      if (!issueTypes) {
        const discoveredIssueTypes = await this.discoverIssueTypes()
        issueTypes = discoveredIssueTypes
          .filter(it => it.hierarchyLevel !== undefined && it.hierarchyLevel < 900)
          .map(it => it.name)
      }

      const jqlParts = []
      
      if (projects.length > 0) {
        jqlParts.push(`project in (${projects.join(',')})`)
      }
      
      if (issueTypes.length > 0) {
        jqlParts.push(`issuetype in (${issueTypes.map(t => `"${t}"`).join(',')})`)
      }

      // Add time filter to limit scope
      jqlParts.push('created >= -90d')
      
      // Order by hierarchy
      const jql = jqlParts.join(' AND ') + ' ORDER BY project ASC, created DESC'
      
      console.log('🔍 Generated JQL:', jql)
      return jql
    } catch (error) {
      console.warn('⚠️ Failed to generate optimal JQL, using fallback')
      return 'project is not EMPTY AND created >= -30d ORDER BY created DESC'
    }
  }

  async fetchIssues(startAt: number = 0, maxResults: number = 100, customJql?: string): Promise<JiraSearchResponse> {
    try {
      const jql = customJql || await this.generateOptimalJQL()
      
      const response = await this.client.get('/rest/api/3/search', {
        params: {
          jql,
          startAt,
          maxResults,
          fields: [
            'id', 'key', 'summary', 'description', 'status', 'priority',
            'issuetype', 'project', 'parent', 'assignee', 'reporter',
            'created', 'updated', 'resolution', 'labels', 'components',
            'versions', 'customfield_10016' // Story Points
          ].join(','),
          expand: 'names'
        }
      })

      return this.transformJiraResponse(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.errorMessages?.[0] || error.message
        throw new Error(`Jira API Error: ${message}`)
      }
      throw error
    }
  }

  async fetchAllIssues(): Promise<JiraIssue[]> {
    const allIssues: JiraIssue[] = []
    let startAt = 0
    const maxResults = 100

    while (true) {
      const response = await this.fetchIssues(startAt, maxResults)
      allIssues.push(...response.issues)

      if (startAt + maxResults >= response.total) {
        break
      }
      startAt += maxResults
    }

    return allIssues
  }

  transformToSankeyData(issues: JiraIssue[]): SankeyData {
    const nodes = new Map<string, SankeyNode>()
    const links: SankeyLink[] = []

    // Create nodes and establish hierarchy
    for (const issue of issues) {
      const hierarchy = this.getIssueHierarchy(issue)
      
      const node: SankeyNode = {
        id: issue.key,
        name: issue.summary,
        category: hierarchy,
        value: issue.storyPoints || 1,
        metadata: {
          issueKey: issue.key,
          status: issue.status.name,
          priority: issue.priority.name,
          assignee: issue.assignee?.displayName,
          storyPoints: issue.storyPoints,
          created: issue.created,
          updated: issue.updated
        }
      }

      nodes.set(issue.key, node)
    }

    // Create links based on parent-child relationships
    for (const issue of issues) {
      if (issue.parent) {
        const parentNode = nodes.get(issue.parent.key)
        const childNode = nodes.get(issue.key)

        if (parentNode && childNode) {
          const linkType = this.getLinkType(parentNode.category, childNode.category)
          
          links.push({
            source: issue.parent.key,
            target: issue.key,
            value: childNode.value || 1,
            metadata: {
              linkType,
              sourceKey: issue.parent.key,
              targetKey: issue.key
            }
          })
        }
      }
    }

    // Create project-level groupings for issues without parents
    this.createProjectGroupings(issues, nodes, links)

    return {
      nodes: Array.from(nodes.values()),
      links,
      metadata: {
        totalIssues: issues.length,
        projectCount: new Set(issues.map(i => i.project.key)).size,
        lastUpdated: new Date().toISOString(),
        jqlFilter: this.config.jqlFilter
      }
    }
  }

  generateStats(sankeyData: SankeyData): GraphStats {
    const nodesByCategory = sankeyData.nodes.reduce((acc, node) => {
      acc[node.category] = (acc[node.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const linksByType = sankeyData.links.reduce((acc, link) => {
      acc[link.metadata.linkType] = (acc[link.metadata.linkType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const storyPoints = sankeyData.nodes
      .map(n => n.metadata.storyPoints || 0)
      .filter(sp => sp > 0)
    
    const averageStoryPoints = storyPoints.length > 0 
      ? storyPoints.reduce((a, b) => a + b, 0) / storyPoints.length 
      : 0

    const statusDistribution = sankeyData.nodes.reduce((acc, node) => {
      const status = node.metadata.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalNodes: sankeyData.nodes.length,
      totalLinks: sankeyData.links.length,
      nodesByCategory,
      linksByType,
      averageStoryPoints,
      statusDistribution
    }
  }

  private transformJiraResponse(data: any): JiraSearchResponse {
    return {
      startAt: data.startAt,
      maxResults: data.maxResults,
      total: data.total,
      issues: data.issues.map((issue: any) => this.transformJiraIssue(issue))
    }
  }

  private transformJiraIssue(issue: any): JiraIssue {
    return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      status: {
        name: issue.fields.status.name,
        category: issue.fields.status.statusCategory.name
      },
      priority: {
        name: issue.fields.priority.name,
        id: issue.fields.priority.id
      },
      issuetype: {
        name: issue.fields.issuetype.name,
        hierarchyLevel: ISSUE_TYPE_HIERARCHY[issue.fields.issuetype.name]
      },
      project: {
        key: issue.fields.project.key,
        name: issue.fields.project.name,
        id: issue.fields.project.id
      },
      parent: issue.fields.parent ? {
        id: issue.fields.parent.id,
        key: issue.fields.parent.key,
        summary: issue.fields.parent.fields.summary
      } : undefined,
      assignee: issue.fields.assignee ? {
        displayName: issue.fields.assignee.displayName,
        emailAddress: issue.fields.assignee.emailAddress
      } : undefined,
      reporter: {
        displayName: issue.fields.reporter.displayName,
        emailAddress: issue.fields.reporter.emailAddress
      },
      created: issue.fields.created,
      updated: issue.fields.updated,
      resolution: issue.fields.resolution ? {
        name: issue.fields.resolution.name,
        date: issue.fields.resolutiondate
      } : undefined,
      storyPoints: issue.fields.customfield_10016,
      labels: issue.fields.labels || [],
      components: issue.fields.components || [],
      versions: issue.fields.versions || []
    }
  }

  private getIssueHierarchy(issue: JiraIssue): IssueHierarchy {
    const typeName = issue.issuetype.name.toLowerCase()
    
    if (typeName.includes('project')) return 'project'
    if (typeName.includes('feature')) return 'feature'  
    if (typeName.includes('epic')) return 'epic'
    
    return 'story'
  }

  private getLinkType(sourceCategory: string, targetCategory: string): 'project_to_feature' | 'feature_to_epic' | 'epic_to_story' {
    if (sourceCategory === 'project' && targetCategory === 'feature') {
      return 'project_to_feature'
    }
    if (sourceCategory === 'feature' && targetCategory === 'epic') {
      return 'feature_to_epic'
    }
    return 'epic_to_story'
  }

  private createProjectGroupings(issues: JiraIssue[], nodes: Map<string, SankeyNode>, links: SankeyLink[]): void {
    const projectNodes = new Map<string, SankeyNode>()
    
    // Create project nodes
    for (const issue of issues) {
      if (!projectNodes.has(issue.project.key)) {
        const projectNode: SankeyNode = {
          id: issue.project.key,
          name: issue.project.name,
          category: 'project',
          value: 0,
          metadata: {
            issueKey: issue.project.key
          }
        }
        projectNodes.set(issue.project.key, projectNode)
      }
    }

    // Link orphaned issues to their projects
    for (const issue of issues) {
      const issueNode = nodes.get(issue.key)
      if (issueNode && !issue.parent) {
        const projectNode = projectNodes.get(issue.project.key)
        if (projectNode && issueNode.category !== 'project') {
          links.push({
            source: issue.project.key,
            target: issue.key,
            value: issueNode.value || 1,
            metadata: {
              linkType: 'project_to_feature',
              sourceKey: issue.project.key,
              targetKey: issue.key
            }
          })
        }
      }
    }

    // Add project nodes to the collection
    for (const [key, node] of projectNodes) {
      nodes.set(key, node)
    }
  }
}