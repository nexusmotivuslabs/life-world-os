/**
 * EmergencyFundRepositoryPort
 * 
 * Port (interface) for emergency fund repository operations.
 */
import { EmergencyFund } from '../../domain/entities/EmergencyFund.js'

export interface EmergencyFundRepositoryPort {
  /**
   * Find emergency fund by user ID
   */
  findByUserId(userId: string): Promise<EmergencyFund | null>

  /**
   * Save emergency fund (create or update)
   */
  save(emergencyFund: EmergencyFund): Promise<EmergencyFund>

  /**
   * Delete emergency fund
   */
  delete(userId: string): Promise<void>
}


