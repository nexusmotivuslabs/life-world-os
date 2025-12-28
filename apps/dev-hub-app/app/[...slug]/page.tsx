import { notFound } from 'next/navigation'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PageProps {
  params: {
    slug: string[]
  }
}

async function getMarkdownContent(slug: string[]) {
  try {
    const filePath = join(process.cwd(), 'content', ...slug) + '.md'
    const fileContents = await readFile(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    return { frontmatter: data, content }
  } catch (error) {
    // Try as directory with README.md
    try {
      const filePath = join(process.cwd(), 'content', ...slug, 'README.md')
      const fileContents = await readFile(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      return { frontmatter: data, content }
    } catch (error2) {
      return null
    }
  }
}

export default async function MarkdownPage({ params }: PageProps) {
  const content = await getMarkdownContent(params.slug)

  if (!content) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-sm p-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
}

export async function generateStaticParams() {
  // This would need to be implemented to generate static paths
  // For now, we'll use dynamic rendering
  return []
}


