/**
 * Seed script for Bible Laws - Multiple Domains
 * 
 * This script seeds biblical principles and teachings as they apply to different domains.
 * Run with: npx tsx src/scripts/seedBibleLaws.ts
 */

import { PrismaClient, BibleLawDomain } from '@prisma/client'
import { moneyDomainBibleLaws } from './bibleLawsData.js'
import { investmentDomainBibleLaws } from './bibleLawsInvestmentData.js'
import { energyDomainBibleLaws } from './energyBibleLawsData.js'

const prisma = new PrismaClient()

async function seedDomain(domain: BibleLawDomain, laws: typeof moneyDomainBibleLaws, domainName: string) {
  console.log(`\n🌱 Seeding Bible Laws for ${domainName} Domain...`)

  for (const law of laws) {
    await prisma.bibleLaw.upsert({
      where: {
        domain_lawNumber: {
          domain: domain,
          lawNumber: law.lawNumber,
        },
      },
      update: {
        title: law.title,
        scriptureReference: law.scriptureReference,
        originalText: law.originalText,
        domainApplication: law.domainApplication,
        category: 'BIBLICAL', // All Bible Laws are in BIBLICAL category
        principles: law.principles as any,
        practicalApplications: law.practicalApplications as any,
        examples: law.examples as any,
        warnings: law.warnings as any,
        relatedVerses: law.relatedVerses as any,
        order: law.order,
      },
      create: {
        lawNumber: law.lawNumber,
        title: law.title,
        scriptureReference: law.scriptureReference,
        originalText: law.originalText,
        domain: domain,
        domainApplication: law.domainApplication,
        category: 'BIBLICAL', // All Bible Laws are in BIBLICAL category
        principles: law.principles as any,
        practicalApplications: law.practicalApplications as any,
        examples: law.examples as any,
        warnings: law.warnings as any,
        relatedVerses: law.relatedVerses as any,
        order: law.order,
      },
    })
    console.log(`✅ Seeded Bible Law ${law.lawNumber}: ${law.title} (${law.scriptureReference})`)
  }

  console.log(`✅ ${domainName} Domain: ${laws.length} Bible laws seeded.`)
}

async function main() {
  await seedDomain(BibleLawDomain.MONEY, moneyDomainBibleLaws, 'Money')
  await seedDomain(BibleLawDomain.INVESTMENT, investmentDomainBibleLaws, 'Investment')
  await seedDomain(BibleLawDomain.ENERGY, energyDomainBibleLaws, 'Energy')

  const totalLaws = moneyDomainBibleLaws.length + investmentDomainBibleLaws.length + energyDomainBibleLaws.length
  console.log(`\n✨ Seeding complete! ${totalLaws} total Bible laws seeded across domains.`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Bible laws:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

