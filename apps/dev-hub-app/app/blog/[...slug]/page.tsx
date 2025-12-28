'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function BlogPostPage({ params }: { params: { slug: string[] } }) {
  const { isPaid, isLoading } = useAuth()
  const router = useRouter()
  const slug = params.slug.join('/')

  useEffect(() => {
    if (!isLoading && !isPaid) {
      router.push('/')
    }
  }, [isPaid, isLoading, router])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!isPaid) {
    return null
  }

  // In a real app, fetch the post content based on slug
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <article className="prose prose-lg max-w-none">
          <h1>Blog Post: {slug}</h1>
          <p>This is a placeholder for the blog post content.</p>
          <p>
            In a production app, you would fetch the actual post content from a
            database or CMS based on the slug.
          </p>
        </article>
      </div>
    </div>
  )
}

