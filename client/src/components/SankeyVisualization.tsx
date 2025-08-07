import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, sankeyLeft, sankeyJustify } from 'd3-sankey'
import type { SankeyData } from '@/types/jira'
import { CATEGORY_COLORS } from '../../../src/utils/constants'

interface SankeyVisualizationProps {
  data: SankeyData
  width?: number
  height?: number
}

export const SankeyVisualization: React.FC<SankeyVisualizationProps> = ({
  data,
  width = 1200,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    renderSankey()
  }, [data, width, height])

  const renderSankey = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Create sankey generator
    const sankeyGenerator = sankey()
      .nodeId((d: any) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeSort(null)
      .linkSort(null)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 5], [chartWidth - 1, chartHeight - 5]])

    // Transform data for D3 sankey
    const graph = {
      nodes: data.nodes.map(node => ({ ...node })),
      links: data.links.map(link => ({ ...link }))
    }

    const { nodes, links } = sankeyGenerator(graph)

    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add links
    container.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d3.color(CATEGORY_COLORS[d.target.category]) || '#999')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-opacity', 0.8)
        
        // Show tooltip
        showTooltip(event, {
          title: 'Link',
          content: [
            `From: ${d.source.name}`,
            `To: ${d.target.name}`,
            `Value: ${d.value}`,
            `Type: ${d.metadata.linkType}`
          ]
        })
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-opacity', 0.5)
        hideTooltip()
      })

    // Add nodes
    const node = container.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#999')
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.8)
        
        // Show tooltip
        showTooltip(event, {
          title: d.name,
          content: [
            `Category: ${d.category}`,
            `Value: ${d.value}`,
            ...(d.metadata.status ? [`Status: ${d.metadata.status}`] : []),
            ...(d.metadata.assignee ? [`Assignee: ${d.metadata.assignee}`] : []),
            ...(d.metadata.storyPoints ? [`Story Points: ${d.metadata.storyPoints}`] : [])
          ]
        })
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill-opacity', 1)
        hideTooltip()
      })
      .on('click', function(event, d) {
        if (d.metadata.issueKey && d.metadata.issueKey.includes('-')) {
          const jiraUrl = `${window.location.origin.replace(':3000', ':4000')}/browse/${d.metadata.issueKey}`
          window.open(jiraUrl, '_blank')
        }
      })

    // Add node labels
    container.append('g')
      .style('font', '12px sans-serif')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < chartWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < chartWidth / 2 ? 'start' : 'end')
      .text(d => d.name.length > 30 ? `${d.name.substring(0, 30)}...` : d.name)
      .attr('fill', '#333')

    // Add legend
    const legend = container.append('g')
      .attr('transform', `translate(${chartWidth - 150}, 20)`)

    const categories = Object.keys(CATEGORY_COLORS)
    const legendItems = legend.selectAll('.legend-item')
      .data(categories)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => CATEGORY_COLORS[d])

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font', '12px sans-serif')
      .text(d => d.charAt(0).toUpperCase() + d.slice(1))
      .attr('fill', '#333')
  }

  const showTooltip = (event: MouseEvent, data: { title: string, content: string[] }) => {
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'sankey-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    tooltip.html(`
      <div style="font-weight: bold; margin-bottom: 4px;">${data.title}</div>
      ${data.content.map(line => `<div>${line}</div>`).join('')}
    `)

    tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      .transition()
      .duration(200)
      .style('opacity', 1)
  }

  const hideTooltip = () => {
    d3.selectAll('.sankey-tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove()
  }

  return (
    <div className="sankey-container">
      <svg ref={svgRef} className="sankey-svg" />
    </div>
  )
}