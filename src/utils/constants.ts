export const ISSUE_TYPE_HIERARCHY: Record<string, number> = {
  'Project': 0,
  'Feature': 1,
  'Epic': 2,
  'Story': 3,
  'Task': 3,
  'Bug': 3,
  'Sub-task': 4
}

export const CATEGORY_COLORS = {
  project: '#1f77b4',
  feature: '#ff7f0e', 
  epic: '#2ca02c',
  story: '#d62728'
}

export const DEFAULT_JQL_FILTER = 'project is not EMPTY AND issuetype in (Project, Feature, Epic, Story, Task, Bug)'

export const API_ENDPOINTS = {
  ISSUES: '/api/issues',
  HEALTH: '/api/health',
  STATS: '/api/stats'
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const