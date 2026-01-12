/**
 * Seed script for training modules and tasks
 * Run with: npx tsx src/scripts/seedTraining.ts
 */

import { PrismaClient, TrainingModuleType, OverallRank } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTraining() {
  console.log('🌱 Seeding training modules and tasks...')

  // Emergency Fund Module
  const emergencyFund = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.EMERGENCY_FUND },
    update: {},
    create: {
      type: TrainingModuleType.EMERGENCY_FUND,
      title: 'Build Emergency Fund',
      description: 'Start with 1 month, aim for 6+ months of expenses saved',
      order: 1,
      requiredRank: OverallRank.RECRUIT,
      tasks: {
        create: [
          {
            title: 'Calculate Your Monthly Expenses',
            description: 'List all your monthly expenses to determine your emergency fund target',
            instructions: `1. List all fixed expenses (rent, utilities, insurance, etc.)
2. Estimate variable expenses (food, gas, entertainment)
3. Add them together to get your monthly expense total
4. Multiply by the number of months you want to save for (start with 1 month)`,
            order: 1,
            xpReward: 10,
            categoryXP: {
              capacity: 2,
              engines: 1,
              oxygen: 6,
              meaning: 1,
              optionality: 0,
            },
          },
          {
            title: 'Open a High-Yield Savings Account',
            description: 'Set up a dedicated savings account for your emergency fund',
            instructions: `1. Research high-yield savings accounts (look for 4%+ APY)
2. Open an account at a reputable bank or credit union
3. Set up automatic transfers from your checking account
4. Make this account separate from your regular checking`,
            order: 2,
            xpReward: 15,
            categoryXP: {
              capacity: 2,
              engines: 2,
              oxygen: 9,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Save Your First Month of Expenses',
            description: 'Reach your first milestone: 1 month of expenses saved',
            instructions: `1. Set a target date (e.g., 3-6 months from now)
2. Calculate how much you need to save per paycheck
3. Set up automatic transfers
4. Track your progress monthly
5. Celebrate when you hit 1 month!`,
            order: 3,
            xpReward: 25,
            categoryXP: {
              capacity: 3,
              engines: 3,
              oxygen: 15,
              meaning: 2,
              optionality: 2,
            },
            resourceReward: {
              oxygen: 1,
            },
          },
          {
            title: 'Reach 3 Months of Expenses',
            description: 'Build a solid foundation with 3 months saved',
            instructions: `1. Continue your savings habit
2. Look for ways to increase your savings rate
3. Consider reducing non-essential expenses temporarily
4. Stay consistent with automatic transfers`,
            order: 4,
            xpReward: 40,
            categoryXP: {
              capacity: 4,
              engines: 4,
              oxygen: 24,
              meaning: 4,
              optionality: 4,
            },
            resourceReward: {
              oxygen: 2,
            },
          },
          {
            title: 'Reach 6 Months of Expenses',
            description: 'Achieve financial security with 6 months saved',
            instructions: `1. Maintain your savings momentum
2. Review and optimize your expenses
3. Consider increasing income sources
4. Once you hit 6 months, you've achieved strong financial security!`,
            order: 5,
            xpReward: 60,
            categoryXP: {
              capacity: 6,
              engines: 6,
              oxygen: 36,
              meaning: 6,
              optionality: 6,
            },
            resourceReward: {
              oxygen: 3,
              keys: 1,
            },
          },
        ],
      },
    },
  })

  // Increase Income Module
  const increaseIncome = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.INCREASE_INCOME },
    update: {},
    create: {
      type: TrainingModuleType.INCREASE_INCOME,
      title: 'Increase Income Through Engines',
      description: 'Build engines (salary, business, investments) to generate more income',
      order: 2,
      requiredRank: OverallRank.RECRUIT,
      requiredTasks: 2, // Complete 2 tasks from emergency fund first
      tasks: {
        create: [
          {
            title: 'Identify Your Current Income Sources',
            description: 'List all your current income streams',
            instructions: `1. List your primary job/salary
2. Include any side income (freelance, part-time, etc.)
3. Note any passive income (dividends, rental, etc.)
4. Calculate your total monthly income`,
            order: 1,
            xpReward: 10,
            categoryXP: {
              capacity: 1,
              engines: 7,
              oxygen: 1,
              meaning: 0,
              optionality: 1,
            },
          },
          {
            title: 'Research Salary Benchmarks',
            description: 'Find out what others in your role/industry earn',
            instructions: `1. Use sites like Glassdoor, Payscale, or LinkedIn
2. Research your role in your geographic area
3. Note the salary range (25th, 50th, 75th percentile)
4. Identify skills that command higher pay`,
            order: 2,
            xpReward: 15,
            categoryXP: {
              capacity: 2,
              engines: 10,
              oxygen: 1,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Create a Career Development Plan',
            description: 'Plan how to increase your earning potential',
            instructions: `1. Identify skills needed for higher-paying roles
2. Set learning goals (courses, certifications, etc.)
3. Create a timeline (3, 6, 12 months)
4. Identify mentors or resources to help you`,
            order: 3,
            xpReward: 25,
            categoryXP: {
              capacity: 3,
              engines: 17,
              oxygen: 2,
              meaning: 2,
              optionality: 1,
            },
          },
          {
            title: 'Start a Side Income Stream',
            description: 'Create your first additional income source',
            instructions: `1. Identify a skill you can monetize
2. Choose a platform (Upwork, Fiverr, your own website)
3. Create a simple offering
4. Make your first sale or client`,
            order: 4,
            xpReward: 40,
            categoryXP: {
              capacity: 4,
              engines: 28,
              oxygen: 4,
              meaning: 2,
              optionality: 2,
            },
            resourceReward: {
              keys: 1,
            },
          },
        ],
      },
    },
  })

  // Reduce Expenses Module
  const reduceExpenses = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.REDUCE_EXPENSES },
    update: {},
    create: {
      type: TrainingModuleType.REDUCE_EXPENSES,
      title: 'Reduce Unnecessary Expenses',
      description: 'Cut costs without reducing quality of life',
      order: 3,
      requiredRank: OverallRank.RECRUIT,
      requiredTasks: 1,
      tasks: {
        create: [
          {
            title: 'Audit Your Subscriptions',
            description: 'Review and cancel unused subscriptions',
            instructions: `1. List all your subscriptions (streaming, apps, services)
2. Identify which ones you actually use
3. Cancel unused subscriptions
4. Consider sharing family plans where possible`,
            order: 1,
            xpReward: 15,
            categoryXP: {
              capacity: 3,
              engines: 1,
              oxygen: 9,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Negotiate Bills',
            description: 'Call providers to negotiate better rates',
            instructions: `1. List bills you can negotiate (internet, phone, insurance)
2. Research competitor rates
3. Call and ask for retention deals or discounts
4. Be polite but firm`,
            order: 2,
            xpReward: 20,
            categoryXP: {
              capacity: 4,
              engines: 2,
              oxygen: 12,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Implement the 24-Hour Rule',
            description: 'Wait 24 hours before making non-essential purchases',
            instructions: `1. For any non-essential purchase over $50, wait 24 hours
2. Use this time to research alternatives
3. Ask: "Do I really need this?"
4. Most impulse purchases will be forgotten`,
            order: 3,
            xpReward: 15,
            categoryXP: {
              capacity: 3,
              engines: 1,
              oxygen: 9,
              meaning: 3,
              optionality: 0,
            },
          },
        ],
      },
    },
  })

  // Automate Savings Module
  const automateSavings = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.AUTOMATE_SAVINGS },
    update: {},
    create: {
      type: TrainingModuleType.AUTOMATE_SAVINGS,
      title: 'Automate Savings from Each Paycheck',
      description: 'Set up automatic transfers to make saving effortless',
      order: 4,
      requiredRank: OverallRank.RECRUIT,
      requiredTasks: 2,
      tasks: {
        create: [
          {
            title: 'Set Up Automatic Transfer',
            description: 'Configure automatic savings from your paycheck',
            instructions: `1. Log into your bank account
2. Set up automatic transfer for payday
3. Start with 10-20% of your income
4. Increase gradually over time`,
            order: 1,
            xpReward: 20,
            categoryXP: {
              capacity: 3,
              engines: 4,
              oxygen: 12,
              meaning: 0,
              optionality: 1,
            },
          },
          {
            title: 'Implement Pay Yourself First',
            description: 'Save before spending on anything else',
            instructions: `1. Calculate your savings target (e.g., 20% of income)
2. Set up automatic transfer on payday
3. Treat savings as a non-negotiable expense
4. Live on what remains`,
            order: 2,
            xpReward: 25,
            categoryXP: {
              capacity: 4,
              engines: 5,
              oxygen: 15,
              meaning: 1,
              optionality: 0,
            },
          },
        ],
      },
    },
  })

  // Multiple Income Streams Module
  const multipleIncome = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.MULTIPLE_INCOME_STREAMS },
    update: {},
    create: {
      type: TrainingModuleType.MULTIPLE_INCOME_STREAMS,
      title: 'Create Multiple Income Streams',
      description: 'Diversify your income sources for financial security',
      order: 5,
      requiredRank: OverallRank.PRIVATE,
      requiredTasks: 5,
      tasks: {
        create: [
          {
            title: 'Learn About Income Stream Types',
            description: 'Understand different ways to generate income',
            instructions: `1. Research active income (salary, freelance)
2. Learn about passive income (dividends, rental)
3. Explore portfolio income (stocks, bonds)
4. Identify which types fit your situation`,
            order: 1,
            xpReward: 15,
            categoryXP: {
              capacity: 2,
              engines: 9,
              oxygen: 1,
              meaning: 1,
              optionality: 2,
            },
          },
          {
            title: 'Start Your Second Income Stream',
            description: 'Add a second source of income',
            instructions: `1. Choose a type (freelance, part-time, side business)
2. Set a goal (e.g., $500/month)
3. Create a plan to achieve it
4. Take your first action step`,
            order: 2,
            xpReward: 30,
            categoryXP: {
              capacity: 3,
              engines: 18,
              oxygen: 3,
              meaning: 2,
              optionality: 4,
            },
            resourceReward: {
              keys: 1,
            },
          },
          {
            title: 'Build to 3+ Income Streams',
            description: 'Achieve true income diversification',
            instructions: `1. Maintain your existing streams
2. Add a third income source
3. Aim for mix of active and passive
4. Track all income streams monthly`,
            order: 3,
            xpReward: 50,
            categoryXP: {
              capacity: 5,
              engines: 30,
              oxygen: 5,
              meaning: 3,
              optionality: 7,
            },
            resourceReward: {
              keys: 1,
            },
          },
        ],
      },
    },
  })

  // Track Expenses Module
  const trackExpenses = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.TRACK_EXPENSES },
    update: {},
    create: {
      type: TrainingModuleType.TRACK_EXPENSES,
      title: 'Track Expenses and Identify Waste',
      description: 'Monitor spending to find opportunities to save',
      order: 6,
      requiredRank: OverallRank.RECRUIT,
      requiredTasks: 1,
      tasks: {
        create: [
          {
            title: 'Track Expenses for One Week',
            description: 'Record every expense for 7 days',
            instructions: `1. Use an app (Mint, YNAB, or spreadsheet)
2. Record every purchase, no matter how small
3. Categorize expenses (food, transport, entertainment, etc.)
4. Review at the end of the week`,
            order: 1,
            xpReward: 15,
            categoryXP: {
              capacity: 3,
              engines: 1,
              oxygen: 9,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Identify Your Top 3 Spending Categories',
            description: 'Find where most of your money goes',
            instructions: `1. Review your tracked expenses
2. Calculate spending by category
3. Identify your top 3 categories
4. Note any surprises`,
            order: 2,
            xpReward: 20,
            categoryXP: {
              capacity: 4,
              engines: 2,
              oxygen: 12,
              meaning: 1,
              optionality: 1,
            },
          },
          {
            title: 'Find One Wasteful Expense to Eliminate',
            description: 'Identify and cut one unnecessary expense',
            instructions: `1. Review your spending categories
2. Find one expense that doesn't add value
3. Create a plan to eliminate it
4. Execute and track the savings`,
            order: 3,
            xpReward: 25,
            categoryXP: {
              capacity: 5,
              engines: 2,
              oxygen: 15,
              meaning: 2,
              optionality: 1,
            },
          },
        ],
      },
    },
  })

  // Avoid Lifestyle Inflation Module
  const avoidInflation = await prisma.trainingModule.upsert({
    where: { type: TrainingModuleType.AVOID_LIFESTYLE_INFLATION },
    update: {},
    create: {
      type: TrainingModuleType.AVOID_LIFESTYLE_INFLATION,
      title: 'Avoid Lifestyle Inflation',
      description: 'Resist the urge to increase spending as income grows',
      order: 7,
      requiredRank: OverallRank.PRIVATE,
      requiredTasks: 8,
      tasks: {
        create: [
          {
            title: 'Understand Lifestyle Inflation',
            description: 'Learn what lifestyle inflation is and why it happens',
            instructions: `1. Research lifestyle inflation (spending more as income grows)
2. Understand why it's harmful to wealth building
3. Identify examples in your own life
4. Commit to avoiding it`,
            order: 1,
            xpReward: 15,
            categoryXP: {
              capacity: 3,
              engines: 1,
              oxygen: 9,
              meaning: 2,
              optionality: 0,
            },
          },
          {
            title: 'Create a Spending Cap',
            description: 'Set a maximum monthly spending limit',
            instructions: `1. Calculate your current monthly spending
2. Set a cap (e.g., current spending + 10% max)
3. Commit to not exceeding it even as income grows
4. Review and adjust quarterly`,
            order: 2,
            xpReward: 25,
            categoryXP: {
              capacity: 5,
              engines: 2,
              oxygen: 15,
              meaning: 4,
              optionality: 0,
            },
          },
          {
            title: 'Bank Your Raises',
            description: 'Save 50%+ of any income increases',
            instructions: `1. When you get a raise, calculate the increase
2. Commit to saving at least 50% of the raise
3. Increase your automatic savings by that amount
4. Keep your lifestyle the same`,
            order: 3,
            xpReward: 30,
            categoryXP: {
              capacity: 6,
              engines: 3,
              oxygen: 18,
              meaning: 2,
              optionality: 1,
            },
            resourceReward: {
              oxygen: 0.5,
            },
          },
        ],
      },
    },
  })

  console.log('✅ Training modules and tasks seeded successfully!')
  console.log(`   - ${emergencyFund.title}`)
  console.log(`   - ${increaseIncome.title}`)
  console.log(`   - ${reduceExpenses.title}`)
  console.log(`   - ${automateSavings.title}`)
  console.log(`   - ${multipleIncome.title}`)
  console.log(`   - ${trackExpenses.title}`)
  console.log(`   - ${avoidInflation.title}`)
}

seedTraining()
  .catch((e) => {
    console.error('Error seeding training:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





