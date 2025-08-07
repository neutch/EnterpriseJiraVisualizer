import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { join } from 'path'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { issuesRouter } from './routes/issues'
import { healthRouter } from './routes/health'
import { validateConfig } from './config/config'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://"]
    }
  }
}))

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(requestLogger)

app.use('/api', healthRouter)
app.use('/api', issuesRouter)

if (process.env.NODE_ENV === 'production') {
  const clientBuild = join(process.cwd(), '../client/dist')
  app.use(express.static(clientBuild))
  
  app.get('*', (_req, res) => {
    res.sendFile(join(clientBuild, 'index.html'))
  })
}

app.use(errorHandler)

async function startServer() {
  try {
    const config = validateConfig()
    console.log('✅ Configuration validated')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Jira Base URL: ${config.baseUrl}`)
      console.log(`🔍 JQL Filter: ${config.jqlFilter}`)
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🌐 API available at http://localhost:${PORT}/api`)
        console.log(`❤️  Health check: http://localhost:${PORT}/api/health`)
      }
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

startServer()