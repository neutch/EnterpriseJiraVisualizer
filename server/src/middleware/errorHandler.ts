import type { Request, Response, NextFunction } from 'express'
import type { ApiError } from '@/types/jira'
import { HTTP_STATUS } from '../../../src/utils/constants'

export interface CustomError extends Error {
  status?: number
  code?: string
}

export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Error:', error.message)
  console.error('Stack:', error.stack)

  const apiError: ApiError = {
    message: error.message || 'Internal Server Error',
    status: error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: error.code,
    timestamp: new Date().toISOString()
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    })
  }

  res.status(apiError.status).json({
    success: false,
    error: apiError
  })
}