import { getConfig } from '../config/config.js'
import { JiraService } from '../services/jiraService.js'

async function debugGraph() {
  try {
    console.log('🔍 Testing graph generation...')
    
    const config = getConfig()
    const service = new JiraService(config)
    
    console.log('\n📊 Fetching all issues...')
    const issues = await service.fetchAllIssues()
    console.log(`✅ Fetched ${issues.length} issues`)
    
    console.log('\n🔄 Transforming to Sankey data...')
    const sankeyData = service.transformToSankeyData(issues)
    
    console.log(`📈 Generated ${sankeyData.nodes.length} nodes`)
    console.log(`🔗 Generated ${sankeyData.links.length} links`)
    
    console.log('\n📊 Node categories:')
    const nodesByCategory = sankeyData.nodes.reduce((acc, node) => {
      acc[node.category] = (acc[node.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(nodesByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
    
    console.log('\n🔗 Link types:')
    const linksByType = sankeyData.links.reduce((acc, link) => {
      acc[link.metadata.linkType] = (acc[link.metadata.linkType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(linksByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
    
    console.log('\n📈 Generating statistics...')
    const stats = service.generateStats(sankeyData)
    
    console.log('📊 Graph Statistics:')
    console.log(`  Total Nodes: ${stats.totalNodes}`)
    console.log(`  Total Links: ${stats.totalLinks}`)
    console.log(`  Average Story Points: ${stats.averageStoryPoints.toFixed(2)}`)
    
    console.log('\n✅ Graph validation complete!')
    
    // Sample nodes and links for inspection
    if (sankeyData.nodes.length > 0) {
      console.log('\n🔍 Sample nodes:')
      sankeyData.nodes.slice(0, 3).forEach(node => {
        console.log(`  ${node.id}: ${node.name} (${node.category})`)
      })
    }
    
    if (sankeyData.links.length > 0) {
      console.log('\n🔗 Sample links:')
      sankeyData.links.slice(0, 3).forEach(link => {
        console.log(`  ${link.source} → ${link.target} (${link.metadata.linkType})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Graph generation failed:', error)
    process.exit(1)
  }
}

debugGraph()