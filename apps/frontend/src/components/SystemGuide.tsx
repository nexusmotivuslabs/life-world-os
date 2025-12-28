import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, BookOpen, Layers, TrendingUp, Target } from 'lucide-react'

export default function SystemGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-28 z-30 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white transition-all hover:scale-110"
        aria-label="Open system guide"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="guide-title"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <h2 id="guide-title" className="text-2xl font-bold text-white">
                      Life World OS Guide
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    aria-label="Close guide"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                  {/* What are Clouds */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white">What are Clouds?</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Clouds are persistent background systems that influence all outcomes in your life. Think of them
                      as the operating environment that affects everything you do. They're not directly controlled, but
                      their strength (0-100%) determines how well your systems function.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      There are five clouds: <strong className="text-white">Capacity</strong> (health & energy),{' '}
                      <strong className="text-white">Engines</strong> (income sources),{' '}
                      <strong className="text-white">Oxygen</strong> (cash flow),{' '}
                      <strong className="text-white">Meaning</strong> (purpose & values), and{' '}
                      <strong className="text-white">Optionality</strong> (freedom & assets).
                    </p>
                  </section>

                  {/* How Clouds Work */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">How Clouds Work</h3>
                    </div>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-start gap-3">
                        <span className="text-green-400 font-bold">Strong (70-100%):</span>
                        <span>Cloud is functioning well, providing positive effects to related systems.</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-400 font-bold">Medium (40-70%):</span>
                        <span>Cloud is functioning but could be improved. Some limitations may apply.</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 font-bold">Weak (0-40%):</span>
                        <span>
                          Cloud is struggling. Negative effects may occur, and system rules may be triggered (e.g.,
                          forced Winter season if Capacity is too low).
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* System Relationships */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">How Clouds Affect Your System</h3>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Cloud → Resources</h4>
                        <ul className="text-gray-300 text-sm space-y-1 ml-4">
                          <li>• Capacity Cloud affects Water resource</li>
                          <li>• Engines Cloud affects Oxygen resource</li>
                          <li>• Oxygen Cloud directly affects Oxygen resource</li>
                          <li>• Optionality Cloud affects Keys resource</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Cloud → XP Categories</h4>
                        <p className="text-gray-300 text-sm">
                          Each cloud has a corresponding XP category. Activities that strengthen a cloud also earn XP in
                          that category.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">System Rules</h4>
                        <ul className="text-gray-300 text-sm space-y-1 ml-4">
                          <li>• Low Capacity (Water &lt; 20) forces Winter season</li>
                          <li>• Low Capacity (Water &lt; 30) blocks progression</li>
                          <li>• Low Oxygen (&lt; 3 months) blocks expansion</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* How to Use */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">How to Use This Dashboard</h3>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold">1.</span>
                        <div>
                          <strong className="text-white">Hover over clouds</strong> to see quick information about
                          their current state
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold">2.</span>
                        <div>
                          <strong className="text-white">Click any cloud</strong> to see detailed information,
                          including what happens when it's strong or weak, and how to improve it
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold">3.</span>
                        <div>
                          <strong className="text-white">Record activities</strong> to earn XP and improve your clouds
                          over time
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold">4.</span>
                        <div>
                          <strong className="text-white">Monitor balance</strong> - keep all clouds healthy, not just
                          one
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Key Principles */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">Key Principles</h3>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2 text-gray-300">
                      <p>
                        <strong className="text-white">Long-term resilience over short-term optimization</strong> -
                        Build systems that last
                      </p>
                      <p>
                        <strong className="text-white">Optionality and freedom over dependency</strong> - Create
                        choices, not obligations
                      </p>
                      <p>
                        <strong className="text-white">Sustainable cycles over permanent grind</strong> - Respect
                        seasons and rest
                      </p>
                      <p>
                        <strong className="text-white">Human well-being over productivity metrics</strong> - Your
                        health comes first
                      </p>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}


