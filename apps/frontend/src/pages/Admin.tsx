import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Save, RefreshCw, ArrowLeft, Cloud, Coins, Award, Zap, User, Bell, Palette, Globe } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'
import { adminApi, cloudsApi, resourcesApi, xpApi, seasonsApi } from '../services/api'
import { Season } from '../types'

export default function Admin() {
  const navigate = useNavigate()
  const { dashboard, fetchDashboard, isDemo } = useGameStore()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  // Cloud states
  const [clouds, setClouds] = useState({
    capacity: 50,
    engines: 50,
    oxygen: 50,
    meaning: 50,
    optionality: 50,
  })

  // Resource states
  const [resources, setResources] = useState({
    oxygen: 0,
    water: 50,
    gold: 0,
    armor: 0,
    keys: 0,
  })

  // XP states
  const [xp, setXP] = useState({
    overall: 0,
    capacity: 0,
    engines: 0,
    oxygen: 0,
    meaning: 0,
    optionality: 0,
  })

  // Season state
  const [season, setSeason] = useState<Season>(Season.SPRING)

  // User Settings states
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    systemNotifications: true,
    defaultPlane: 'systems' as 'knowledge' | 'systems',
    theme: 'dark' as 'light' | 'dark' | 'auto',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  useEffect(() => {
    if (isDemo) {
      addToast({
        type: 'info',
        title: 'Sign Up Required',
        message: 'Please sign up to access admin settings',
      })
      navigate('/register')
      return
    }

    if (!dashboard) {
      fetchDashboard()
      return
    }

    // Check if user is admin
    if (!dashboard.user.isAdmin) {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Admin access required. Admin status can only be granted via database configuration.',
      })
      navigate('/systems')
      return
    }

    // Load current values
    setClouds({
      capacity: dashboard.clouds.capacity,
      engines: dashboard.clouds.engines,
      oxygen: dashboard.clouds.oxygen,
      meaning: dashboard.clouds.meaning,
      optionality: dashboard.clouds.optionality,
    })

    setResources({
      oxygen: dashboard.resources.oxygen,
      water: dashboard.resources.water,
      gold: dashboard.resources.gold,
      armor: dashboard.resources.armor,
      keys: dashboard.resources.keys,
    })

    setXP({
      overall: dashboard.xp.overall,
      capacity: dashboard.xp.category.capacity,
      engines: dashboard.xp.category.engines,
      oxygen: dashboard.xp.category.oxygen,
      meaning: dashboard.xp.category.meaning,
      optionality: dashboard.xp.category.optionality,
    })

    setSeason(dashboard.season.season)
  }, [dashboard, isDemo, navigate, fetchDashboard, addToast])

  const handleSaveClouds = async () => {
    if (isDemo) return
    setSaving('clouds')
    try {
      await Promise.all([
        cloudsApi.updateCloud('capacity', clouds.capacity),
        cloudsApi.updateCloud('engines', clouds.engines),
        cloudsApi.updateCloud('oxygen', clouds.oxygen),
        cloudsApi.updateCloud('meaning', clouds.meaning),
        cloudsApi.updateCloud('optionality', clouds.optionality),
      ])
      addToast({
        type: 'success',
        title: 'Clouds Updated',
        message: 'All cloud strengths have been updated',
      })
      fetchDashboard()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update clouds',
      })
    } finally {
      setSaving(null)
    }
  }

  const handleSaveResources = async () => {
    if (isDemo) return
    setSaving('resources')
    try {
      await adminApi.updateResources(resources)
      addToast({
        type: 'success',
        title: 'Resources Updated',
        message: 'All resources have been updated',
      })
      fetchDashboard()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update resources',
      })
    } finally {
      setSaving(null)
    }
  }

  const handleSaveXP = async () => {
    if (isDemo) return
    setSaving('xp')
    try {
      await adminApi.updateXP({
        overallXP: xp.overall,
        categoryXP: {
          capacity: xp.capacity,
          engines: xp.engines,
          oxygen: xp.oxygen,
          meaning: xp.meaning,
          optionality: xp.optionality,
        },
      })
      addToast({
        type: 'success',
        title: 'XP Updated',
        message: 'XP values have been updated and ranks recalculated',
      })
      fetchDashboard()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update XP',
      })
    } finally {
      setSaving(null)
    }
  }

  const handleSeasonTransition = async () => {
    if (isDemo) return
    setSaving('season')
    try {
      await seasonsApi.transition(season, 'Admin update')
      addToast({
        type: 'success',
        title: 'Season Updated',
        message: `Season changed to ${season}`,
      })
      fetchDashboard()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update season',
      })
    } finally {
      setSaving(null)
    }
  }

  if (isDemo) {
    return null
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-400" />
                Admin Settings
              </h1>
              <p className="text-gray-400">System data management and user preferences</p>
            </div>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clouds Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                Cloud Strengths
              </h2>
              <button
                onClick={handleSaveClouds}
                disabled={saving === 'clouds'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving === 'clouds' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
            <div className="space-y-4">
              {(['capacity', 'engines', 'oxygen', 'meaning', 'optionality'] as const).map((type) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {type}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={clouds[type]}
                      onChange={(e) => setClouds({ ...clouds, [type]: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={clouds[type]}
                      onChange={(e) =>
                        setClouds({ ...clouds, [type]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                      }
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                    />
                    <span className="text-gray-400 text-sm w-8">%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Resources
              </h2>
              <button
                onClick={handleSaveResources}
                disabled={saving === 'resources'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving === 'resources' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Oxygen (months)</label>
                <input
                  type="number"
                  step="0.01"
                  value={resources.oxygen}
                  onChange={(e) => setResources({ ...resources, oxygen: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Water (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={resources.water}
                  onChange={(e) =>
                    setResources({ ...resources, water: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gold</label>
                <input
                  type="number"
                  step="0.01"
                  value={resources.gold}
                  onChange={(e) => setResources({ ...resources, gold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Armor (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={resources.armor}
                  onChange={(e) =>
                    setResources({ ...resources, armor: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Keys</label>
                <input
                  type="number"
                  min="0"
                  value={resources.keys}
                  onChange={(e) => setResources({ ...resources, keys: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>
          </motion.div>

          {/* XP Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Experience Points (XP)
              </h2>
              <button
                onClick={handleSaveXP}
                disabled={saving === 'xp'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving === 'xp' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Overall XP</label>
                <input
                  type="number"
                  min="0"
                  value={xp.overall}
                  onChange={(e) => setXP({ ...xp, overall: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Rank and level will be recalculated</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Capacity XP</label>
                  <input
                    type="number"
                    min="0"
                    value={xp.capacity}
                    onChange={(e) => setXP({ ...xp, capacity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Engines XP</label>
                  <input
                    type="number"
                    min="0"
                    value={xp.engines}
                    onChange={(e) => setXP({ ...xp, engines: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Oxygen XP</label>
                  <input
                    type="number"
                    min="0"
                    value={xp.oxygen}
                    onChange={(e) => setXP({ ...xp, oxygen: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Meaning XP</label>
                  <input
                    type="number"
                    min="0"
                    value={xp.meaning}
                    onChange={(e) => setXP({ ...xp, meaning: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Optionality XP</label>
                  <input
                    type="number"
                    min="0"
                    value={xp.optionality}
                    onChange={(e) => setXP({ ...xp, optionality: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Season Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Season
              </h2>
              <button
                onClick={handleSeasonTransition}
                disabled={saving === 'season'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving === 'season' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as Season)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                {Object.values(Season).map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Note: Season transitions have minimum duration requirements. This is an admin override.
              </p>
            </div>
          </motion.div>
        </div>

        {/* User Settings Section */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-green-400" />
                User Settings & Preferences
              </h2>
              <button
                onClick={() => {
                  // Save user settings (placeholder - would need backend API)
                  addToast({
                    type: 'success',
                    title: 'Settings Saved',
                    message: 'Your preferences have been updated',
                  })
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={userSettings.emailNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, emailNotifications: e.target.checked })
                      }
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">System Notifications</span>
                    <input
                      type="checkbox"
                      checked={userSettings.systemNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, systemNotifications: e.target.checked })
                      }
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Display Preferences</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Entry Mode</label>
                    <select
                      value={userSettings.defaultPlane}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          defaultPlane: e.target.value as 'knowledge' | 'systems',
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="systems">Systems</option>
                      <option value="knowledge">Knowledge</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Where to land after login</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                    <select
                      value={userSettings.theme}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          theme: e.target.value as 'light' | 'dark' | 'auto',
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* System Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold">System Configuration</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select
                      value={userSettings.language}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, language: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <input
                      type="text"
                      value={userSettings.timezone}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, timezone: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="e.g., America/New_York"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current: {userSettings.timezone}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold">Account Information</h3>
                </div>
                {dashboard && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                      <p className="text-gray-300">{dashboard.user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <p className="text-gray-300">{dashboard.user.email || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Current Rank</label>
                      <p className="text-gray-300">{dashboard.user.overallRank}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Overall Level</label>
                      <p className="text-gray-300">Level {dashboard.user.overallLevel}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

