import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import cloudsRoutes from './routes/clouds.js'
import resourcesRoutes from './routes/resources.js'
import enginesRoutes from './routes/engines.js'
import seasonsRoutes from './routes/seasons.js'
import xpRoutes from './routes/xp.js'
import progressionRoutes from './routes/progression.js'
import dashboardRoutes from './routes/dashboard.js'
import questionnaireRoutes from './routes/questionnaire.js'
import trainingRoutes from './routes/training.js'
import investmentRoutes from './routes/investments.js'
import portfolioRebalancingRoutes from './routes/portfolio-rebalancing.js'
import agentRoutes from './domains/money/presentation/controllers/AgentController.js'
import teamRoutes from './domains/money/presentation/controllers/TeamController.js'
import guideRoutes from './domains/money/presentation/controllers/GuideController.js'
import knowledgeRoutes from './domains/money/presentation/controllers/KnowledgeController.js'
import productRoutes from './domains/money/presentation/controllers/ProductController.js'
import artifactRoutes from './domains/money/presentation/controllers/UserArtifactController.js'
import expenseRoutes from './domains/money/presentation/controllers/ExpenseController.js'
import powerLawRoutes from './domains/money/presentation/controllers/PowerLawController.js'
import bibleLawRoutes from './domains/money/presentation/controllers/BibleLawController.js'
import awarenessLayerRoutes from './domains/money/presentation/controllers/AwarenessLayerController.js'
import realityNodeRoutes from './domains/money/presentation/controllers/RealityNodeController.js'
import sleepRoutes from './domains/energy/presentation/controllers/SleepController.js'
import energyRoutes from './domains/energy/presentation/controllers/EnergyController.js'
import travelRoutes from './domains/travel/presentation/controllers/LocationController.js'
import systemHealthRoutes from './routes/health.js'
import loadoutRoutes from './routes/loadouts.js'
import blogRoutes from './routes/blog.js'
import chatRoutes from './routes/chat.js'
import metricsRoutes from './routes/metrics.js'
import unifiedArtifactRoutes from './routes/artifacts.js'
import { metricsMiddleware } from './middleware/metrics.js'
import { validateAndExit } from './utils/startupValidation.js'
import { enforceKnowledgePlaneReadOnly } from './middleware/planeGuard.js'

// Load .env first, then .env.local (so .env.local overrides .env)
dotenv.config()
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
// CORS configuration - allow both local and dev frontends
// Local: port 5002, Dev: port 5173
app.use(cors({
  origin: [
    'http://localhost:5002',  // Local frontend
    'http://localhost:5173',  // Dev frontend (Docker)
    'http://localhost:3000',  // Grafana
    'http://dev.lifeworld.com:5002',
    'http://dev.lifeworld.com:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// Metrics middleware (must be early to track all requests)
app.use(metricsMiddleware)

// Health/Capacity System routes
app.use('/api/health', systemHealthRoutes)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/clouds', cloudsRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/engines', enginesRoutes)
app.use('/api/seasons', seasonsRoutes)
app.use('/api/xp', xpRoutes)
app.use('/api/progression', progressionRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/questionnaire', questionnaireRoutes)
app.use('/api/training', trainingRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/portfolio-rebalancing', portfolioRebalancingRoutes)
app.use('/api/agents', agentRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/guides', guideRoutes)
// Knowledge Plane routes - read-only (GET only)
app.use('/api/knowledge', enforceKnowledgePlaneReadOnly, knowledgeRoutes)
app.use('/api/power-laws', enforceKnowledgePlaneReadOnly, powerLawRoutes)
app.use('/api/bible-laws', enforceKnowledgePlaneReadOnly, bibleLawRoutes)
app.use('/api/awareness-layers', enforceKnowledgePlaneReadOnly, awarenessLayerRoutes)
app.use('/api/reality-nodes', enforceKnowledgePlaneReadOnly, realityNodeRoutes)
app.use('/api/unified-artifacts', enforceKnowledgePlaneReadOnly, unifiedArtifactRoutes)

// Systems Plane routes - executable, state-changing (go through physics engine)
app.use('/api/products', productRoutes)
app.use('/api/artifacts', artifactRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/sleep', sleepRoutes)
app.use('/api/energy', energyRoutes)
app.use('/api/travel', travelRoutes)
app.use('/api/loadouts', loadoutRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/metrics', metricsRoutes)

// Error handler (must be after metrics middleware to track errors)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500
  console.error('Error:', err)
  
  // Error is already tracked by metrics middleware via response status
  res.status(status).json({
    error: err.message || 'Internal server error',
  })
})

// Startup validation and server start
// App will not start if validation fails
;(async () => {
  try {
    await validateAndExit()
    
    // Start server only if validation passes
    app.listen(PORT, () => {
      console.log(`🚀 Life World OS Backend running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start application:', error)
    process.exit(1)
  }
})()

