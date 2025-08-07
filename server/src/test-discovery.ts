import { getConfig } from './config/config'
import { JiraService } from './services/jiraService'

async function testDiscovery() {
  try {
    console.log('🔍 Testing Jira discovery...')
    
    const config = getConfig()
    const service = new JiraService(config)
    
    console.log('\n🏗️ Discovering projects...')
    const projects = await service.discoverProjects()
    console.log(`Found ${projects.length} projects:`)
    projects.slice(0, 5).forEach(project => {
      console.log(`  - ${project.key}: ${project.name}`)
    })
    
    console.log('\n🏷️ Discovering issue types...')
    const issueTypes = await service.discoverIssueTypes()
    console.log(`Found ${issueTypes.length} issue types:`)
    issueTypes.slice(0, 10).forEach(type => {
      console.log(`  - ${type.name} (level: ${type.hierarchyLevel})`)
    })
    
    console.log('\n🔍 Generating optimal JQL...')
    const jql = await service.generateOptimalJQL()
    console.log(`Generated JQL: ${jql}`)
    
    console.log('\n✅ Discovery test completed!')
    
  } catch (error) {
    console.error('❌ Discovery test failed:', error)
    process.exit(1)
  }
}

testDiscovery()