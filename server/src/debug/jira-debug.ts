import { getConfig } from '../config/config.js'
import { JiraService } from '../services/jiraService.js'

async function debugJiraConnection() {
  try {
    console.log('🔍 Testing Jira connection...')
    
    const config = getConfig()
    console.log(`📍 Base URL: ${config.baseUrl}`)
    console.log(`👤 Email: ${config.email}`)
    console.log(`🔍 JQL: ${config.jqlFilter}`)
    
    const service = new JiraService(config)
    
    console.log('\n📊 Fetching first 5 issues...')
    const response = await service.fetchIssues(0, 5)
    
    console.log(`✅ Success! Found ${response.total} total issues`)
    console.log(`📄 Retrieved ${response.issues.length} issues`)
    
    if (response.issues.length > 0) {
      console.log('\n🔍 Sample issue:')
      const issue = response.issues[0]
      console.log(`  Key: ${issue.key}`)
      console.log(`  Summary: ${issue.summary}`)
      console.log(`  Type: ${issue.issuetype.name}`)
      console.log(`  Status: ${issue.status.name}`)
      console.log(`  Project: ${issue.project.name} (${issue.project.key})`)
      if (issue.parent) {
        console.log(`  Parent: ${issue.parent.key}`)
      }
      if (issue.storyPoints) {
        console.log(`  Story Points: ${issue.storyPoints}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Jira connection failed:', error)
    process.exit(1)
  }
}

debugJiraConnection()