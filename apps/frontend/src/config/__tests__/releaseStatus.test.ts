import { describe, it, expect } from 'vitest'
import { ReleaseStatus, isFeatureSelectable } from '../../types/release'
import {
  releaseStatuses,
  getReleaseInfo,
  getReleaseStatus,
} from '../releaseStatus'

/**
 * Release status tests ensure the app exposes the correct planes.
 * Reality Intelligence must be LIVE and selectable from the choose-plane (Available Now).
 */
describe('releaseStatus', () => {
  describe('reality (Reality Intelligence)', () => {
    it('has a reality entry so the plane appears in config', () => {
      expect(releaseStatuses.reality).toBeDefined()
      expect(releaseStatuses.reality.id).toBe('reality')
      expect(releaseStatuses.reality.name).toBe('Reality Intelligence')
    })

    it('reality is LIVE so it appears under Available Now', () => {
      expect(releaseStatuses.reality.attributes.status).toBe(ReleaseStatus.LIVE)
    })

    it('reality is selectable so users can access it from choose-plane', () => {
      const status = getReleaseStatus('reality')
      expect(status).toBe(ReleaseStatus.LIVE)
      expect(isFeatureSelectable(status!)).toBe(true)
    })

    it('getReleaseInfo returns full reality config', () => {
      const info = getReleaseInfo('reality')
      expect(info).not.toBeNull()
      expect(info!.id).toBe('reality')
      expect(info!.name).toBe('Reality Intelligence')
      expect(info!.attributes.status).toBe(ReleaseStatus.LIVE)
      expect(info!.attributes.notes).toMatch(/reality-intelligence|5173/i)
    })
  })

  describe('getReleaseInfo / getReleaseStatus', () => {
    it('returns null for unknown feature', () => {
      expect(getReleaseInfo('unknown')).toBeNull()
      expect(getReleaseStatus('unknown')).toBeNull()
    })

    it('returns status for known features', () => {
      expect(getReleaseStatus('systems')).toBe(ReleaseStatus.LIVE)
      expect(getReleaseStatus('artifacts')).toBe(ReleaseStatus.LIVE)
      expect(getReleaseStatus('knowledge')).toBe(ReleaseStatus.COMING_SOON)
    })
  })
})
