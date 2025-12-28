/**
 * SaveArtifactButton Component
 * 
 * Button component for saving recommendations and artifacts from products.
 */

import { useState } from 'react'
import { Save, Check, Loader2 } from 'lucide-react'
import { artifactApi, SaveArtifactInput } from '../services/artifactApi'
import { useToastStore } from '../store/useToastStore'

interface SaveArtifactButtonProps {
  productId?: string
  productName: string
  type: SaveArtifactInput['type']
  title: string
  data: any
  description?: string
  tags?: string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SaveArtifactButton({
  productId,
  productName,
  type,
  title,
  data,
  description,
  tags,
  className = '',
  size = 'md',
}: SaveArtifactButtonProps) {
  const { addToast } = useToastStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // TODO: Get userId from auth context
      const userId = 'demo-user-id'

      await artifactApi.save({
        userId,
        productId,
        productName,
        type,
        title,
        data,
        description,
        tags,
      })

      setSaved(true)
      addToast({
        type: 'success',
        title: 'Saved!',
        message: 'Recommendation saved to your artifacts',
      })

      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to save artifact'
      
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`
        inline-flex items-center gap-2
        ${sizeClasses[size]}
        ${saved
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        rounded-md font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {saving ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>Saving...</span>
        </>
      ) : saved ? (
        <>
          <Check className={iconSizes[size]} />
          <span>Saved!</span>
        </>
      ) : (
        <>
          <Save className={iconSizes[size]} />
          <span>Save</span>
        </>
      )}
    </button>
  )
}


