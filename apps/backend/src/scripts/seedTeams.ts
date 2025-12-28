/**
 * Seed Teams Script
 * 
 * Populates the database with domain teams, assigns agents to teams,
 * creates team guides, and creates team products.
 */

import { PrismaClient, TeamDomain, TeamAgentRole, TeamProductType, GuideCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding teams, team agents, guides, and products...')

  // Get or create Nexus Motivus organization (owns all products)
  const nexusMotivus = await prisma.organization.upsert({
    where: { id: 'nexus-motivus-org-id' },
    update: {},
    create: {
      id: 'nexus-motivus-org-id',
      name: 'Nexus Motivus',
      description: 'Master Money System - Product Development Organization',
      isActive: true,
    },
  })
  console.log(`✅ Organization: ${nexusMotivus.name}`)

  // Get all agents
  const agents = await prisma.agent.findMany()

  const agentMap = new Map(agents.map(a => [a.type, a]))

  const teams = [
    {
      domain: TeamDomain.INVESTMENT,
      name: 'Investment Team',
      description: 'Expert team focused on investment strategies and portfolio management',
      icon: '📈',
      order: 1,
      leadAgentType: 'INVESTOR' as const,
      agentRoles: [
        { type: 'INVESTOR' as const, role: TeamAgentRole.LEAD },
        { type: 'TAX_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'FINANCIAL_ADVISOR' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Build Tax-Optimized Investment Portfolio',
          description: 'Create an investment portfolio that maximizes returns while minimizing tax impact',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 4,
          estimatedTime: 90,
          steps: [
            {
              id: '1',
              title: 'Understand Tax-Advantaged Accounts',
              description: 'Learn about tax-advantaged investment accounts',
              instructions: 'Research 401(k), IRA, Roth IRA, and other tax-advantaged options',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Develop Asset Location Strategy',
              description: 'Place investments in optimal account types',
              instructions: 'Allocate tax-efficient investments to taxable accounts and tax-inefficient to tax-advantaged accounts',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Implement Strategy',
              description: 'Execute your tax-optimized portfolio',
              instructions: 'Open accounts and make investments according to your asset location strategy',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Portfolio Tracker & Analyzer',
          description: 'Track investment performance across all accounts, analyze asset allocation, calculate total returns',
          type: TeamProductType.ANALYZER,
          icon: '📊',
          order: 1,
          url: '/products/portfolio-tracker', // Internal route within the app
          accessUrl: '/master-money/products/portfolio-tracker', // User-facing route
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Performance Tracking', description: 'Track returns across all investments', enabled: true },
            { name: 'Asset Allocation', description: 'Visualize and analyze asset allocation', enabled: true },
            { name: 'Tax Analysis', description: 'Analyze tax implications of investments', enabled: true },
          ],
          integrationPoints: [
            { system: 'Investments', dataType: 'portfolio', direction: 'read' as const },
          ],
        },
        {
          name: 'ROI Calculator',
          description: 'Calculate return on investment for different assets and compare options',
          type: TeamProductType.CALCULATOR,
          icon: '🧮',
          order: 2,
          url: '/products/roi-calculator', // Internal route within the app
          accessUrl: '/master-money/products/roi-calculator', // User-facing route
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'ROI Calculation', description: 'Calculate ROI for investments', enabled: true },
            { name: 'Comparison', description: 'Compare multiple investment options', enabled: true },
          ],
          integrationPoints: [
            { system: 'Investments', dataType: 'investment_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.TAX_OPTIMIZATION,
      name: 'Tax Optimization Team',
      description: 'Specialized team for tax planning and optimization strategies',
      icon: '🧾',
      order: 2,
      leadAgentType: 'TAX_STRATEGIST' as const,
      agentRoles: [
        { type: 'TAX_STRATEGIST' as const, role: TeamAgentRole.LEAD },
        { type: 'ACCOUNTANT' as const, role: TeamAgentRole.MEMBER },
        { type: 'BOOKKEEPER' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Complete Tax Strategy Overhaul',
          description: 'Comprehensive guide to optimizing your entire tax strategy',
          category: GuideCategory.TAX_PLANNING,
          difficulty: 5,
          estimatedTime: 120,
          steps: [
            {
              id: '1',
              title: 'Tax Situation Assessment',
              description: 'Comprehensive review of current tax situation',
              instructions: 'Analyze current tax returns, deductions, and tax burden',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Identify Optimization Opportunities',
              description: 'Find areas for tax improvement',
              instructions: 'Review deductions, credits, and tax-advantaged strategies',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Implement Tax Strategy',
              description: 'Execute tax optimization plan',
              instructions: 'Implement deductions, credits, and tax-efficient strategies',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Tax Calculator & Estimator',
          description: 'Estimate tax liability and optimize tax brackets',
          type: TeamProductType.CALCULATOR,
          icon: '🧮',
          order: 1,
          features: [
            { name: 'Tax Estimation', description: 'Estimate current year tax liability', enabled: true },
            { name: 'Bracket Optimization', description: 'Optimize tax bracket placement', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'income', direction: 'read' as const },
            { system: 'Engines', dataType: 'income', direction: 'read' as const },
          ],
        },
        {
          name: 'Deduction Tracker',
          description: 'Track all deductions throughout the year with categorization',
          type: TeamProductType.TRACKER,
          icon: '📝',
          order: 2,
          features: [
            { name: 'Expense Tracking', description: 'Track deductible expenses', enabled: true },
            { name: 'Categorization', description: 'Categorize expenses for tax purposes', enabled: true },
            { name: 'Documentation', description: 'Store receipts and documentation', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'expenses', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.CASH_FLOW,
      name: 'Cash Flow Team',
      description: 'Team focused on monthly cash flow and liquidity management',
      icon: '💸',
      order: 3,
      leadAgentType: 'CASH_FLOW_SPECIALIST' as const,
      agentRoles: [
        { type: 'CASH_FLOW_SPECIALIST' as const, role: TeamAgentRole.LEAD },
        { type: 'DEBT_SPECIALIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'BOOKKEEPER' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Optimize Monthly Cash Flow & Manage Debt',
          description: 'Comprehensive guide to improving cash flow while managing debt effectively',
          category: GuideCategory.CASH_FLOW_MANAGEMENT,
          difficulty: 3,
          estimatedTime: 75,
          steps: [
            {
              id: '1',
              title: 'Analyze Cash Flow',
              description: 'Understand current income and expenses',
              instructions: 'Track all income and expenses for one month',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Identify Improvements',
              description: 'Find opportunities to increase income and reduce expenses',
              instructions: 'Review expenses and identify reduction opportunities',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Debt Strategy',
              description: 'Develop debt payoff strategy',
              instructions: 'Create plan for paying off debt while improving cash flow',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Budget Builder & Tracker',
          description: 'Create personalized budgets and track spending',
          type: TeamProductType.TRACKER,
          icon: '📊',
          order: 1,
          features: [
            { name: 'Budget Creation', description: 'Create budgets by category', enabled: true },
            { name: 'Spending Tracking', description: 'Track spending against budget', enabled: true },
            { name: 'Alerts', description: 'Get alerts for overspending', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'expenses', direction: 'read' as const },
          ],
        },
        {
          name: 'Cash Flow Analyzer',
          description: 'Track income vs expenses and visualize cash flow trends',
          type: TeamProductType.ANALYZER,
          icon: '📈',
          order: 2,
          features: [
            { name: 'Cash Flow Tracking', description: 'Track income vs expenses', enabled: true },
            { name: 'Trend Visualization', description: 'Visualize cash flow over time', enabled: true },
            { name: 'Forecasting', description: 'Forecast future cash flow', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'gold', direction: 'read' as const },
            { system: 'Engines', dataType: 'income', direction: 'read' as const },
          ],
        },
        {
          name: 'Emergency Fund Tracker',
          description: 'Set emergency fund goals, track progress, calculate required amount based on expenses',
          type: TeamProductType.TRACKER,
          icon: '🛡️',
          order: 3,
          features: [
            { name: 'Goal Setting', description: 'Set emergency fund goals', enabled: true },
            { name: 'Progress Tracking', description: 'Track progress toward goal', enabled: true },
            { name: 'Calculation', description: 'Calculate required amount based on expenses', enabled: true },
            { name: 'Health Monitoring', description: 'Monitor fund health', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'oxygen', direction: 'read' as const },
            { system: 'Resources', dataType: 'expenses', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.BUSINESS_ADVISORY,
      name: 'Business Advisory Team',
      description: 'Team focused on business development and income streams',
      icon: '🏢',
      order: 4,
      leadAgentType: 'FINANCIAL_ADVISOR' as const,
      agentRoles: [
        { type: 'FINANCIAL_ADVISOR' as const, role: TeamAgentRole.LEAD },
        { type: 'ACCOUNTANT' as const, role: TeamAgentRole.MEMBER },
        { type: 'BOOKKEEPER' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Start Your Business with Proper Structure',
          description: 'Guide to starting a business with optimal legal and financial structure',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 4,
          estimatedTime: 90,
          steps: [
            {
              id: '1',
              title: 'Choose Business Structure',
              description: 'Select appropriate legal structure (LLC, S-Corp, etc.)',
              instructions: 'Research and choose business structure based on your goals',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Set Up Business Accounts',
              description: 'Open business bank accounts and set up accounting',
              instructions: 'Open business bank account and set up bookkeeping system',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Develop Business Plan',
              description: 'Create comprehensive business plan',
              instructions: 'Develop business plan with financial projections',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Income Stream Tracker',
          description: 'Track multiple income sources and analyze diversification',
          type: TeamProductType.TRACKER,
          icon: '💰',
          order: 1,
          features: [
            { name: 'Income Tracking', description: 'Track all income sources', enabled: true },
            { name: 'Diversification Analysis', description: 'Analyze income diversification', enabled: true },
          ],
          integrationPoints: [
            { system: 'Engines', dataType: 'income', direction: 'read' as const },
          ],
        },
        {
          name: 'Business Financial Dashboard',
          description: 'Track business revenue, expenses, and performance metrics',
          type: TeamProductType.DASHBOARD,
          icon: '📊',
          order: 2,
          features: [
            { name: 'Revenue Tracking', description: 'Track business revenue', enabled: true },
            { name: 'Expense Tracking', description: 'Track business expenses', enabled: true },
            { name: 'Profit Analysis', description: 'Calculate profit margins', enabled: true },
          ],
          integrationPoints: [
            { system: 'Engines', dataType: 'business_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.COMPREHENSIVE_PLANNING,
      name: 'Comprehensive Planning Team',
      description: 'Full financial planning across all areas',
      icon: '🎯',
      order: 5,
      leadAgentType: 'FINANCIAL_ADVISOR' as const,
      agentRoles: [
        { type: 'FINANCIAL_ADVISOR' as const, role: TeamAgentRole.LEAD },
        { type: 'INVESTOR' as const, role: TeamAgentRole.MEMBER },
        { type: 'TAX_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'ACCOUNTANT' as const, role: TeamAgentRole.MEMBER },
        { type: 'CASH_FLOW_SPECIALIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'DEBT_SPECIALIST' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Create Your 5-Year Financial Plan',
          description: 'Comprehensive financial planning guide covering all areas',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 5,
          estimatedTime: 180,
          steps: [
            {
              id: '1',
              title: 'Define Financial Goals',
              description: 'Establish short and long-term financial goals',
              instructions: 'List and prioritize financial goals for next 5 years',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Current Financial Assessment',
              description: 'Assess current financial situation',
              instructions: 'Analyze current assets, liabilities, income, and expenses',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Develop Comprehensive Plan',
              description: 'Create integrated financial plan',
              instructions: 'Develop plan covering investments, taxes, cash flow, and debt',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Implement and Monitor',
              description: 'Execute plan and establish monitoring',
              instructions: 'Begin implementing plan and set up regular review schedule',
              isOptional: false,
              order: 3,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Financial Planning Dashboard',
          description: 'Unified view of all financial areas with goal tracking',
          type: TeamProductType.DASHBOARD,
          icon: '📊',
          order: 1,
          features: [
            { name: 'Unified View', description: 'View all financial areas in one place', enabled: true },
            { name: 'Goal Tracking', description: 'Track progress toward financial goals', enabled: true },
            { name: 'Scenario Planning', description: 'Plan different financial scenarios', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'all', direction: 'read' as const },
            { system: 'Investments', dataType: 'all', direction: 'read' as const },
            { system: 'Engines', dataType: 'all', direction: 'read' as const },
          ],
        },
        {
          name: 'Net Worth Calculator',
          description: 'Track total assets and liabilities, calculate net worth over time',
          type: TeamProductType.CALCULATOR,
          icon: '💎',
          order: 2,
          features: [
            { name: 'Asset Tracking', description: 'Track all assets', enabled: true },
            { name: 'Liability Tracking', description: 'Track all liabilities', enabled: true },
            { name: 'Net Worth Calculation', description: 'Calculate net worth', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'all', direction: 'read' as const },
            { system: 'Investments', dataType: 'all', direction: 'read' as const },
          ],
        },
        {
          name: 'Retirement Planner',
          description: 'Calculate retirement savings needs and project retirement income',
          type: TeamProductType.PLANNER,
          icon: '🏖️',
          order: 3,
          features: [
            { name: 'Retirement Calculation', description: 'Calculate retirement savings needs', enabled: true },
            { name: 'Income Projection', description: 'Project retirement income', enabled: true },
            { name: 'Savings Analysis', description: 'Analyze savings rate', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'gold', direction: 'read' as const },
            { system: 'Investments', dataType: 'portfolio', direction: 'read' as const },
          ],
        },
        {
          name: 'Financial Health Score',
          description: 'Comprehensive financial health assessment',
          type: TeamProductType.ANALYZER,
          icon: '❤️',
          order: 4,
          features: [
            { name: 'Health Assessment', description: 'Assess overall financial health', enabled: true },
            { name: 'Strength Analysis', description: 'Identify strengths and weaknesses', enabled: true },
            { name: 'Recommendations', description: 'Receive personalized recommendations', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'all', direction: 'read' as const },
            { system: 'Investments', dataType: 'all', direction: 'read' as const },
          ],
        },
        {
          name: 'Savings Goal Tracker',
          description: 'Set multiple savings goals and track progress',
          type: TeamProductType.TRACKER,
          icon: '🎯',
          order: 5,
          features: [
            { name: 'Goal Setting', description: 'Set multiple savings goals', enabled: true },
            { name: 'Progress Tracking', description: 'Track progress toward goals', enabled: true },
            { name: 'Monthly Savings', description: 'Calculate required monthly savings', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'gold', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.DEBT_MANAGEMENT,
      name: 'Debt Management Team',
      description: 'Team focused on debt reduction and optimization',
      icon: '💳',
      order: 6,
      leadAgentType: 'DEBT_SPECIALIST' as const,
      agentRoles: [
        { type: 'DEBT_SPECIALIST' as const, role: TeamAgentRole.LEAD },
        { type: 'CASH_FLOW_SPECIALIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'FINANCIAL_ADVISOR' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Complete Debt Elimination Plan',
          description: 'Comprehensive strategy to eliminate all debt',
          category: GuideCategory.DEBT_MANAGEMENT,
          difficulty: 4,
          estimatedTime: 90,
          steps: [
            {
              id: '1',
              title: 'Debt Inventory',
              description: 'List all debts with details',
              instructions: 'Compile complete list of all debts with balances, rates, and minimums',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Choose Payoff Strategy',
              description: 'Select optimal debt payoff method',
              instructions: 'Compare snowball, avalanche, and hybrid strategies',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Create Payment Plan',
              description: 'Develop detailed payment schedule',
              instructions: 'Calculate payment amounts and timeline for debt elimination',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Debt Payoff Calculator',
          description: 'Calculate optimal payoff strategies and compare methods',
          type: TeamProductType.CALCULATOR,
          icon: '🧮',
          order: 1,
          features: [
            { name: 'Strategy Comparison', description: 'Compare payoff strategies', enabled: true },
            { name: 'Timeline Estimation', description: 'Estimate payoff timelines', enabled: true },
            { name: 'Interest Savings', description: 'Calculate interest savings', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'debt', direction: 'read' as const },
          ],
        },
        {
          name: 'Debt Tracker',
          description: 'Track all debts in one place and monitor progress',
          type: TeamProductType.TRACKER,
          icon: '📊',
          order: 2,
          features: [
            { name: 'Debt Tracking', description: 'Track all debts', enabled: true },
            { name: 'Progress Monitoring', description: 'Monitor payoff progress', enabled: true },
            { name: 'Payment Reminders', description: 'Get payment reminders', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'debt', direction: 'read' as const },
          ],
        },
        {
          name: 'Credit Score Monitor',
          description: 'Track credit score changes and receive improvement recommendations',
          type: TeamProductType.TRACKER,
          icon: '📈',
          order: 3,
          features: [
            { name: 'Score Tracking', description: 'Track credit score over time', enabled: true },
            { name: 'Factor Analysis', description: 'Understand factors affecting credit', enabled: true },
            { name: 'Recommendations', description: 'Receive improvement recommendations', enabled: true },
          ],
          integrationPoints: [
            { system: 'Resources', dataType: 'credit_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.PLATFORM_ENGINEERING,
      name: 'Platform Engineering Team',
      description: 'Team covering all areas of a healthy digital system - From security to release following Google\'s practices',
      icon: '🛡️',
      order: 8,
      leadAgentType: 'SECURITY_SPECIALIST' as const,
      agentRoles: [
        { type: 'SECURITY_SPECIALIST' as const, role: TeamAgentRole.LEAD },
      ],
      guides: [
        {
          title: 'Secure Product Deployment Pipeline',
          description: 'Build secure CI/CD pipelines following Google SRE practices',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 5,
          estimatedTime: 120,
          steps: [
            {
              id: '1',
              title: 'Security in CI/CD',
              description: 'Integrate security scanning into deployment pipeline',
              instructions: 'Add security scanning: SAST, DAST, dependency scanning, and secrets detection in CI/CD pipeline.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Infrastructure as Code Security',
              description: 'Secure infrastructure deployment',
              instructions: 'Use Infrastructure as Code (Terraform, CloudFormation) with security best practices. Review infrastructure changes.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Secure Release Process',
              description: 'Implement secure release procedures',
              instructions: 'Establish secure release process: code review, security review, testing, staging deployment, and production deployment with rollback capability.',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [], // Platform Engineering products will be added separately
    },
    {
      domain: TeamDomain.CORE_MONEY_SYSTEM,
      name: 'Core Money System Team',
      description: 'Core team responsible for canonical money system pillars, Money OS reports, and foundational financial intelligence',
      icon: '💰',
      order: 7,
      leadAgentType: 'FINANCIAL_ADVISOR' as const,
      agentRoles: [
        { type: 'FINANCIAL_ADVISOR' as const, role: TeamAgentRole.LEAD },
        { type: 'INVESTOR' as const, role: TeamAgentRole.MEMBER },
        { type: 'TAX_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Module 1: Fixed Income',
          description: 'How money produces predictable cashflow',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 3,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Fixed Income',
              description: 'Fixed Income exists to produce predictable cashflow',
              instructions: 'Learn that Fixed Income serves the role of generating predictable cashflow. This is its primary job, not a product list. Start with purpose, not assets.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Fixed Income with Other Pillars',
              description: 'See how Fixed Income compares to Growth, Commodities, Real Assets, Liquidity, and Speculation',
              instructions: 'Review the role comparison table. Compare Fixed Income vs Growth vs Commodities vs Real Assets - each answers a different problem. Never compare bonds vs stocks randomly.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Fixed Income = Oxygen',
              description: 'Fixed Income is like oxygen - essential for survival, predictable, but doesn\'t build wealth alone',
              instructions: 'Understand the metaphor: Fixed Income = Oxygen. It provides stability and predictability, but you need other pillars for growth.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Fixed Income Fails',
              description: 'Learn the failure modes of Fixed Income',
              instructions: 'Fixed Income fails in high inflation, fails if rates rise after locking, and fails to build wealth alone. Understanding failure modes prevents misuse.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Fixed Income',
              instructions: 'Decision rule: If you need monthly cashflow, use Fixed Income. If time horizon is long, prioritize Growth instead.',
              isOptional: false,
              order: 4,
            },
          ],
        },
        {
          title: 'Module 2: Growth',
          description: 'Why volatility is required for multiplication',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 3,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Growth',
              description: 'Growth exists for capital expansion',
              instructions: 'Learn that Growth serves the role of capital expansion. This is its primary job - multiplication over time.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Growth with Other Pillars',
              description: 'See how Growth compares to Fixed Income, Commodities, Real Assets, Liquidity, and Speculation',
              instructions: 'Review the role comparison table. Growth sacrifices income for upside. Compare Growth vs Income vs Commodities - each serves different needs.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Growth = Engine',
              description: 'Growth is like an engine - requires fuel (capital), produces power (returns), but needs maintenance (time)',
              instructions: 'Understand the metaphor: Growth = Engine. It multiplies capital over time, but requires patience and time horizon.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Growth Fails',
              description: 'Learn the failure modes of Growth',
              instructions: 'Growth fails if time horizon is too short, fails during market crashes if you panic, and fails if you need immediate income.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Growth',
              instructions: 'Decision rule: If time horizon is long (10+ years), prioritize Growth. If you need monthly cashflow, use Fixed Income instead.',
              isOptional: false,
              order: 4,
            },
          ],
        },
        {
          title: 'Module 3: Commodities',
          description: 'Why inflation destroys naive systems',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 3,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Commodities',
              description: 'Commodities exist as an inflation hedge',
              instructions: 'Learn that Commodities serve the role of hedging against inflation. This is their primary job - protecting purchasing power.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Commodities with Other Pillars',
              description: 'See how Commodities compare to Fixed Income, Growth, Real Assets, Liquidity, and Speculation',
              instructions: 'Review the role comparison table. Commodities have high inflation protection but no cashflow. Compare with Real Assets which also hedge inflation but provide income.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Commodities = Shield',
              description: 'Commodities are like a shield - protect against inflation attacks, but don\'t generate income',
              instructions: 'Understand the metaphor: Commodities = Shield. They protect purchasing power during inflation, but provide no cashflow.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Commodities Fail',
              description: 'Learn the failure modes of Commodities',
              instructions: 'Commodities fail in deflationary periods, fail to generate income, and fail if you need cashflow. They are purely defensive.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Commodities',
              instructions: 'Decision rule: If inflation is rising, Commodities matter. If you need income, use Real Assets or Fixed Income instead.',
              isOptional: false,
              order: 4,
            },
          ],
        },
        {
          title: 'Module 4: Real Assets',
          description: 'Why rent beats interest in inflationary regimes',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 3,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Real Assets',
              description: 'Real Assets exist for income + inflation protection',
              instructions: 'Learn that Real Assets serve the role of providing both income and inflation protection. This is their unique advantage.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Real Assets with Other Pillars',
              description: 'See how Real Assets compare to Fixed Income, Growth, Commodities, Liquidity, and Speculation',
              instructions: 'Review the role comparison table. Real Assets provide income (like Fixed Income) and inflation protection (like Commodities). Compare with both.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Real Assets = Farm',
              description: 'Real Assets are like a farm - produce income (crops) and appreciate in value (land), protecting against inflation',
              instructions: 'Understand the metaphor: Real Assets = Farm. They produce ongoing income while maintaining value during inflation.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Real Assets Fail',
              description: 'Learn the failure modes of Real Assets',
              instructions: 'Real Assets fail if you need liquidity quickly, fail if property values decline, and fail if you can\'t manage them. They require active management.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Real Assets',
              instructions: 'Decision rule: If lifestyle costs exist and inflation is a concern, Real Assets dominate. If you need liquidity, use other pillars.',
              isOptional: false,
              order: 4,
            },
          ],
        },
        {
          title: 'Module 5: Liquidity and Optionality',
          description: 'Why timing beats optimization',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 2,
          estimatedTime: 45,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Liquidity',
              description: 'Liquidity exists for optionality',
              instructions: 'Learn that Liquidity serves the role of providing optionality - the ability to act when opportunities arise.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Liquidity with Other Pillars',
              description: 'See how Liquidity compares to Fixed Income, Growth, Commodities, Real Assets, and Speculation',
              instructions: 'Review the role comparison table. Liquidity provides no cashflow and no growth, but enables action. Compare with other pillars that lock capital.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Liquidity = Ammunition',
              description: 'Liquidity is like ammunition - useless sitting idle, but essential when you need to act',
              instructions: 'Understand the metaphor: Liquidity = Ammunition. It provides the power to act when opportunities or needs arise.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Liquidity Fails',
              description: 'Learn the failure modes of Liquidity',
              instructions: 'Liquidity fails if you hold too much (opportunity cost), fails to generate returns, and fails if inflation erodes value. Balance is key.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Liquidity',
              instructions: 'Decision rule: Keep 3-6 months expenses in liquidity. Beyond that, allocate to other pillars based on goals.',
              isOptional: false,
              order: 4,
            },
          ],
        },
        {
          title: 'Module 6: Speculation',
          description: 'Asymmetric upside and when to use it',
          category: GuideCategory.INVESTMENT_STRATEGY,
          difficulty: 4,
          estimatedTime: 45,
          steps: [
            {
              id: '1',
              title: 'Understand the Role of Speculation',
              description: 'Speculation exists for asymmetric upside',
              instructions: 'Learn that Speculation serves the role of providing asymmetric upside - small risk for large potential gain.',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Compare Speculation with Other Pillars',
              description: 'See how Speculation compares to Fixed Income, Growth, Commodities, Real Assets, and Liquidity',
              instructions: 'Review the role comparison table. Speculation has highest volatility and highest potential return. Compare with Growth which is more predictable.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Learn the Mental Model: Speculation = Leverage',
              description: 'Speculation is like leverage - amplifies outcomes, both positive and negative',
              instructions: 'Understand the metaphor: Speculation = Leverage. It amplifies your position, but can work against you.',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Understand When Speculation Fails',
              description: 'Learn the failure modes of Speculation',
              instructions: 'Speculation fails if you risk too much, fails if you don\'t understand the asset, and fails if you need the money. Only risk what you can lose.',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Apply Decision Rules',
              description: 'Use simple decision rules for Speculation',
              instructions: 'Decision rule: Allocate only 5-10% of portfolio to speculation. Never risk money you need. Understand what you\'re buying.',
              isOptional: false,
              order: 4,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Money OS Overview',
          description: 'Foundational mental model for understanding the six money system pillars and their roles',
          type: TeamProductType.DASHBOARD,
          icon: '📊',
          order: 1,
          url: '/products/money-os-overview',
          accessUrl: '/master/money/products/money-os-overview',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Pillar Overview', description: 'View all six money system pillars', enabled: true },
            { name: 'Canonical Map', description: 'Role comparison table', enabled: true },
            { name: 'Mental Models', description: 'Metaphors for each pillar', enabled: true },
          ],
          integrationPoints: [
            { system: 'KnowledgeBase', dataType: 'reports', direction: 'read' as const },
          ],
        },
        {
          name: 'Fixed Income Intelligence',
          description: 'Explain predictable cashflow systems and how fixed income generates cashflow',
          type: TeamProductType.ANALYZER,
          icon: '💵',
          order: 2,
          url: '/products/fixed-income-intelligence',
          accessUrl: '/master/money/products/fixed-income-intelligence',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Cashflow Analysis', description: 'Analyze predictable cashflow systems', enabled: true },
            { name: 'Reliability vs Inflation', description: 'Trade-off analysis', enabled: true },
            { name: 'Failure Modes', description: 'When fixed income fails', enabled: true },
          ],
          integrationPoints: [
            { system: 'KnowledgeBase', dataType: 'reports', direction: 'read' as const },
          ],
        },
        {
          name: 'Growth vs Income Analysis',
          description: 'Resolve the most common money confusion - why growth sacrifices income and vice versa',
          type: TeamProductType.ANALYZER,
          icon: '📈',
          order: 3,
          url: '/products/growth-vs-income',
          accessUrl: '/master/money/products/growth-vs-income',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Growth Analysis', description: 'Why volatility is required for multiplication', enabled: true },
            { name: 'Income Analysis', description: 'Why income sacrifices upside', enabled: true },
            { name: 'Time Horizon Mismatch', description: 'Understanding time horizon requirements', enabled: true },
          ],
          integrationPoints: [
            { system: 'KnowledgeBase', dataType: 'reports', direction: 'read' as const },
          ],
        },
        {
          name: 'Inflation Impact Report',
          description: 'Show what inflation actually destroys and how different systems respond',
          type: TeamProductType.ANALYZER,
          icon: '🔥',
          order: 4,
          url: '/products/inflation-impact',
          accessUrl: '/master/money/products/inflation-impact',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Inflation Analysis', description: 'How inflation affects each pillar', enabled: true },
            { name: 'Purchasing Power', description: 'What inflation destroys', enabled: true },
            { name: 'Resistance Analysis', description: 'Which systems resist inflation', enabled: true },
          ],
          integrationPoints: [
            { system: 'KnowledgeBase', dataType: 'reports', direction: 'read' as const },
          ],
        },
        {
          name: 'Scenario Analysis',
          description: 'Answer "what happens if..." for different economic conditions',
          type: TeamProductType.PLANNER,
          icon: '🎯',
          order: 5,
          url: '/products/scenario-analysis',
          accessUrl: '/master/money/products/scenario-analysis',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'High Inflation Scenario', description: 'How pillars respond to high inflation', enabled: true },
            { name: 'Rising Rates Scenario', description: 'Impact of rising interest rates', enabled: true },
            { name: 'Recession Scenario', description: 'Pillar behavior during recession', enabled: true },
            { name: 'Income Shock Scenario', description: 'Personal income shock responses', enabled: true },
          ],
          integrationPoints: [
            { system: 'KnowledgeBase', dataType: 'reports', direction: 'read' as const },
          ],
        },
      ],
    },
    // Health/Capacity System Team
    {
      domain: TeamDomain.HEALTH_CAPACITY,
      name: 'Health & Capacity Team',
      description: 'Expert team focused on capacity management, recovery planning, and burnout prevention',
      icon: '💪',
      order: 10,
      leadAgentType: 'CAPACITY_SPECIALIST' as const,
      agentRoles: [
        { type: 'CAPACITY_SPECIALIST' as const, role: TeamAgentRole.LEAD },
        { type: 'RECOVERY_COACH' as const, role: TeamAgentRole.MEMBER },
        { type: 'BURNOUT_PREVENTION_SPECIALIST' as const, role: TeamAgentRole.SPECIALIST },
      ],
      guides: [
        {
          title: 'Comprehensive Capacity Management Plan',
          description: 'Create a complete capacity management plan including recovery, effort tracking, and burnout prevention',
          category: GuideCategory.CAPACITY_MANAGEMENT,
          difficulty: 4,
          estimatedTime: 90,
          steps: [
            {
              id: '1',
              title: 'Assess Current Capacity State',
              description: 'Evaluate current capacity, capacity band, and risk factors',
              instructions: 'Review capacity (0-100), identify capacity band (critical/low/medium/high/optimal), and assess burnout risk',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Analyze Effort Patterns',
              description: 'Review consecutive high effort days and work/recovery balance',
              instructions: 'Check consecutive high effort days count and calculate work action percentage to identify imbalance',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Design Recovery Strategy',
              description: 'Create recovery plan with 2-4 recovery actions per week',
              instructions: 'Plan recovery actions (Exercise, Learning, Save Expenses, Rest) to achieve 2-4 actions per week',
              isOptional: false,
              order: 2,
            },
            {
              id: '4',
              title: 'Implement Effort Management',
              description: 'Set up effort tracking and prevention strategies',
              instructions: 'Create system to monitor effort levels and take breaks before hitting decay thresholds',
              isOptional: false,
              order: 3,
            },
            {
              id: '5',
              title: 'Monitor and Adjust',
              description: 'Track capacity changes and adjust plan based on weekly ticks',
              instructions: 'Review capacity changes on weekly ticks and adjust recovery and effort strategies accordingly',
              isOptional: false,
              order: 4,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Capacity Tracker & Analyzer',
          description: 'Track capacity state, recovery actions, effort patterns, and burnout risk. Analyze capacity trends and system interactions.',
          type: TeamProductType.ANALYZER,
          icon: '📊',
          order: 1,
          url: '/products/capacity-tracker',
          accessUrl: '/master/health/products/capacity-tracker',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Capacity State Tracking', description: 'Monitor capacity (0-100) and capacity band over time', enabled: true },
            { name: 'Recovery Action Analysis', description: 'Track recovery actions per week and recovery effectiveness', enabled: true },
            { name: 'Effort Pattern Analysis', description: 'Analyze consecutive high effort days and work/recovery balance', enabled: true },
            { name: 'Burnout Risk Assessment', description: 'Calculate and display burnout risk level based on capacity and patterns', enabled: true },
            { name: 'System Interaction View', description: 'See how capacity affects Energy, XP efficiency, and Burnout', enabled: true },
            { name: 'Weekly Recovery Projection', description: 'Project capacity changes based on current recovery actions', enabled: true },
          ],
          integrationPoints: [
            { system: 'Health System', dataType: 'capacity', direction: 'read' as const },
            { system: 'Activity Log', dataType: 'recovery_actions', direction: 'read' as const },
            { system: 'Energy System', dataType: 'energy_cap', direction: 'read' as const },
          ],
        },
        {
          name: 'Recovery Planner',
          description: 'Plan and optimize recovery actions. Calculate recovery schedules, energy requirements, and capacity improvement projections.',
          type: TeamProductType.PLANNER,
          icon: '🔄',
          order: 2,
          url: '/products/recovery-planner',
          accessUrl: '/master/health/products/recovery-planner',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Recovery Action Scheduler', description: 'Plan recovery actions across the week with energy budget consideration', enabled: true },
            { name: 'Recovery Effectiveness Calculator', description: 'Calculate expected capacity recovery based on action count', enabled: true },
            { name: 'Energy Budget Planner', description: 'Plan recovery actions considering daily energy budget', enabled: true },
            { name: 'Recovery Action Recommendations', description: 'Get personalized recovery action recommendations based on capacity state', enabled: true },
            { name: 'Weekly Recovery Goals', description: 'Set and track weekly recovery goals (2-4 actions)', enabled: true },
          ],
          integrationPoints: [
            { system: 'Health System', dataType: 'capacity', direction: 'read' as const },
            { system: 'Energy System', dataType: 'energy', direction: 'read' as const },
            { system: 'Activity Log', dataType: 'recovery_actions', direction: 'read' as const },
          ],
        },
        {
          name: 'Effort & Burnout Monitor',
          description: 'Monitor effort levels, consecutive high effort days, and burnout risk. Get alerts and prevention recommendations.',
          type: TeamProductType.DASHBOARD,
          icon: '🛡️',
          order: 3,
          url: '/products/effort-monitor',
          accessUrl: '/master/health/products/effort-monitor',
          securityLevel: 'HIGH',
          requiresAuth: true,
          features: [
            { name: 'Consecutive High Effort Tracking', description: 'Track consecutive high effort days and decay risk', enabled: true },
            { name: 'Work/Recovery Balance Monitor', description: 'Monitor work action percentage and detect chronic imbalance', enabled: true },
            { name: 'Burnout Risk Dashboard', description: 'Real-time burnout risk assessment with capacity and effort factors', enabled: true },
            { name: 'Decay Prevention Alerts', description: 'Get alerts before hitting effort thresholds (7, 14, 21 days)', enabled: true },
            { name: 'Effort Optimization Recommendations', description: 'Receive recommendations to prevent capacity decay', enabled: true },
            { name: 'Historical Effort Analysis', description: 'View effort patterns over time and identify trends', enabled: true },
          ],
          integrationPoints: [
            { system: 'Health System', dataType: 'capacity', direction: 'read' as const },
            { system: 'Health System', dataType: 'consecutive_high_effort_days', direction: 'read' as const },
            { system: 'Activity Log', dataType: 'activities', direction: 'read' as const },
            { system: 'Energy System', dataType: 'energy_expenditure', direction: 'read' as const },
          ],
        },
      ],
    },
  ]

  for (const teamData of teams) {
    const { agentRoles, guides, products, leadAgentType, ...teamInfo } = teamData

    // Get lead agent
    const leadAgent = agentMap.get(leadAgentType)

    // Create team
    const team = await prisma.team.upsert({
      where: { domain: teamInfo.domain },
      create: {
        ...teamInfo,
        teamLeadAgentId: leadAgent?.id,
      },
      update: {
        ...teamInfo,
        teamLeadAgentId: leadAgent?.id,
      },
    })

    console.log(`✅ Created team: ${team.name}`)

    // Assign agents to team
    for (const agentRole of agentRoles) {
      const agent = agentMap.get(agentRole.type)
      if (agent) {
        await prisma.teamAgent.upsert({
          where: {
            teamId_agentId: {
              teamId: team.id,
              agentId: agent.id,
            },
          },
          create: {
            teamId: team.id,
            agentId: agent.id,
            role: agentRole.role,
            order: 0, // Would be calculated based on role
          },
          update: {
            role: agentRole.role,
          },
        })
        console.log(`  ✅ Assigned agent: ${agent.name} as ${agentRole.role}`)
      }
    }

    // Create team guides
    for (const guideData of guides) {
      const { steps, ...guideInfo } = guideData

      const guide = await prisma.moneyGuide.upsert({
        where: {
          id: `${team.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
        },
        create: {
          id: `${team.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
          teamId: team.id,
          ...guideInfo,
          steps: steps as any,
          isTeamGuide: true,
        },
        update: {
          ...guideInfo,
          steps: steps as any,
          isTeamGuide: true,
        },
      })

      console.log(`  ✅ Created guide: ${guide.title}`)
    }

    // Create products owned by Nexus Motivus organization
    for (const productData of products) {
      const { features, integrationPoints, ...productInfo } = productData
      const productId = `${team.id}-${productInfo.name.toLowerCase().replace(/\s+/g, '-')}`

      // Create product owned by organization
      const product = await prisma.product.upsert({
        where: {
          id: productId,
        },
        create: {
          id: productId,
          organizationId: nexusMotivus.id,
          ...productInfo,
          features: features as any,
          integrationPoints: integrationPoints as any,
          // Extract security-related fields if present
          url: (productInfo as any).url,
          accessUrl: (productInfo as any).accessUrl,
          securityLevel: (productInfo as any).securityLevel,
          requiresAuth: (productInfo as any).requiresAuth ?? true,
        },
        update: {
          name: productInfo.name,
          description: productInfo.description,
          type: productInfo.type,
          icon: productInfo.icon,
          features: features as any,
          integrationPoints: integrationPoints as any,
          order: productInfo.order,
          // Update security fields if provided
          url: (productInfo as any).url !== undefined ? (productInfo as any).url : undefined,
          accessUrl: (productInfo as any).accessUrl !== undefined ? (productInfo as any).accessUrl : undefined,
          securityLevel: (productInfo as any).securityLevel !== undefined ? (productInfo as any).securityLevel : undefined,
          requiresAuth: (productInfo as any).requiresAuth !== undefined ? (productInfo as any).requiresAuth : true,
        },
      })

      // Create association between team and product
      await prisma.teamProductAssociation.upsert({
        where: {
          teamId_productId: {
            teamId: team.id,
            productId: product.id,
          },
        },
        create: {
          teamId: team.id,
          productId: product.id,
          order: productInfo.order || 0,
        },
        update: {
          order: productInfo.order || 0,
        },
      })

      console.log(`  ✅ Created product: ${product.name} (associated with ${team.name})`)
    }
  }

  console.log('✨ Team seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

