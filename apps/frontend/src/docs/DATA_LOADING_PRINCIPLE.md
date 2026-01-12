# Data Loading Principle for React Pages

## Principle

**Load all required data before rendering the page content.** This ensures users see content immediately when navigating to a page, rather than seeing loading states after the page has already rendered.

## Implementation Pattern

### 1. Create a Page Loader Component

Create a wrapper component that loads data before rendering the page:

```tsx
// components/MyPageLoader.tsx
import { usePageDataLoader } from '../hooks/usePageDataLoader'
import MyPage from '../pages/MyPage'

interface MyPageData {
  // Define your data structure
  items: Item[]
  metadata: Metadata
}

export default function MyPageLoader() {
  const { data, loading, error, retry } = usePageDataLoader<MyPageData>(
    async () => {
      // Load all required data in parallel
      const [items, metadata] = await Promise.all([
        api.getItems(),
        api.getMetadata(),
      ])

      return { items, metadata }
    }
  )

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={retry} />
  }

  if (!data) return null

  // Pass preloaded data to the page component
  return <MyPage initialData={data} />
}
```

### 2. Update Page Component to Accept Initial Data

```tsx
// pages/MyPage.tsx
interface MyPageProps {
  initialData?: {
    items: Item[]
    metadata: Metadata
  }
}

export default function MyPage({ initialData }: MyPageProps) {
  // Initialize state from initialData if provided
  const [items, setItems] = useState<Item[]>(initialData?.items || [])
  const [metadata, setMetadata] = useState<Metadata | null>(initialData?.metadata || null)
  const [loading, setLoading] = useState(!initialData) // No loading if data is preloaded

  useEffect(() => {
    // Only load if data wasn't preloaded
    if (!initialData) {
      loadData()
    }
  }, []) // Only run once on mount

  // ... rest of component
}
```

### 3. Use Loader in Routes

```tsx
// App.tsx
<Route path="/my-page" element={
  <Layout>
    <MyPageLoader />
  </Layout>
} />
```

## Benefits

1. **Better UX**: Users see content immediately, not loading spinners
2. **Consistent Pattern**: All pages follow the same data loading approach
3. **Error Handling**: Centralized error handling in the loader
4. **Reusability**: The `usePageDataLoader` hook can be used for any page
5. **Type Safety**: TypeScript ensures data structure consistency

## Example: LoadoutPage

See `components/LoadoutPageLoader.tsx` and `pages/LoadoutPage.tsx` for a complete implementation.

## Hook: usePageDataLoader

The `usePageDataLoader` hook provides:
- Automatic data loading on mount
- Loading state management
- Error handling
- Retry functionality
- Type-safe data structure

```tsx
const { data, loading, error, retry } = usePageDataLoader<T>(
  loadFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
)
```





