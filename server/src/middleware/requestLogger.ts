import type { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const method = req.method
    const url = req.originalUrl || req.url
    
    const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅'
    
    console.log(`${statusEmoji} ${method} ${url} ${status} ${duration}ms`)
  })
  
  next()
}