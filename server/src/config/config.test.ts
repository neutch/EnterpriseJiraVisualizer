import { validateConfig } from './config.js'

describe('Config Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should validate correct configuration', () => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net'
    process.env.JIRA_EMAIL = 'test@example.com'
    process.env.JIRA_API_TOKEN = 'test-token'
    process.env.JQL_FILTER = 'project = TEST'

    const config = validateConfig()

    expect(config.baseUrl).toBe('https://test.atlassian.net')
    expect(config.email).toBe('test@example.com')
    expect(config.apiToken).toBe('test-token')
    expect(config.jqlFilter).toBe('project = TEST')
  })

  it('should use default JQL filter when not provided', () => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net'
    process.env.JIRA_EMAIL = 'test@example.com'
    process.env.JIRA_API_TOKEN = 'test-token'
    delete process.env.JQL_FILTER

    const config = validateConfig()

    expect(config.jqlFilter).toBe('project is not EMPTY AND issuetype in (Project, Feature, Epic, Story, Task, Bug)')
  })

  it('should throw error for missing base URL', () => {
    delete process.env.JIRA_BASE_URL
    process.env.JIRA_EMAIL = 'test@example.com'
    process.env.JIRA_API_TOKEN = 'test-token'

    expect(() => validateConfig()).toThrow('Missing required environment variables: baseUrl')
  })

  it('should throw error for missing email', () => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net'
    delete process.env.JIRA_EMAIL
    process.env.JIRA_API_TOKEN = 'test-token'

    expect(() => validateConfig()).toThrow('Missing required environment variables: email')
  })

  it('should throw error for missing API token', () => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net'
    process.env.JIRA_EMAIL = 'test@example.com'
    delete process.env.JIRA_API_TOKEN

    expect(() => validateConfig()).toThrow('Missing required environment variables: apiToken')
  })

  it('should throw error for multiple missing variables', () => {
    delete process.env.JIRA_BASE_URL
    delete process.env.JIRA_EMAIL
    process.env.JIRA_API_TOKEN = 'test-token'

    expect(() => validateConfig()).toThrow('Missing required environment variables: baseUrl, email')
  })

  it('should throw error for invalid base URL', () => {
    process.env.JIRA_BASE_URL = 'http://insecure.atlassian.net'
    process.env.JIRA_EMAIL = 'test@example.com'
    process.env.JIRA_API_TOKEN = 'test-token'

    expect(() => validateConfig()).toThrow('JIRA_BASE_URL must start with https://')
  })

  it('should throw error for invalid email', () => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net'
    process.env.JIRA_EMAIL = 'invalid-email'
    process.env.JIRA_API_TOKEN = 'test-token'

    expect(() => validateConfig()).toThrow('JIRA_EMAIL must be a valid email address')
  })
})