/**
 * Loadout API Client
 */

import { request } from './api'
import {
  Loadout,
  LoadoutItem,
  LoadoutSlotType,
  PowerLevelBreakdown,
  CreateLoadoutInput,
  UpdateLoadoutInput,
} from '../types/loadout'

const BASE_URL = '/api/loadouts'

export const loadoutApi = {
  /**
   * Get all loadouts for the current user
   */
  getLoadouts: async (): Promise<Loadout[]> => {
    return request<Loadout[]>(BASE_URL)
  },

  /**
   * Get active loadout
   */
  getActiveLoadout: async (): Promise<Loadout | null> => {
    try {
      return await request<Loadout>(`${BASE_URL}/active`)
    } catch (error: any) {
      if (error?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get a single loadout by ID
   */
  getLoadout: async (id: string): Promise<Loadout> => {
    return request<Loadout>(`${BASE_URL}/${id}`)
  },

  /**
   * Get available loadout items
   */
  getLoadoutItems: async (slotType?: LoadoutSlotType): Promise<LoadoutItem[]> => {
    const url = slotType
      ? `${BASE_URL}/items?slotType=${slotType}`
      : `${BASE_URL}/items`
    return request<LoadoutItem[]>(url)
  },

  /**
   * Calculate power level for a loadout
   */
  getPowerLevel: async (id: string): Promise<PowerLevelBreakdown> => {
    return request<PowerLevelBreakdown>(`${BASE_URL}/${id}/power-level`)
  },

  /**
   * Create a new loadout
   */
  createLoadout: async (data: CreateLoadoutInput): Promise<Loadout> => {
    return request<Loadout>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update a loadout
   */
  updateLoadout: async (id: string, data: UpdateLoadoutInput): Promise<Loadout> => {
    return request<Loadout>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Activate a loadout
   */
  activateLoadout: async (id: string): Promise<Loadout> => {
    return request<Loadout>(`${BASE_URL}/${id}/activate`, {
      method: 'PUT',
    })
  },

  /**
   * Delete a loadout
   */
  deleteLoadout: async (id: string): Promise<void> => {
    return request<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    })
  },
}





