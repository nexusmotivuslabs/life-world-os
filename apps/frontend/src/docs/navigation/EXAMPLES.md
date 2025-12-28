# Navigation Examples

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## Table of Contents

1. [Basic Navigation](#basic-navigation)
2. [Navigation with Route Helpers](#navigation-with-route-helpers)
3. [Navigation with Parameters](#navigation-with-parameters)
4. [Breadcrumb Usage](#breadcrumb-usage)
5. [Conditional Navigation](#conditional-navigation)
6. [Navigation from Events](#navigation-from-events)
7. [Real-World Examples](#real-world-examples)

---

## Basic Navigation

### Example 1: Simple Button Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'

function MyComponent() {
  const { navigateTo } = useNavigation()
  
  return (
    <button onClick={() => navigateTo('/systems')}>
      Go to Systems
    </button>
  )
}
```

### Example 2: Link Navigation

```typescript
import { Link } from 'react-router-dom'
import { routes } from '../config/routes'

function MyComponent() {
  return (
    <Link to={routes.systems.path}>
      Go to Systems
    </Link>
  )
}
```

### Example 3: Navigation with Icon

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'
import { Zap } from 'lucide-react'

function MyComponent() {
  const { navigateTo } = useNavigation()
  const Icon = routes.systems.icon
  
  return (
    <button 
      onClick={() => navigateTo(routes.systems.path)}
      className="flex items-center gap-2"
    >
      {Icon && <Icon className="w-4 h-4" />}
      Go to Systems
    </button>
  )
}
```

---

## Navigation with Route Helpers

### Example 1: Using Route Helper Function

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { getMasterRoute, MasterDomain } from '../config/routes'

function MyComponent() {
  const { navigateTo } = useNavigation()
  
  const handleClick = () => {
    navigateTo(getMasterRoute(MasterDomain.MONEY))
  }
  
  return (
    <button onClick={handleClick}>
      Go to Money System
    </button>
  )
}
```

### Example 2: Using Hook Helper Method

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { MasterDomain } from '../types'

function MyComponent() {
  const { navigateToMaster } = useNavigation()
  
  return (
    <button onClick={() => navigateToMaster(MasterDomain.MONEY)}>
      Go to Money System
    </button>
  )
}
```

---

## Navigation with Parameters

### Example 1: Product Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { MasterDomain } from '../types'

function ProductCard({ productId }: { productId: string }) {
  const { navigateToMasterProduct } = useNavigation()
  
  return (
    <button 
      onClick={() => 
        navigateToMasterProduct(MasterDomain.MONEY, productId)
      }
    >
      View Product
    </button>
  )
}
```

### Example 2: System Health Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { getSystemHealthRoute } from '../config/routes'

function SystemCard({ systemId }: { systemId: string }) {
  const { navigateTo } = useNavigation()
  
  return (
    <button 
      onClick={() => 
        navigateTo(getSystemHealthRoute(systemId, 'observability'))
      }
    >
      View System Health
    </button>
  )
}
```

---

## Breadcrumb Usage

### Example 1: Display Breadcrumbs

```typescript
import { useNavigation } from '../hooks/useNavigation'

function MyPage() {
  const { breadcrumbs } = useNavigation()
  
  return (
    <nav>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path}>
          {index > 0 && ' > '}
          <a href={crumb.path}>{crumb.label}</a>
        </span>
      ))}
    </nav>
  )
}
```

### Example 2: Breadcrumbs with Icons

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { Link } from 'react-router-dom'

function MyPage() {
  const { breadcrumbs } = useNavigation()
  
  return (
    <nav className="flex items-center gap-2">
      {breadcrumbs.map((crumb, index) => {
        const Icon = crumb.icon
        return (
          <div key={crumb.path} className="flex items-center gap-1">
            {index > 0 && <span>/</span>}
            <Link to={crumb.path} className="flex items-center gap-1">
              {Icon && <Icon className="w-4 h-4" />}
              {crumb.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
```

---

## Conditional Navigation

### Example 1: Auth-Based Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { useGameStore } from '../store/useGameStore'

function MyComponent() {
  const { navigateTo } = useNavigation()
  const { isDemo } = useGameStore()
  
  const handleClick = () => {
    if (isDemo) {
      navigateTo('/login')
    } else {
      navigateTo('/systems')
    }
  }
  
  return <button onClick={handleClick}>Navigate</button>
}
```

### Example 2: Permission-Based Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { useGameStore } from '../store/useGameStore'

function AdminButton() {
  const { navigateTo } = useNavigation()
  const { dashboard } = useGameStore()
  const isAdmin = dashboard?.user.isAdmin
  
  if (!isAdmin) return null
  
  return (
    <button onClick={() => navigateTo('/admin')}>
      Admin Panel
    </button>
  )
}
```

---

## Navigation from Events

### Example 1: Form Submission

```typescript
import { useNavigation } from '../hooks/useNavigation'

function LoginForm() {
  const { navigateTo } = useNavigation()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Perform login
    const success = await loginUser(credentials)
    
    if (success) {
      navigateTo('/choose-plane')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Example 2: Modal Close Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'

function ProductModal({ productId, onClose }: Props) {
  const { navigateToMasterProduct } = useNavigation()
  const { MasterDomain } = require('../types')
  
  const handleViewDetails = () => {
    onClose()
    navigateToMasterProduct(MasterDomain.MONEY, productId)
  }
  
  return (
    <div>
      <button onClick={handleViewDetails}>
        View Full Details
      </button>
    </div>
  )
}
```

### Example 3: Search Result Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'

function SearchResults({ results }: { results: SearchResult[] }) {
  const { navigateTo } = useNavigation()
  
  const handleResultClick = (result: SearchResult) => {
    navigateTo(result.route)
  }
  
  return (
    <div>
      {results.map(result => (
        <div 
          key={result.id}
          onClick={() => handleResultClick(result)}
        >
          {result.title}
        </div>
      ))}
    </div>
  )
}
```

---

## Real-World Examples

### Example 1: HomePage Navigation

```typescript
// pages/HomePage.tsx
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

export default function HomePage() {
  const { navigateTo } = useNavigation()
  
  return (
    <div>
      <button 
        onClick={() => navigateTo(routes.tiers.path)}
        className="w-full p-6 bg-gray-800 rounded-lg"
      >
        View System Tiers
      </button>
    </div>
  )
}
```

### Example 2: Product Detail Navigation

```typescript
// components/ProductDetailView.tsx
import { useNavigation } from '../hooks/useNavigation'
import { getMasterRoute, MasterDomain } from '../config/routes'

export default function ProductDetailView() {
  const { navigateTo } = useNavigation()
  
  const handleBack = () => {
    navigateTo(getMasterRoute(MasterDomain.MONEY))
  }
  
  return (
    <div>
      <button onClick={handleBack}>
        Back to Money System
      </button>
      {/* Product details */}
    </div>
  )
}
```

### Example 3: Knowledge Plane Navigation

```typescript
// pages/KnowledgePlane.tsx
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

export default function KnowledgePlane() {
  const { navigateTo } = useNavigation()
  
  const sections = [
    { route: routes.knowledgeSearch.path, label: 'Search' },
    { route: routes.knowledgeLaws.path, label: 'Laws' },
    { route: routes.knowledgeOverview.path, label: 'Overview' },
  ]
  
  return (
    <div>
      {sections.map(section => (
        <button 
          key={section.route}
          onClick={() => navigateTo(section.route)}
        >
          {section.label}
        </button>
      ))}
    </div>
  )
}
```

### Example 4: Master Domain Navigation

```typescript
// pages/MasterMoney.tsx
import { useNavigation } from '../hooks/useNavigation'
import { MasterDomain } from '../types'

export default function MasterMoney() {
  const { navigateToMasterProduct } = useNavigation()
  
  const handleProductClick = (productId: string) => {
    navigateToMasterProduct(MasterDomain.MONEY, productId)
  }
  
  return (
    <div>
      {products.map(product => (
        <div 
          key={product.id}
          onClick={() => handleProductClick(product.id)}
        >
          {product.name}
        </div>
      ))}
    </div>
  )
}
```

---

## Common Patterns

### Pattern 1: Navigation Menu

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

function NavigationMenu() {
  const { navigateTo, currentPath } = useNavigation()
  
  const menuItems = [
    routes.home,
    routes.systems,
    routes.knowledge,
  ]
  
  return (
    <nav>
      {menuItems.map(item => (
        <button
          key={item.path}
          onClick={() => navigateTo(item.path)}
          className={currentPath === item.path ? 'active' : ''}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
```

### Pattern 2: Back Button

```typescript
import { useNavigation } from '../hooks/useNavigation'

function BackButton() {
  const { goBack } = useNavigation()
  
  return (
    <button onClick={goBack}>
      ← Back
    </button>
  )
}
```

### Pattern 3: Breadcrumb Navigation

```typescript
import { useNavigation } from '../hooks/useNavigation'
import { Link } from 'react-router-dom'

function BreadcrumbNav() {
  const { breadcrumbs } = useNavigation()
  
  return (
    <nav aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path}>
          {index > 0 && <span> / </span>}
          {index === breadcrumbs.length - 1 ? (
            <span>{crumb.label}</span>
          ) : (
            <Link to={crumb.path}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
```

---

## Related Documentation

- [Route Configuration](./ROUTE_CONFIGURATION.md) - How to define routes
- [Best Practices](./BEST_PRACTICES.md) - Guidelines
- [Migration Guide](./MIGRATION_GUIDE.md) - Fixing issues

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly


