/**
 * EmergencyFundRepositoryAdapter
 * 
 * Infrastructure adapter for storing/retrieving emergency fund data via UserFinancialData.
 */
import { PrismaClient, UserFinancialDataType } from '@prisma/client'
import { EmergencyFund } from '../../../domain/entities/EmergencyFund.js'
import { EmergencyFundRepositoryPort } from '../../../application/ports/EmergencyFundRepositoryPort.js'
import { EmergencyFundProgress } from '../../../domain/entities/EmergencyFund.js'

export class EmergencyFundRepositoryAdapter implements EmergencyFundRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<EmergencyFund | null> {
    const data = await this.prisma.userFinancialData.findFirst({
      where: {
        userId,
        dataType: UserFinancialDataType.EMERGENCY_FUND,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!data) {
      return null
    }

    // Decrypt data (in production, use proper encryption/decryption)
    // For now, we'll assume the data is stored in metadata as JSON
    const decryptedData = data.metadata as {
      id: string
      targetAmount: number
      monthsCoverage: number
      monthlyExpenses: number
      currentAmount: number
      progressHistory?: EmergencyFundProgress[]
    }

    return EmergencyFund.fromPersistence({
      id: decryptedData.id,
      userId,
      targetAmount: decryptedData.targetAmount,
      monthsCoverage: decryptedData.monthsCoverage,
      monthlyExpenses: decryptedData.monthlyExpenses,
      currentAmount: decryptedData.currentAmount,
      progressHistory: decryptedData.progressHistory?.map(p => ({
        ...p,
        date: new Date(p.date),
      })),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  async save(emergencyFund: EmergencyFund): Promise<EmergencyFund> {
    // Store data in metadata (in production, encrypt before storing in encryptedData)
    const metadata = {
      id: emergencyFund.id,
      targetAmount: emergencyFund.goal.targetAmount,
      monthsCoverage: emergencyFund.goal.monthsCoverage,
      monthlyExpenses: emergencyFund.goal.monthlyExpenses,
      currentAmount: emergencyFund.currentAmount,
      progressHistory: emergencyFund.progressHistory,
    }

    // Find existing record or create new
    const existing = await this.prisma.userFinancialData.findFirst({
      where: {
        userId: emergencyFund.userId,
        dataType: UserFinancialDataType.EMERGENCY_FUND,
      },
    })

    if (existing) {
      await this.prisma.userFinancialData.update({
        where: { id: existing.id },
        data: {
          metadata: metadata as any,
          updatedAt: new Date(),
          // In production, encrypt the data and store in encryptedData
          encryptedData: JSON.stringify(metadata),
        },
      })
    } else {
      await this.prisma.userFinancialData.create({
        data: {
          userId: emergencyFund.userId,
          dataType: UserFinancialDataType.EMERGENCY_FUND,
          encryptedData: JSON.stringify(metadata),
          encryptionKeyId: 'default', // In production, use proper key management
          metadata: metadata as any,
        },
      })
    }

    return emergencyFund
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.userFinancialData.deleteMany({
      where: {
        userId,
        dataType: UserFinancialDataType.EMERGENCY_FUND,
      },
    })
  }
}


