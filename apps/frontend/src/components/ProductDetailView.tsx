/**
 * ProductDetailView Component
 * 
 * Single product view showing product details and access.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { X, Shield, Lock, ChevronRight, Calculator, BarChart3, TrendingUp, BookOpen, Package } from 'lucide-react'
import { productsApi, Product } from '../services/financeApi'
import { useToastStore } from '../store/useToastStore'
import EmergencyFundTracker from './EmergencyFundTracker'
import BudgetBuilderTracker from './BudgetBuilderTracker'
import CashFlowAnalyzer from './CashFlowAnalyzer'
import { useNavigation } from '../hooks/useNavigation'
import { MasterDomain } from '../types'

interface ProductDetailViewProps {
  onClose?: () => void
}

export default function ProductDetailView({ onClose }: ProductDetailViewProps) {
  const { productId } = useParams<{ productId: string }>()
  const { navigateToMaster } = useNavigation()
  const { addToast } = useToastStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productsApi.get(productId!)
      setProduct(data)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load product'
      
      addToast({
        type: 'error',
        title: 'Failed to Load Product',
        message: errorMessage,
      })
      
      if (onClose) {
        onClose()
      } else {
        navigateToMaster(MasterDomain.FINANCE)
      }
    } finally {
      setLoading(false)
    }
  }

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'CALCULATOR':
        return Calculator
      case 'TRACKER':
        return TrendingUp
      case 'ANALYZER':
        return BarChart3
      case 'DASHBOARD':
        return BarChart3
      case 'PLANNER':
        return BookOpen
      default:
        return Package
    }
  }

  const renderProductContent = () => {
    if (!product) return null

    // Render specific product components
    if (product.name === 'Emergency Fund Tracker') {
      return <EmergencyFundTracker />
    }
    if (product.name === 'Budget Builder & Tracker') {
      return <BudgetBuilderTracker />
    }
    if (product.name === 'Cash Flow Analyzer') {
      return <CashFlowAnalyzer />
    }

    // Generic product view
    const Icon = getProductIcon(product.type)
    const securityLevelColor = product.securityLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                               product.securityLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                               'bg-green-500/20 text-green-400'

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              {product.securityLevel && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${securityLevelColor}`}>
                  {product.securityLevel} Security
                </span>
              )}
            </div>
          </div>
          
          <p className="text-gray-300 mb-6">{product.description}</p>

          {/* Security Information */}
          {product.security && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-semibold text-gray-300">Security & Compliance</span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                {product.security.complianceStandards && product.security.complianceStandards.length > 0 && (
                  <div>
                    <span className="text-gray-500">Compliance: </span>
                    {product.security.complianceStandards.join(', ')}
                  </div>
                )}
                {product.security.encryptionAtRest && product.security.encryptionInTransit && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Encrypted at rest & in transit</span>
                  </div>
                )}
                {product.security.authenticationMethod && (
                  <div>
                    <span className="text-gray-500">Authentication: </span>
                    {product.security.authenticationMethod}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && Array.isArray(product.features) && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature: any, index: number) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                    <h4 className="font-medium mb-1">{feature.name || `Feature ${index + 1}`}</h4>
                    {feature.description && (
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Access */}
          {product.accessUrl && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">This product is available in the app</p>
              <p className="text-xs text-gray-500">Route: {product.accessUrl}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (onClose) {
                onClose()
              } else {
                navigateToMaster(MasterDomain.FINANCE)
              }
            }}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Product Content */}
        {renderProductContent()}
      </div>
    </div>
  )
}

