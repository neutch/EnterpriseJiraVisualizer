import express from 'express'
import { getConfig } from '../config/config'
import { JiraService } from '../services/jiraService'
import { HTTP_STATUS } from '../../../src/utils/constants'
import type { ApiResponse, SankeyData, GraphStats } from '@/types/jira'

export const issuesRouter = express.Router()

let jiraService: JiraService

function getJiraService(): JiraService {
  if (!jiraService) {
    const config = getConfig()
    jiraService = new JiraService(config)
  }
  return jiraService
}

issuesRouter.get('/issues', async (_req, res, next) => {
  try {
    console.log('📊 Fetching Jira issues...')
    const service = getJiraService()
    
    const startTime = Date.now()
    const issues = await service.fetchAllIssues()
    const fetchTime = Date.now() - startTime
    
    console.log(`✅ Fetched ${issues.length} issues in ${fetchTime}ms`)
    
    console.log('🔄 Transforming to Sankey data...')
    const transformStart = Date.now()
    const sankeyData = service.transformToSankeyData(issues)
    const transformTime = Date.now() - transformStart
    
    console.log(`✅ Transformed data in ${transformTime}ms`)
    console.log(`📈 Generated ${sankeyData.nodes.length} nodes and ${sankeyData.links.length} links`)

    const response: ApiResponse<SankeyData> = {
      success: true,
      data: sankeyData
    }

    res.status(HTTP_STATUS.OK).json(response)
  } catch (error) {
    console.error('❌ Error fetching issues:', error)
    next(error)
  }
})

issuesRouter.get('/stats', async (_req, res, next) => {
  try {
    console.log('📊 Generating graph statistics...')
    const service = getJiraService()
    
    const issues = await service.fetchAllIssues()
    const sankeyData = service.transformToSankeyData(issues)
    const stats = service.generateStats(sankeyData)

    const response: ApiResponse<GraphStats> = {
      success: true,
      data: stats
    }

    res.status(HTTP_STATUS.OK).json(response)
  } catch (error) {
    console.error('❌ Error generating stats:', error)
    next(error)
  }
})

issuesRouter.get('/issues/raw', async (req, res, next) => {
  try {
    console.log('📊 Fetching raw Jira issues...')
    const service = getJiraService()
    
    const maxResults = parseInt(req.query.maxResults as string) || 50
    const startAt = parseInt(req.query.startAt as string) || 0
    
    const response = await service.fetchIssues(startAt, maxResults)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('❌ Error fetching raw issues:', error)
    next(error)
  }
})

issuesRouter.get('/projects', async (_req, res, next) => {
  try {
    console.log('🏗️ Discovering projects...')
    const service = getJiraService()
    
    const projects = await service.discoverProjects()

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('❌ Error discovering projects:', error)
    next(error)
  }
})

issuesRouter.get('/issue-types', async (_req, res, next) => {
  try {
    console.log('🏷️ Discovering issue types...')
    const service = getJiraService()
    
    const issueTypes = await service.discoverIssueTypes()

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: issueTypes
    })
  } catch (error) {
    console.error('❌ Error discovering issue types:', error)
    next(error)
  }
})

issuesRouter.post('/issues/custom', async (req, res, next) => {
  try {
    console.log('🔍 Fetching issues with custom filters...')
    const service = getJiraService()
    
    const { projectKeys, issueTypes, customJql } = req.body
    
    let jql = customJql
    if (!jql && (projectKeys || issueTypes)) {
      jql = await service.generateOptimalJQL(projectKeys, issueTypes)
    }
    
    const issues = await service.fetchAllIssues()
    const sankeyData = service.transformToSankeyData(issues)

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: sankeyData
    })
  } catch (error) {
    console.error('❌ Error fetching custom issues:', error)
    next(error)
  }
})