import axios from 'axios'
import { JiraService } from './jiraService.js'
import type { JiraConfig, JiraIssue } from '@/types/jira.js'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockConfig: JiraConfig = {
  baseUrl: 'https://test.atlassian.net',
  email: 'test@example.com',
  apiToken: 'test-token',
  jqlFilter: 'project = TEST'
}

const mockJiraIssue: any = {
  id: '123',
  key: 'TEST-1',
  fields: {
    summary: 'Test Issue',
    description: 'Test Description',
    status: {
      name: 'In Progress',
      statusCategory: { name: 'In Progress' }
    },
    priority: {
      name: 'Medium',
      id: '3'
    },
    issuetype: {
      name: 'Story'
    },
    project: {
      key: 'TEST',
      name: 'Test Project',
      id: '10001'
    },
    reporter: {
      displayName: 'Test User',
      emailAddress: 'test@example.com'
    },
    created: '2023-01-01T00:00:00Z',
    updated: '2023-01-02T00:00:00Z',
    labels: [],
    components: [],
    versions: []
  }
}

describe('JiraService', () => {
  let jiraService: JiraService

  beforeEach(() => {
    jiraService = new JiraService(mockConfig)
    mockedAxios.create.mockReturnValue(mockedAxios)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchIssues', () => {
    it('should fetch issues successfully', async () => {
      const mockResponse = {
        data: {
          startAt: 0,
          maxResults: 100,
          total: 1,
          issues: [mockJiraIssue]
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockResponse)

      const result = await jiraService.fetchIssues(0, 100)

      expect(mockedAxios.get).toHaveBeenCalledWith('/rest/api/3/search', {
        params: {
          jql: 'project = TEST',
          startAt: 0,
          maxResults: 100,
          fields: expect.stringContaining('id,key,summary'),
          expand: 'names'
        }
      })

      expect(result.total).toBe(1)
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0].key).toBe('TEST-1')
      expect(result.issues[0].summary).toBe('Test Issue')
    })

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: {
            errorMessages: ['Invalid JQL query']
          }
        }
      }

      mockedAxios.get.mockRejectedValueOnce(mockError)

      await expect(jiraService.fetchIssues()).rejects.toThrow('Jira API Error: Invalid JQL query')
    })
  })

  describe('transformToSankeyData', () => {
    it('should transform Jira issues to Sankey data', () => {
      const issues: JiraIssue[] = [{
        id: '123',
        key: 'TEST-1',
        summary: 'Test Issue',
        status: {
          name: 'In Progress',
          category: 'In Progress'
        },
        priority: {
          name: 'Medium',
          id: '3'
        },
        issuetype: {
          name: 'Story'
        },
        project: {
          key: 'TEST',
          name: 'Test Project',
          id: '10001'
        },
        reporter: {
          displayName: 'Test User',
          emailAddress: 'test@example.com'
        },
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-02T00:00:00Z',
        labels: [],
        components: [],
        versions: []
      }]

      const result = jiraService.transformToSankeyData(issues)

      expect(result.nodes).toHaveLength(2) // Issue node + Project node
      expect(result.links).toHaveLength(1) // Project -> Issue link
      expect(result.metadata.totalIssues).toBe(1)
      expect(result.metadata.projectCount).toBe(1)

      const issueNode = result.nodes.find(n => n.id === 'TEST-1')
      expect(issueNode).toBeDefined()
      expect(issueNode?.category).toBe('story')
      expect(issueNode?.name).toBe('Test Issue')
    })

    it('should handle parent-child relationships', () => {
      const parentIssue: JiraIssue = {
        id: '123',
        key: 'TEST-1',
        summary: 'Parent Epic',
        status: { name: 'In Progress', category: 'In Progress' },
        priority: { name: 'High', id: '2' },
        issuetype: { name: 'Epic' },
        project: { key: 'TEST', name: 'Test Project', id: '10001' },
        reporter: { displayName: 'Test User', emailAddress: 'test@example.com' },
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-02T00:00:00Z',
        labels: [],
        components: [],
        versions: []
      }

      const childIssue: JiraIssue = {
        id: '124',
        key: 'TEST-2',
        summary: 'Child Story',
        status: { name: 'To Do', category: 'To Do' },
        priority: { name: 'Medium', id: '3' },
        issuetype: { name: 'Story' },
        project: { key: 'TEST', name: 'Test Project', id: '10001' },
        parent: { id: '123', key: 'TEST-1', summary: 'Parent Epic' },
        reporter: { displayName: 'Test User', emailAddress: 'test@example.com' },
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-02T00:00:00Z',
        labels: [],
        components: [],
        versions: []
      }

      const result = jiraService.transformToSankeyData([parentIssue, childIssue])

      expect(result.nodes).toHaveLength(3) // Parent + Child + Project
      expect(result.links).toHaveLength(3) // Project->Parent + Parent->Child + Project->Child

      const parentChildLink = result.links.find(l => 
        l.source === 'TEST-1' && l.target === 'TEST-2'
      )
      expect(parentChildLink).toBeDefined()
      expect(parentChildLink?.metadata.linkType).toBe('epic_to_story')
    })
  })

  describe('generateStats', () => {
    it('should generate correct statistics', () => {
      const sankeyData = {
        nodes: [
          { id: 'TEST-1', name: 'Epic 1', category: 'epic', value: 8, metadata: { storyPoints: 8, status: 'Done' } },
          { id: 'TEST-2', name: 'Story 1', category: 'story', value: 5, metadata: { storyPoints: 5, status: 'In Progress' } },
          { id: 'TEST-3', name: 'Story 2', category: 'story', value: 3, metadata: { storyPoints: 3, status: 'Done' } }
        ],
        links: [
          { source: 'TEST-1', target: 'TEST-2', value: 5, metadata: { linkType: 'epic_to_story' } },
          { source: 'TEST-1', target: 'TEST-3', value: 3, metadata: { linkType: 'epic_to_story' } }
        ],
        metadata: {
          totalIssues: 3,
          projectCount: 1,
          lastUpdated: '2023-01-01T00:00:00Z',
          jqlFilter: 'project = TEST'
        }
      }

      const stats = jiraService.generateStats(sankeyData)

      expect(stats.totalNodes).toBe(3)
      expect(stats.totalLinks).toBe(2)
      expect(stats.nodesByCategory).toEqual({ epic: 1, story: 2 })
      expect(stats.linksByType).toEqual({ epic_to_story: 2 })
      expect(stats.averageStoryPoints).toBeCloseTo(5.33, 1)
      expect(stats.statusDistribution).toEqual({ 'Done': 2, 'In Progress': 1 })
    })
  })
})