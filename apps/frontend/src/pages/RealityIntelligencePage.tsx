/**
 * Reality Intelligence Plane
 *
 * Renders the RIE dashboard in-app so it navigates like any other plane
 * (same tab, same shell). Embeds the standalone RIE app via iframe.
 */
const RIE_APP_URL = import.meta.env.VITE_RIE_APP_URL ?? 'http://localhost:5173/reality-intelligence/'

export default function RealityIntelligencePage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] w-full flex-col rounded-lg border border-gray-700/60 bg-gray-900 overflow-hidden">
      <iframe
        title="Reality Intelligence Engine — UK macro constraint intelligence"
        src={RIE_APP_URL}
        className="h-full min-h-[600px] w-full flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
