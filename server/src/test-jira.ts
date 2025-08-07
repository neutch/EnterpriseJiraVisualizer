import { getConfig } from './config/config.js'
import { JiraService } from './services/jiraService.js'

async function testJiraConnection() {
  try {
    console.log('🧪 Testing Jira API connection...')
    
    const config = getConfig()
    const service = new JiraService(config)
    
    const response = await service.fetchIssues(0, 1)
    
    if (response.total > 0) {
      console.log('✅ Connection successful!')
      console.log(`📊 Total issues available: ${response.total}`)
      console.log(`🔍 JQL Filter: ${config.jqlFilter}`)
    } else {
      console.log('⚠️  Connection successful but no issues found')
      console.log('Check your JQL filter:', config.jqlFilter)
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testJiraConnection()