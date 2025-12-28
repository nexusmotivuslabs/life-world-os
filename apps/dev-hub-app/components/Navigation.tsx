import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Developer Hub
          </Link>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/00-principles" className="text-gray-600 hover:text-gray-900">
              Principles
            </Link>
            <Link href="/10-developer-contracts" className="text-gray-600 hover:text-gray-900">
              Contracts
            </Link>
            <Link href="/20-workflows" className="text-gray-600 hover:text-gray-900">
              Workflows
            </Link>
            <Link href="/30-tooling" className="text-gray-600 hover:text-gray-900">
              Tooling
            </Link>
            <Link href="/40-reference" className="text-gray-600 hover:text-gray-900">
              Reference
            </Link>
            <Link href="/domains" className="text-gray-600 hover:text-gray-900">
              Domains
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}


