/**
 * Blog Routes
 * 
 * Serves blog post content from the blog directory
 */

import { Router } from 'express'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = Router()

// All blog routes require authentication
router.use(authenticateToken)

// Blog posts metadata
const BLOG_POSTS = [
  {
    slug: 'gitops-vs-gitflow',
    title: 'GitOps vs Git Flow: A Practical Comparison',
    category: 'Systems',
    subcategory: 'Version Control',
    tags: ['gitops', 'git-flow', 'ci-cd', 'devops', 'version-control', 'deployment'],
    date: '2025-01-15',
    path: 'systems/version-control/gitops-vs-gitflow.md'
  },
  {
    slug: 'react-performance-optimization',
    title: 'React Performance Optimization Techniques',
    category: 'Tech',
    subcategory: 'Frontend',
    tags: ['react', 'performance', 'optimization', 'frontend', 'javascript'],
    date: '2025-01-20',
    path: 'tech/frontend/react-performance-optimization.md'
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices for Large Codebases',
    category: 'Tech',
    subcategory: 'Programming',
    tags: ['typescript', 'programming', 'best-practices', 'code-quality'],
    date: '2025-01-18',
    path: 'tech/programming/typescript-best-practices.md'
  },
  {
    slug: 'database-design-patterns',
    title: 'Database Design Patterns for Scalable Applications',
    category: 'Tech',
    subcategory: 'Backend',
    tags: ['database', 'design-patterns', 'scalability', 'backend'],
    date: '2025-01-22',
    path: 'tech/backend/database-design-patterns.md'
  },
  {
    slug: 'deployment-strategies',
    title: 'Modern Deployment Strategies: Blue-Green vs Canary',
    category: 'Systems',
    subcategory: 'DevOps',
    tags: ['deployment', 'devops', 'blue-green', 'canary', 'ci-cd'],
    date: '2025-01-16',
    path: 'systems/devops/deployment-strategies.md'
  },
  {
    slug: 'early-decisions-optionality',
    title: 'How to Make Early Decisions Without Trapping Yourself',
    category: 'Career',
    subcategory: 'Decision Making',
    tags: ['optionality', 'career', 'decision-making', 'strategy', 'skills', 'early-career', 'learning', 'proof-of-value'],
    date: '2025-01-27',
    path: 'career/decision-making/early-decisions-optionality.md'
  },
  {
    slug: 'how-to-avoid-burning-reputation-or-trust',
    title: 'How to Avoid Burning Reputation or Trust',
    category: 'Career',
    subcategory: 'Professional Development',
    tags: ['reputation', 'trust', 'career', 'professional-development', 'reliability', 'credibility', 'leadership'],
    date: '2025-01-27',
    path: 'career/professional-development/how-to-avoid-burning-reputation-or-trust.md'
  },
  {
    slug: 'why-general-skills-beat-narrow-specialisation-early',
    title: 'Why General Skills Beat Narrow Specialisation Early',
    category: 'Career',
    subcategory: 'Skills',
    tags: ['skills', 'specialization', 'career', 'tech', 'software-engineering', 'early-career', 'learning', 'optionality'],
    date: '2025-01-27',
    path: 'career/skills/why-general-skills-beat-narrow-specialisation-early.md'
  }
]

/**
 * Helper function to get all blog posts (static + all database posts - system-wide)
 */
async function getAllBlogPosts(): Promise<typeof BLOG_POSTS> {
  try {
    // Get all blog posts from database (system-wide, visible to all users)
    const dbPosts = await prisma.blogPost.findMany({
      select: {
        slug: true,
        title: true,
        category: true,
        subcategory: true,
        tags: true,
        filePath: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert database posts to the same format as static posts
    const dbPostsFormatted = dbPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      category: post.category,
      subcategory: post.subcategory || undefined,
      tags: post.tags,
      date: post.createdAt.toISOString().split('T')[0],
      path: post.filePath,
    }))

    // Combine static posts and database posts
    const allPostsMap = new Map<string, typeof BLOG_POSTS[0]>()
    
    // Add static posts first
    BLOG_POSTS.forEach(post => {
      allPostsMap.set(post.slug, post)
    })
    
    // Add/override with database posts
    dbPostsFormatted.forEach(post => {
      allPostsMap.set(post.slug, post as typeof BLOG_POSTS[0])
    })

    // Convert back to array and sort by date (newest first)
    return Array.from(allPostsMap.values()).sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching all blog posts:', error)
    // Fallback to static posts only
    return BLOG_POSTS
  }
}

/**
 * GET /api/blog/posts
 * Get all blog posts metadata (system-wide, visible to all authenticated users)
 */
router.get('/posts', async (req, res) => {
  try {
    const allPosts = await getAllBlogPosts()
    res.json(allPosts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

/**
 * GET /api/blog/posts/:slug
 * Get blog post content by slug (checks both static posts and database)
 */
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    // First check static posts
    let post = BLOG_POSTS.find(p => p.slug === slug)
    
    // If not found in static posts, check database
    if (!post) {
      const dbPost = await prisma.blogPost.findUnique({
        where: { slug },
        select: {
          slug: true,
          title: true,
          category: true,
          subcategory: true,
          tags: true,
          filePath: true,
          createdAt: true,
          published: true,
        },
      })
      
      if (dbPost) {
        post = {
          slug: dbPost.slug,
          title: dbPost.title,
          category: dbPost.category,
          subcategory: dbPost.subcategory || undefined,
          tags: dbPost.tags,
          date: dbPost.createdAt.toISOString().split('T')[0],
          path: dbPost.filePath,
        }
      }
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    // Read markdown file from blog directory
    // Blog directory is at project root
    // From src/routes/blog.ts: go up 2 levels to project root (apps/backend/src/routes -> apps/backend -> project root)
    // From dist/routes/blog.js: go up 3 levels to project root (dist/routes -> dist -> apps/backend -> project root)
    const isProduction = process.env.NODE_ENV === 'production'
    const projectRoot = isProduction 
      ? join(__dirname, '../../../') 
      : join(__dirname, '../../')
    
    // Try multiple path resolution strategies
    const possiblePaths = [
      join(projectRoot, 'blog', post.path), // Standard path
      join(process.cwd(), 'blog', post.path), // From current working directory
      join(__dirname, '../../../../blog', post.path), // Alternative relative path
    ]
    
    let content: string | null = null
    let successfulPath: string | null = null
    
    for (const blogPath of possiblePaths) {
      try {
        content = readFileSync(blogPath, 'utf-8')
        successfulPath = blogPath
        break
      } catch (fileError: any) {
        // Continue to next path
        continue
      }
    }
    
    if (content) {
      res.json({
        ...post,
        content
      })
    } else {
      console.error('Error reading blog file - tried paths:', possiblePaths)
      res.status(500).json({ 
        error: 'Failed to read blog post content',
        attemptedPaths: possiblePaths,
        postPath: post.path,
        projectRoot,
        __dirname,
        cwd: process.cwd()
      })
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

/**
 * GET /api/blog/categories
 * Get blog categories (includes all published posts from database)
 */
router.get('/categories', async (req, res) => {
  try {
    const allPosts = await getAllBlogPosts()

    // Group by category
    const categories = new Map<string, typeof BLOG_POSTS>()
    
    allPosts.forEach(post => {
      const key = post.category
      if (!categories.has(key)) {
        categories.set(key, [])
      }
      categories.get(key)!.push(post)
    })

    const result = Array.from(categories.entries()).map(([name, posts]) => ({
      name,
      path: `/blog/${name.toLowerCase()}`,
      posts
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    res.status(500).json({ error: 'Failed to fetch blog categories' })
  }
})

/**
 * POST /api/blog/posts
 * Create a new blog post (authenticated users only)
 */
const createBlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  content: z.string().min(1),
  slug: z.string().optional(), // Auto-generated from title if not provided
})

router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = createBlogPostSchema.parse(req.body)

    // Generate slug from title if not provided
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists (in memory cache and database)
    if (BLOG_POSTS.find(p => p.slug === slug)) {
      return res.status(400).json({ error: 'Blog post with this slug already exists' })
    }
    
    // Also check database
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })
    
    if (existingPost) {
      return res.status(400).json({ error: 'Blog post with this slug already exists' })
    }

    // Determine file path based on category and subcategory
    const categoryPath = data.category.toLowerCase().replace(/\s+/g, '-')
    const subcategoryPath = data.subcategory 
      ? data.subcategory.toLowerCase().replace(/\s+/g, '-')
      : 'general'
    
    const filePath = `${categoryPath}/${subcategoryPath}/${slug}.md`
    const fullPath = join(process.cwd(), 'blog', filePath)

    // Create directory if it doesn't exist
    const dirPath = join(process.cwd(), 'blog', categoryPath, subcategoryPath)
    mkdirSync(dirPath, { recursive: true })

    // Format markdown content with frontmatter
    const date = new Date().toISOString().split('T')[0]
    const markdownContent = `# ${data.title}

**Category**: ${data.category}${data.subcategory ? ` → ${data.subcategory}` : ''}  
**Tags**: ${data.tags.map(t => `\`${t}\``).join(', ')}  
**Date**: ${date}  
**Context**: Life World OS Project

---

${data.content}

---

**Author**: User ID ${userId}  
**Last Updated**: ${date}
`

    // Write file
    writeFileSync(fullPath, markdownContent, 'utf-8')

    // Create blog post metadata
    const newPost = {
      slug,
      title: data.title,
      category: data.category,
      subcategory: data.subcategory,
      tags: data.tags,
      date,
      path: filePath
    }

    // Save to database
    const dbPost = await prisma.blogPost.create({
      data: {
        userId,
        slug,
        title: data.title,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags,
        content: data.content,
        filePath,
        published: true, // All posts are system-wide and visible to all users
      }
    })

    // Add to BLOG_POSTS array (in-memory cache)
    // Note: In production, consider loading from database on server start
    BLOG_POSTS.push(newPost)

    res.status(201).json({
      message: 'Blog post created successfully',
      post: {
        ...newPost,
        id: dbPost.id,
        published: dbPost.published
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating blog post:', error)
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

export default router

