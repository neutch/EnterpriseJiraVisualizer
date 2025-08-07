import request from 'supertest'
import express from 'express'
import { healthRouter } from './health.js'

// Mock the config module
jest.mock('../config/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    jqlFilter: 'project = TEST'
  }))
}))

const app = express()
app.use(express.json())
app.use('/api', healthRouter)

describe('Health Route', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('healthy')
    expect(response.body.data.jira.configured).toBe(true)
    expect(response.body.data.jira.baseUrl).toBe('https://test.atlassian.net')
    expect(response.body.data).toHaveProperty('timestamp')
    expect(response.body.data).toHaveProperty('uptime')
    expect(response.body.data).toHaveProperty('memory')
  })

  it('should include version information', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body.data).toHaveProperty('version')
    expect(response.body.data).toHaveProperty('environment')
  })

  it('should handle configuration errors', async () => {
    const { getConfig } = await import('../config/config.js')
    const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>
    
    mockGetConfig.mockImplementationOnce(() => {
      throw new Error('Missing environment variables')
    })

    const response = await request(app)
      .get('/api/health')
      .expect(500)

    expect(response.body.success).toBe(false)
    expect(response.body.error.message).toBe('Configuration error')
    expect(response.body.error.status).toBe(500)
  })
})