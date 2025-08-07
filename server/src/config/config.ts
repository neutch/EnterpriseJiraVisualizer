import type { JiraConfig } from '@/types/jira'

export function validateConfig(): JiraConfig {
  const requiredVars = {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL, 
    apiToken: process.env.JIRA_API_TOKEN
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  const config: JiraConfig = {
    baseUrl: requiredVars.baseUrl!,
    email: requiredVars.email!,
    apiToken: requiredVars.apiToken!,
    jqlFilter: process.env.JQL_FILTER || '' // Will be generated dynamically
  }

  if (!config.baseUrl.startsWith('https://')) {
    throw new Error('JIRA_BASE_URL must start with https://')
  }

  if (!config.email.includes('@')) {
    throw new Error('JIRA_EMAIL must be a valid email address')
  }

  return config
}

export function getConfig(): JiraConfig {
  return validateConfig()
}