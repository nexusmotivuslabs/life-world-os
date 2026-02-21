/**
 * Artifact Portfolio Template
 * Optionality mini-app: templates for design docs, post-mortems, guides.
 */
import { useState } from 'react'
import { FileText, Copy, Check } from 'lucide-react'

type TemplateType = 'design-doc' | 'post-mortem' | 'guide'

const TEMPLATES: Record<
  TemplateType,
  { title: string; sections: string[] }
> = {
  'design-doc': {
    title: 'Design doc',
    sections: [
      '## Context & problem',
      '## Goals & non-goals',
      '## Options considered',
      '## Proposed solution',
      '## Success metrics',
      '## Risks & mitigation',
      '## Open questions',
    ],
  },
  'post-mortem': {
    title: 'Post-mortem',
    sections: [
      '## Summary',
      '## Impact',
      '## Timeline',
      '## Root cause',
      '## What went well',
      '## What went wrong',
      '## Action items',
    ],
  },
  guide: {
    title: 'Guide',
    sections: [
      '## Overview',
      '## Prerequisites',
      '## Steps',
      '## Troubleshooting',
      '## References',
    ],
  },
}

export default function ArtifactPortfolioTemplate() {
  const [active, setActive] = useState<TemplateType>('design-doc')
  const [copied, setCopied] = useState(false)

  const t = TEMPLATES[active]
  const markdown = [`# ${t.title}\n`, ...t.sections].join('\n\n')

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-400" /> Artifact templates
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Use a template to start a design doc, post-mortem, or guide.
      </p>
      <div className="flex gap-1 mb-3">
        {(Object.keys(TEMPLATES) as TemplateType[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              active === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {TEMPLATES[key].title}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-gray-800 border border-gray-600 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600">
          <span className="text-xs text-gray-400">{t.title} structure</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-3 text-xs text-gray-300 whitespace-pre-wrap font-sans overflow-x-auto max-h-48 overflow-y-auto">
          {markdown}
        </pre>
      </div>
    </div>
  )
}
