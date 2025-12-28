import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6">Developer Hub</h1>
        <p className="text-xl text-gray-600 mb-8">
          Centralized knowledge base for all development teams working on the Master Money System.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <h2>Structure</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`Dev Hub
├── 00. Principles
│   ├── Ownership & Responsibility
│   ├── Safety Over Speed
│   └── Promotion, Not Deployment
│
├── 10. Developer Contracts
│   ├── Local Testing Contract
│   ├── CI Responsibility Contract
│   └── Staging Promotion Contract
│
├── 20. Workflows
│   ├── Branching Strategy
│   ├── Release Flow
│   └── Hotfix Process
│
├── 30. Tooling
│   ├── Local Setup
│   ├── Test Commands
│   └── CI Overview
│
└── 40. Reference
    ├── Architecture
    ├── ADRs
    └── Runbooks`}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title="00. Principles"
          description="Core development principles and values"
          href="/00-principles"
          items={[
            'Ownership & Responsibility',
            'Safety Over Speed',
            'Promotion, Not Deployment'
          ]}
        />
        
        <SectionCard
          title="10. Developer Contracts"
          description="Agreements and responsibilities"
          href="/10-developer-contracts"
          items={[
            'Local Testing Contract',
            'CI Responsibility Contract',
            'Staging Promotion Contract'
          ]}
        />
        
        <SectionCard
          title="20. Workflows"
          description="Development workflows and processes"
          href="/20-workflows"
          items={[
            'Branching Strategy',
            'Release Flow',
            'Hotfix Process'
          ]}
        />
        
        <SectionCard
          title="30. Tooling"
          description="Development tools and setup"
          href="/30-tooling"
          items={[
            'Local Setup',
            'Test Commands',
            'CI Overview'
          ]}
        />
        
        <SectionCard
          title="40. Reference"
          description="Architecture and technical reference"
          href="/40-reference"
          items={[
            'Architecture',
            'ADRs',
            'Runbooks'
          ]}
        />
        
        <SectionCard
          title="Domains"
          description="Domain-specific documentation"
          href="/domains"
          items={[
            'Platform Engineering',
            'Security',
            'More domains...'
          ]}
        />
      </div>
    </div>
  )
}

function SectionCard({ 
  title, 
  description, 
  href, 
  items 
}: { 
  title: string
  description: string
  href: string
  items: string[]
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-center">
              <span className="mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
