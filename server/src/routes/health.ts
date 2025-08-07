import express from 'express'
import { getConfig } from '../config/config'
import { HTTP_STATUS } from '../../../src/utils/constants'

export const healthRouter = express.Router()

healthRouter.get('/health', (_req, res) => {
  try {
    const config = getConfig()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      jira: {
        baseUrl: config.baseUrl,
        configured: true
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: health
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'Configuration error',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString()
      }
    })
  }
})