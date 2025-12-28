/**
 * SystemRunbook Component
 * 
 * Shows system-specific runbook details including:
 * - Expected errors per system
 * - Best practices for each component type
 * - Troubleshooting steps
 * - Configuration requirements
 * - Product runbooks (dev onboarding/support)
 * - User help guides
 */

import { useState, useEffect } from 'react'
import { systemHealthManager, SystemId } from '../lib/systemHealth'
import { BookOpen, AlertTriangle, CheckCircle2, Key, Database, Server, Globe, Monitor, Users, Code, HelpCircle, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSystemHealthRoute } from '../config/routes'
import { productsApi, Product } from '../services/financeApi'
import { logger } from '../lib/logger'

interface SystemRunbookProps {
  systemId: SystemId
  componentId?: string
}

export default function SystemRunbook({ systemId, componentId }: SystemRunbookProps) {
  const navigate = useNavigate()
  const metadata = systemHealthManager.getSystemMetadata(systemId)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    systemBestPractices: true,
    productRunbooks: false,
    userGuides: false,
  })

  // Load products for MONEY system
  useEffect(() => {
    if (systemId === 'money') {
      const loadProducts = async () => {
        try {
          setLoadingProducts(true)
          const response = await productsApi.list()
          setProducts(response.products || [])
        } catch (error) {
          logger.error('Failed to load products for runbook:', error)
        } finally {
          setLoadingProducts(false)
        }
      }
      loadProducts()
    }
  }, [systemId])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'api-provider':
        return <Globe className="w-5 h-5" />
      case 'database':
        return <Database className="w-5 h-5" />
      case 'backend':
        return <Server className="w-5 h-5" />
      case 'ui':
        return <Monitor className="w-5 h-5" />
      default:
        return <Server className="w-5 h-5" />
    }
  }

  // If componentId is provided, show specific component runbook
  if (componentId) {
    const component = metadata.components.find(c => c.id === componentId)
    const runbook = metadata.runbooks[componentId]

    if (!component && !runbook) {
      return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-gray-400">No runbook available for this component</p>
        </div>
      )
    }

    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{component?.name || 'Component'}</h3>
          <p className="text-sm text-gray-400">Runbook for {systemId.toUpperCase()} system</p>
        </div>

        {runbook && (
          <>
            {runbook.expectedErrors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Expected Errors
                </h4>
                <div className="space-y-2">
                  {runbook.expectedErrors.map((error, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <code className="text-sm text-red-400">{error}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {runbook.bestPractices.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Best Practices
                </h4>
                <ul className="space-y-2">
                  {runbook.bestPractices.map((practice, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {runbook.url && (
              <div>
                <button
                  onClick={() => navigate(runbook.url)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  View detailed runbook
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // MONEY System Best Practices
  const moneySystemBestPractices = {
    overview: "The MONEY system manages financial resources, products, agents, and teams. Follow these best practices to ensure system reliability and optimal performance.",
    practices: [
      "Monitor system health regularly using the Quick Health Fix feature",
      "Ensure all products have proper security configurations before deployment",
      "Keep agent knowledge bases updated with latest financial regulations",
      "Validate data integrity before processing financial transactions",
      "Implement proper error handling for all API endpoints",
      "Use transaction logging for audit trails on financial operations",
      "Test emergency fund calculations with various risk profiles",
      "Maintain backup strategies for critical financial data",
      "Review and update product runbooks quarterly",
      "Ensure compliance with financial data protection standards"
    ],
    troubleshooting: [
      "If products fail to load, check backend API health status",
      "For calculation errors, verify input data validation",
      "If agents are unresponsive, check agent service health",
      "For data sync issues, use the Resync button",
      "Check system logs for detailed error information"
    ]
  }

  // Product Runbook Templates
  const getProductRunbook = (product: Product) => {
    const baseRunbook = {
      devOnboarding: [
        "Review product architecture and data flow diagrams",
        "Set up local development environment with required dependencies",
        "Configure environment variables (API keys, database connections)",
        "Run database migrations: `npx prisma migrate dev`",
        "Test product endpoints using provided Postman collection",
        "Review product security requirements and compliance standards",
        "Set up monitoring and logging for the product",
        "Familiarize yourself with product-specific error codes",
        "Review integration points with other system components",
        "Test emergency fund calculations with sample data"
      ],
      support: [
        "Check product health status in System Health dashboard",
        "Review recent error logs for the product",
        "Verify database connectivity and query performance",
        "Check API rate limits and quota usage",
        "Validate input data format and constraints",
        "Review product-specific configuration settings",
        "Check for known issues in product runbook",
        "Escalate to product owner if issue persists > 30 minutes",
        "Document resolution steps for future reference",
        "Update runbook with new troubleshooting steps if needed"
      ],
      architecture: {
        frontend: "React components with TypeScript, using Framer Motion for animations",
        backend: "Express.js API with Prisma ORM for database access",
        database: "PostgreSQL with Prisma migrations",
        security: product.securityLevel || "MEDIUM",
        dependencies: product.integrationPoints || []
      }
    }

    // Product-specific runbooks
    if (product.name === 'Emergency Fund Tracker') {
      return {
        ...baseRunbook,
        devOnboarding: [
          ...baseRunbook.devOnboarding,
          "Understand emergency fund calculation algorithms",
          "Review risk profile assessment logic",
          "Test with various monthly expense scenarios",
          "Verify expense breakdown calculations"
        ],
        support: [
          ...baseRunbook.support,
          "Check expense calculation accuracy",
          "Verify goal progress tracking logic",
          "Review scenario analysis calculations",
          "Validate decision clarifier risk profiles"
        ],
        commonIssues: [
          "Calculation discrepancies - verify monthly expenses input",
          "Progress not updating - check goal status endpoint",
          "Scenario analysis failing - validate expense categories"
        ]
      }
    }

    if (product.name === 'Budget Builder & Tracker') {
      return {
        ...baseRunbook,
        devOnboarding: [
          ...baseRunbook.devOnboarding,
          "Review budget allocation algorithms",
          "Understand category-based expense tracking",
          "Test budget vs actual comparisons"
        ],
        support: [
          ...baseRunbook.support,
          "Check budget calculation accuracy",
          "Verify category expense aggregations",
          "Review budget alerts and notifications"
        ]
      }
    }

    if (product.name === 'Cash Flow Analyzer') {
      return {
        ...baseRunbook,
        devOnboarding: [
          ...baseRunbook.devOnboarding,
          "Understand cash flow projection algorithms",
          "Review income vs expense analysis logic",
          "Test with various cash flow scenarios"
        ],
        support: [
          ...baseRunbook.support,
          "Check cash flow calculation accuracy",
          "Verify income/expense data synchronization",
          "Review projection accuracy"
        ]
      }
    }

    return baseRunbook
  }

  // User Help Guides
  const getUserHelpGuide = (product: Product) => {
    const baseGuide = {
      gettingStarted: [
        "Navigate to the product from the MONEY system dashboard",
        "Review product description and features",
        "Complete any required setup steps",
        "Start with basic functionality before advanced features"
      ],
      commonTasks: [] as string[],
      troubleshooting: [
        "Check that you have proper permissions to access the product",
        "Verify your data inputs are in the correct format",
        "Try refreshing the page if the product appears unresponsive",
        "Contact support if issues persist"
      ]
    }

    if (product.name === 'Emergency Fund Tracker') {
      return {
        ...baseGuide,
        gettingStarted: [
          "Click on 'Emergency Fund Tracker' from the Products section",
          "Set your emergency fund goal (target amount and months coverage)",
          "Enter your monthly expenses (or use detailed expense breakdown)",
          "Track your progress by updating your current savings amount"
        ],
        commonTasks: [
          "Set emergency fund goal: Click 'Set Goal' and enter target amount",
          "Update progress: Click 'Update Progress' and enter current savings",
          "View health status: Check the health indicator for your fund status",
          "Use scenario analysis: Click 'Scenario Analysis' to see different scenarios",
          "Use decision clarifier: Get personalized recommendations based on your risk profile"
        ],
        troubleshooting: [
          "If goal isn't saving: Check that all required fields are filled",
          "If calculations seem wrong: Verify your monthly expenses are accurate",
          "If progress isn't updating: Ensure you're entering positive numbers",
          "If scenario analysis isn't working: Check that you have expense data"
        ]
      }
    }

    if (product.name === 'Budget Builder & Tracker') {
      return {
        ...baseGuide,
        gettingStarted: [
          "Access Budget Builder from the Products section",
          "Set up your budget categories",
          "Allocate amounts to each category",
          "Start tracking your expenses"
        ],
        commonTasks: [
          "Create budget: Set monthly budget for each category",
          "Track expenses: Add expenses and categorize them",
          "View reports: Check budget vs actual comparisons",
          "Adjust budget: Update budget amounts as needed"
        ]
      }
    }

    if (product.name === 'Cash Flow Analyzer') {
      return {
        ...baseGuide,
        gettingStarted: [
          "Open Cash Flow Analyzer from Products",
          "Enter your income sources",
          "Add your regular expenses",
          "View your cash flow projections"
        ],
        commonTasks: [
          "Add income: Enter all your income sources",
          "Add expenses: List your regular monthly expenses",
          "View projections: See future cash flow predictions",
          "Analyze trends: Review income vs expense patterns"
        ]
      }
    }

    return baseGuide
  }

  // Show all runbooks for the system
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">System Runbook</h3>
        <p className="text-sm text-gray-400">{systemId.toUpperCase()} system runbooks and best practices</p>
      </div>

      {/* MONEY System Best Practices */}
      {systemId === 'money' && (
        <div className="border border-gray-700 rounded-lg">
          <button
            onClick={() => toggleSection('systemBestPractices')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-semibold">MONEY System Best Practices</span>
            </div>
            {expandedSections.systemBestPractices ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSections.systemBestPractices && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-gray-300">{moneySystemBestPractices.overview}</p>
              <div>
                <h5 className="font-semibold mb-2 text-sm">Best Practices:</h5>
                <ul className="space-y-1">
                  {moneySystemBestPractices.practices.map((practice, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2 text-sm">Troubleshooting:</h5>
                <ul className="space-y-1">
                  {moneySystemBestPractices.troubleshooting.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Runbooks (Dev Onboarding/Support) */}
      {systemId === 'money' && (
        <div className="border border-gray-700 rounded-lg">
          <button
            onClick={() => toggleSection('productRunbooks')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Product Runbooks (Dev Onboarding/Support)</span>
              {!loadingProducts && products.length > 0 && (
                <span className="text-xs text-gray-400">({products.length} products)</span>
              )}
            </div>
            {expandedSections.productRunbooks ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSections.productRunbooks && (
            <div className="px-4 pb-4 space-y-4">
              {loadingProducts ? (
                <div className="text-sm text-gray-400">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-sm text-gray-400">No products available</div>
              ) : (
                products.map((product) => {
                  const runbook = getProductRunbook(product)
                  return (
                    <div key={product.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-blue-400" />
                      <h5 className="font-semibold">{product.name}</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h6 className="text-xs font-semibold text-gray-300 mb-1">Dev Onboarding:</h6>
                        <ul className="space-y-1">
                          {runbook.devOnboarding.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="text-xs font-semibold text-gray-300 mb-1">Support:</h6>
                        <ul className="space-y-1">
                          {runbook.support.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {runbook.commonIssues && (
                        <div>
                          <h6 className="text-xs font-semibold text-gray-300 mb-1">Common Issues:</h6>
                          <ul className="space-y-1">
                            {runbook.commonIssues.map((issue, idx) => (
                              <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h6 className="text-xs font-semibold text-gray-300 mb-1">Architecture:</h6>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Frontend: {runbook.architecture.frontend}</div>
                          <div>Backend: {runbook.architecture.backend}</div>
                          <div>Database: {runbook.architecture.database}</div>
                          <div>Security: {runbook.architecture.security}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* User Help Guides */}
      {systemId === 'money' && (
        <div className="border border-gray-700 rounded-lg">
          <button
            onClick={() => toggleSection('userGuides')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">User Help Guides</span>
              {!loadingProducts && products.length > 0 && (
                <span className="text-xs text-gray-400">({products.length} products)</span>
              )}
            </div>
            {expandedSections.userGuides ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSections.userGuides && (
            <div className="px-4 pb-4 space-y-4">
              {loadingProducts ? (
                <div className="text-sm text-gray-400">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-sm text-gray-400">No products available</div>
              ) : (
                products.map((product) => {
                  const guide = getUserHelpGuide(product)
                  return (
                    <div key={product.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-purple-400" />
                      <h5 className="font-semibold">{product.name}</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h6 className="text-xs font-semibold text-gray-300 mb-1">Getting Started:</h6>
                        <ol className="space-y-1">
                          {guide.gettingStarted.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-purple-400 mt-1">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      {guide.commonTasks.length > 0 && (
                        <div>
                          <h6 className="text-xs font-semibold text-gray-300 mb-1">Common Tasks:</h6>
                          <ul className="space-y-1">
                            {guide.commonTasks.map((task, idx) => (
                              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h6 className="text-xs font-semibold text-gray-300 mb-1">Troubleshooting:</h6>
                        <ul className="space-y-1">
                          {guide.troubleshooting.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Dependencies Section */}
      {metadata.dependencies.externalServices.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            External Dependencies
          </h4>
          <div className="space-y-2">
            {metadata.dependencies.externalServices.map((service, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Runbooks */}
      {Object.keys(metadata.runbooks).length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Component Runbooks
          </h4>
          <div className="space-y-3">
            {Object.entries(metadata.runbooks).map(([compId, runbook]) => {
              const component = metadata.components.find(c => c.id === compId)
              return (
                <div
                  key={compId}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => navigate(getSystemHealthRoute(systemId, 'dependencies'))}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {component && getComponentIcon(component.type)}
                    <span className="font-medium">{component?.name || compId}</span>
                  </div>
                  {runbook.expectedErrors.length > 0 && (
                    <div className="text-xs text-gray-400 mt-2">
                      {runbook.expectedErrors.length} expected error{runbook.expectedErrors.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(getSystemHealthRoute(systemId, 'components'))}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all components
          </button>
          <span className="text-gray-600">•</span>
          <button
            onClick={() => navigate(getSystemHealthRoute(systemId, 'dependencies'))}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View dependencies
          </button>
        </div>
      </div>
    </div>
  )
}

