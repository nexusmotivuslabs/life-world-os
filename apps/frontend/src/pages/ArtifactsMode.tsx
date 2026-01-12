/**
 * Artifacts Mode Page - Coming Soon
 * 
 * Placeholder for the Artifacts mode/plane.
 * Note: Artifacts already exist as a view within Systems, but this is a dedicated mode.
 */

import ComingSoon from './ComingSoon'
import { Sparkles } from 'lucide-react'

export default function ArtifactsMode() {
  return (
    <ComingSoon
      title="Artifacts"
      description="Discover and collect significant pieces of your operating system. Artifacts represent key resources, stats, systems, concepts, laws, and frameworks that shape your world."
      icon={Sparkles}
      color="text-purple-400"
      bgColor="bg-purple-600/20"
      backPath="/"
    />
  )
}





