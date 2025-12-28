/**
 * Seed script for 48 Laws of Power - Multiple Domains
 * 
 * This script seeds all 48 laws of power as they apply to different domains.
 * Run with: npx tsx src/scripts/seedPowerLaws.ts
 */

import { PrismaClient, PowerLawDomain } from '@prisma/client'
import { moneyDomainPowerLaws } from './powerLawsData.js'
import { energyDomainPowerLaws } from './energyPowerLawsData.js'

const prisma = new PrismaClient()

async function seedDomain(domain: PowerLawDomain, laws: typeof moneyDomainPowerLaws, domainName: string) {
  console.log(`\n🌱 Seeding 48 Laws of Power for ${domainName} Domain...`)

  for (const law of laws) {
    await prisma.powerLaw.upsert({
      where: {
        domain_lawNumber: {
          domain: domain,
          lawNumber: law.lawNumber,
        },
      },
      update: {
        title: law.title,
        originalDescription: law.originalDescription,
        domainApplication: law.domainApplication,
        category: 'POWER', // All 48 Laws of Power are in POWER category
        strategies: law.strategies as any,
        examples: law.examples as any,
        warnings: law.warnings as any,
        counterStrategies: law.counterStrategies as any,
        order: law.order,
      },
      create: {
        lawNumber: law.lawNumber,
        title: law.title,
        originalDescription: law.originalDescription,
        domain: domain,
        domainApplication: law.domainApplication,
        category: 'POWER', // All 48 Laws of Power are in POWER category
        strategies: law.strategies as any,
        examples: law.examples as any,
        warnings: law.warnings as any,
        counterStrategies: law.counterStrategies as any,
        order: law.order,
      },
    })
    console.log(`✅ Seeded Law ${law.lawNumber}: ${law.title}`)
  }

  console.log(`✨ ${domainName} Domain: ${laws.length} laws seeded.`)
}

async function main() {
  await seedDomain(PowerLawDomain.MONEY, moneyDomainPowerLaws, 'Money')
  await seedDomain(PowerLawDomain.ENERGY, energyDomainPowerLaws, 'Energy')

  const totalLaws = moneyDomainPowerLaws.length + energyDomainPowerLaws.length
  console.log(`\n🎉 Seeding complete! ${totalLaws} total laws seeded across domains.`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding power laws:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
