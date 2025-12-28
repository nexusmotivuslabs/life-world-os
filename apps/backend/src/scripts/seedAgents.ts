/**
 * Seed Agents Script
 * 
 * Populates the database with agent profiles, their guides, and pro tips.
 * Now includes Security Specialist agent.
 */

import { PrismaClient, AgentType, GuideCategory } from '@prisma/client'
import { securityAgentData } from './securityAgentData.js'

const prisma = new PrismaClient()

const agents = [
  {
    type: AgentType.INVESTOR,
    name: 'The Investor',
    description: 'High net worth investor with 7%+ annual returns consistently over 10 years',
    expertise: 'Portfolio construction, asset allocation, risk management, investment strategies, long-term wealth building, diversification, market analysis',
    avatar: '💼',
    order: 1,
    metadata: {
      proTips: [
        'Dollar-cost averaging beats trying to time the market - invest consistently regardless of market conditions',
        'Focus on low-cost index funds (expense ratios under 0.1%) - fees compound and erode returns significantly',
        'Rebalance your portfolio quarterly, not daily - avoid overtrading and emotional decisions',
        'Diversify across asset classes, sectors, and geographies - don\'t put all eggs in one basket',
        'Think in decades, not days - the best investors are patient and ignore short-term volatility',
        'Use tax-advantaged accounts first (401k, IRA) before taxable accounts - tax efficiency compounds over time',
      ],
      whatToAvoid: [
        'Day trading and market timing - studies show 95% of day traders lose money',
        'Chasing hot stocks or trends - by the time you hear about it, the opportunity is usually gone',
        'Paying high fees - 1% annual fee can cost you 30% of returns over 30 years',
        'Emotional investing - panic selling during downturns and FOMO buying during peaks',
        'Lack of diversification - putting too much in single stocks or sectors',
        'Ignoring asset allocation - having too much risk (or too little) for your age and goals',
        'Trading too frequently - transaction costs and taxes eat into returns',
      ],
      bestPractices: [
        'Start early - compound interest is the 8th wonder of the world (Einstein)',
        'Invest at least 15-20% of income consistently',
        'Use a 3-fund portfolio (US stocks, international stocks, bonds) for simplicity',
        'Automate investments - set up automatic monthly contributions',
        'Hold investments in tax-advantaged accounts as long as possible',
        'Review portfolio annually, rebalance when allocation drifts 5%+ from target',
        'Stay the course during market downturns - downturns are buying opportunities for long-term investors',
      ],
    },
    guides: [
      {
        title: 'Build Your First Investment Portfolio',
        description: 'Step-by-step guide to building a diversified investment portfolio from scratch',
        category: GuideCategory.INVESTMENT_STRATEGY,
        difficulty: 3,
        estimatedTime: 60,
        steps: [
          {
            id: '1',
            title: 'Assess Your Risk Tolerance',
            description: 'Understand your risk appetite and investment timeline',
            instructions: 'Answer questions about your financial goals, timeline, and comfort with risk',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Determine Asset Allocation',
            description: 'Choose the right mix of stocks, bonds, and other assets',
            instructions: 'Use risk tolerance to determine your ideal asset allocation percentage',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Select Investments',
            description: 'Choose specific investment vehicles (index funds, ETFs, individual stocks)',
            instructions: 'Research and select investments that match your asset allocation strategy',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Open Investment Account',
            description: 'Set up your brokerage or investment account',
            instructions: 'Choose a platform, complete account setup, and fund your account',
            isOptional: false,
            order: 3,
          },
          {
            id: '5',
            title: 'Execute Your First Investment',
            description: 'Make your first investment purchase',
            instructions: 'Place your first trade based on your asset allocation plan',
            isOptional: false,
            order: 4,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.FINANCIAL_ADVISOR,
    name: 'The Financial Advisor',
    description: 'Goldman Sachs highest grade level financial advisor',
    expertise: 'Comprehensive financial planning, income optimization, wealth building, retirement planning, estate planning, tax-efficient strategies',
    avatar: '🎯',
    order: 2,
    metadata: {
      proTips: [
        'Build multiple income streams - diversify income sources to reduce financial risk',
        'Maximize employer matches - it\'s free money and instant 100% return',
        'Automate savings - pay yourself first by setting up automatic transfers',
        'Create an emergency fund before investing - 3-6 months of expenses in liquid savings',
        'Review and update your financial plan annually - life changes require plan adjustments',
        'Consider tax implications in every financial decision - taxes can take 30-40% of gains',
        'Protect your wealth with appropriate insurance - health, disability, life insurance',
      ],
      whatToAvoid: [
        'Lifestyle inflation - as income grows, avoid proportional spending increases',
        'Financial planning without goals - you need clear objectives to build an effective plan',
        'Ignoring estate planning - without a will, the state decides your asset distribution',
        'Investing before building emergency fund - emergencies force bad financial decisions',
        'Not maximizing employer benefits - 401k matches, HSAs, stock options are valuable',
        'Failing to review insurance needs - being underinsured can devastate wealth',
        'Neglecting retirement planning - start early, the earlier the better',
      ],
      bestPractices: [
        'Follow the 50/30/20 rule - 50% needs, 30% wants, 20% savings and debt repayment',
        'Create a comprehensive financial plan covering 5-10 year goals',
        'Review net worth quarterly - track progress toward financial independence',
        'Use tax-advantaged accounts strategically - 401k, IRA, HSA, 529 plans',
        'Build a financial team - accountant, lawyer, financial advisor for complex situations',
        'Plan for retirement early - aim to save 15-25% of income if starting in 20s-30s',
        'Estate planning basics: will, power of attorney, healthcare directive, beneficiary designations',
      ],
    },
    guides: [
      {
        title: 'Create Multiple Income Streams',
        description: 'Build a diversified income portfolio with multiple revenue sources',
        category: GuideCategory.INCOME_GENERATION,
        difficulty: 4,
        estimatedTime: 90,
        steps: [
          {
            id: '1',
            title: 'Audit Current Income',
            description: 'Analyze all current income sources',
            instructions: 'List all income streams and their reliability',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Identify Opportunities',
            description: 'Find potential new income streams',
            instructions: 'Brainstorm income opportunities based on skills, assets, and market needs',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Prioritize Income Streams',
            description: 'Rank opportunities by feasibility and potential',
            instructions: 'Evaluate each opportunity for effort required vs income potential',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Create Action Plan',
            description: 'Develop implementation plan for top opportunities',
            instructions: 'Create detailed action steps and timeline for launching new income streams',
            isOptional: false,
            order: 3,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.ACCOUNTANT,
    name: 'The Accountant',
    description: 'Expert in tax preparation, deduction optimization, and compliance',
    expertise: 'Tax preparation, deduction optimization, compliance, record keeping, tax planning, IRS regulations',
    avatar: '📊',
    order: 3,
    metadata: {
      proTips: [
        'Keep receipts and records year-round, not just at tax time - digital tools make this easy',
        'Understand the difference between deductions and credits - credits reduce taxes dollar-for-dollar',
        'Maximize retirement contributions - reduces taxable income and builds wealth',
        'Track business expenses if you\'re self-employed - home office, mileage, supplies are deductible',
        'Use tax software or a professional for complex situations - mistakes cost more than help',
        'File on time even if you can\'t pay - penalties for late filing are worse than payment plans',
        'Review your withholding annually - avoid large refunds (free loan to IRS) or big tax bills',
      ],
      whatToAvoid: [
        'Mixing personal and business expenses - keep separate accounts and records',
        'Missing deduction deadlines - many deductions must be made by December 31st',
        'Not keeping receipts - IRS can audit up to 3 years back, need proof',
        'Ignoring tax-advantaged accounts - 401k, HSA, FSA reduce taxable income',
        'Guessing on deductions - be accurate, overstating can trigger audits',
        'Waiting until April to organize - start early, gather documents in January',
        'Forgetting state taxes - federal isn\'t the only tax you owe',
      ],
      bestPractices: [
        'Organize documents by category (income, deductions, credits) throughout the year',
        'Use accounting software to track expenses in real-time',
        'Keep tax documents for 7 years (IRS audit window)',
        'Maximize pre-tax deductions: 401k, HSA, health insurance premiums',
        'Time deductions strategically - bunch charitable contributions in one year if itemizing',
        'Understand your filing status - married filing jointly often saves taxes',
        'Review prior year\'s return - many deductions and credits repeat annually',
      ],
    },
    guides: [
      {
        title: 'Maximize Deductions',
        description: 'Learn how to identify and claim all eligible tax deductions',
        category: GuideCategory.TAX_PLANNING,
        difficulty: 2,
        estimatedTime: 45,
        steps: [
          {
            id: '1',
            title: 'Understand Deduction Categories',
            description: 'Learn about different types of deductions',
            instructions: 'Review common deduction categories (business expenses, home office, etc.)',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Track Expenses',
            description: 'Set up expense tracking system',
            instructions: 'Create system for tracking deductible expenses throughout the year',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Document Deductions',
            description: 'Gather and organize deduction documentation',
            instructions: 'Collect receipts, invoices, and other documentation for deductions',
            isOptional: false,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.BOOKKEEPER,
    name: 'The Bookkeeper',
    description: 'Organized and methodical expert in transaction tracking and financial records',
    expertise: 'Transaction tracking, expense categorization, financial records, bookkeeping systems, financial organization',
    avatar: '📁',
    order: 4,
    metadata: {
      proTips: [
        'Reconcile accounts monthly - catch errors early when they\'re easy to fix',
        'Use accounting software - saves time and reduces errors (QuickBooks, Xero, FreshBooks)',
        'Categorize transactions immediately - don\'t let them pile up',
        'Keep personal and business finances separate - use separate bank accounts and credit cards',
        'Back up financial data regularly - use cloud storage for safety',
        'Review financial reports monthly - profit & loss, cash flow, balance sheet',
        'Set up automatic bank feeds - reduces manual data entry significantly',
      ],
      whatToAvoid: [
        'Mixing personal and business transactions - creates accounting nightmares',
        'Letting receipts pile up - reconcile weekly, not yearly',
        'Not categorizing transactions - makes tax time and analysis impossible',
        'Ignoring small transactions - they add up and affect accuracy',
        'Not backing up data - one computer crash can lose years of records',
        'Using cash without tracking - every transaction needs a record',
        'Neglecting reconciliation - bank and credit card statements must match records',
      ],
      bestPractices: [
        'Set up a chart of accounts - standardized categories for all transactions',
        'Reconcile all accounts monthly (checking, savings, credit cards, investment accounts)',
        'Use separate accounts for business and personal finances',
        'Keep receipts organized - digital is better than paper (photo, scan, or app)',
        'Review and categorize transactions weekly - prevents backlog',
        'Maintain accurate records - needed for taxes, loans, and business decisions',
        'Create monthly financial reports - understand your financial position regularly',
      ],
    },
    guides: [
      {
        title: 'Set Up Proper Bookkeeping',
        description: 'Establish a comprehensive bookkeeping system for your finances',
        category: GuideCategory.BOOKKEEPING,
        difficulty: 2,
        estimatedTime: 30,
        steps: [
          {
            id: '1',
            title: 'Choose Bookkeeping System',
            description: 'Select software or method for tracking finances',
            instructions: 'Research and choose a bookkeeping tool (software, spreadsheet, etc.)',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Set Up Categories',
            description: 'Create expense and income categories',
            instructions: 'Define categories that match your financial activities',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Establish Recording Routine',
            description: 'Create habit of regular financial record keeping',
            instructions: 'Set up schedule and process for recording transactions',
            isOptional: false,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.TAX_STRATEGIST,
    name: 'The Tax Strategist',
    description: 'Strategic tax planning expert focused on long-term optimization',
    expertise: 'Advanced tax planning, tax-efficient strategies, long-term optimization, tax-loss harvesting, retirement tax planning',
    avatar: '🧮',
    order: 5,
    metadata: {
      proTips: [
        'Tax-loss harvest in down markets - offset capital gains with strategic losses',
        'Use Roth vs Traditional strategically - Roth for lower current tax brackets, Traditional for higher',
        'Time income and deductions across years - bunch deductions when itemizing, defer income when possible',
        'Maximize HSA contributions - triple tax advantage (pre-tax, tax-free growth, tax-free withdrawals)',
        'Consider tax-efficient investment placement - bonds in tax-advantaged, stocks in taxable',
        'Plan for retirement tax brackets - withdraw strategically to stay in lower brackets',
        'Use 1031 exchanges for real estate - defer capital gains taxes when selling investment property',
      ],
      whatToAvoid: [
        'Selling investments without considering tax consequences - short-term gains taxed higher',
        'Not harvesting tax losses - can offset $3,000 in ordinary income plus gains',
        'Ignoring required minimum distributions (RMDs) - 50% penalty on missed distributions',
        'Taking retirement distributions too early - 10% penalty plus taxes before age 59.5',
        'Not considering state taxes - some states have no income tax, some have high rates',
        'Overlooking tax-efficient fund placement - wrong asset location costs thousands over time',
        'Ignoring AMT (Alternative Minimum Tax) - can affect high earners unexpectedly',
      ],
      bestPractices: [
        'Plan tax strategy year-round, not just in April',
        'Harvest tax losses in taxable accounts to offset gains',
        'Use tax-advantaged accounts strategically (401k, IRA, HSA, 529)',
        'Time large transactions to optimize tax impact across years',
        'Consider tax brackets when taking distributions in retirement',
        'Hold investments long-term (1+ years) for lower capital gains rates',
        'Review tax strategy annually with changes in income, life events, and tax law',
      ],
    },
    guides: [
      {
        title: 'Optimize Your Tax Strategy',
        description: 'Develop a comprehensive tax optimization strategy',
        category: GuideCategory.TAX_PLANNING,
        difficulty: 4,
        estimatedTime: 75,
        steps: [
          {
            id: '1',
            title: 'Analyze Current Tax Situation',
            description: 'Review your current tax burden and strategy',
            instructions: 'Calculate effective tax rate and identify optimization opportunities',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Implement Tax-Efficient Investments',
            description: 'Optimize investment strategy for tax efficiency',
            instructions: 'Consider tax-advantaged accounts and tax-efficient investments',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Plan Tax-Loss Harvesting',
            description: 'Develop strategy for harvesting tax losses',
            instructions: 'Learn when and how to realize losses to offset gains',
            isOptional: false,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.CASH_FLOW_SPECIALIST,
    name: 'The Cash Flow Specialist',
    description: 'Practical expert in monthly cash flow optimization',
    expertise: 'Monthly cash flow optimization, expense reduction, liquidity management, budgeting, emergency fund building',
    avatar: '💵',
    order: 6,
    metadata: {
      proTips: [
        'Track every expense for one month - you can\'t optimize what you don\'t measure',
        'Build buffer in your budget - plan for 110% of expected expenses, not 100%',
        'Automate savings transfers - pay yourself first before discretionary spending',
        'Negotiate recurring bills annually - cable, internet, insurance, subscriptions',
        'Use cash envelopes for discretionary categories - physical limits prevent overspending',
        'Review subscriptions quarterly - cancel unused services automatically',
        'Time large purchases strategically - buy during sales, avoid impulse purchases',
      ],
      whatToAvoid: [
        'Living paycheck to paycheck - build at least one month buffer',
        'Ignoring small recurring charges - $10/month subscriptions add up to $120/year',
        'Not having an emergency fund - forces credit card debt when unexpected expenses arise',
        'Overspending on wants before needs - cover essentials first, then discretionary',
        'Not tracking cash flow - you\'ll overspend without awareness',
        'Ignoring payment due dates - late fees and interest charges waste money',
        'Lifestyle inflation - increasing spending as income increases prevents wealth building',
      ],
      bestPractices: [
        'Create zero-based budget - every dollar has a purpose before the month begins',
        'Track expenses daily or weekly - prevents surprises at month-end',
        'Build 3-6 month emergency fund in high-yield savings account',
        'Use 50/30/20 rule as starting point: 50% needs, 30% wants, 20% savings/debt',
        'Review and adjust budget monthly - it\'s a living document',
        'Automate fixed expenses and savings - reduces decision fatigue',
        'Monitor cash flow weekly - catch problems before they become crises',
      ],
    },
    guides: [
      {
        title: 'Improve Cash Flow by 20%',
        description: 'Practical strategies to significantly improve your monthly cash flow',
        category: GuideCategory.CASH_FLOW_MANAGEMENT,
        difficulty: 3,
        estimatedTime: 60,
        steps: [
          {
            id: '1',
            title: 'Analyze Current Cash Flow',
            description: 'Track income and expenses for one month',
            instructions: 'Record all income and expenses to understand current cash flow',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Identify Reduction Opportunities',
            description: 'Find expenses that can be reduced or eliminated',
            instructions: 'Review expenses and identify non-essential items and opportunities to reduce costs',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Negotiate Bills',
            description: 'Negotiate better rates on recurring bills',
            instructions: 'Contact service providers to negotiate lower rates',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Implement Changes',
            description: 'Execute cash flow improvements',
            instructions: 'Cancel unnecessary subscriptions, switch to lower-cost alternatives',
            isOptional: false,
            order: 3,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.DEBT_SPECIALIST,
    name: 'The Debt Specialist',
    description: 'Strategic debt reduction expert with empathetic approach',
    expertise: 'Debt reduction strategies, debt consolidation, credit optimization, payoff planning, debt-to-income optimization, credit score improvement',
    avatar: '🏦',
    order: 7,
    metadata: {
      proTips: [
        'Use debt snowball method for motivation (smallest balance first) or avalanche for speed (highest interest first)',
        'Negotiate lower interest rates - call creditors and ask for rate reductions',
        'Stop using credit cards while paying off debt - cut them up or freeze them',
        'Consider balance transfer cards with 0% APR - but pay off before promo ends',
        'Make minimum payments on all debts, then focus extra payments on one debt',
        'Track your debt payoff progress - visual progress motivates continued effort',
        'Celebrate milestones - paying off each debt deserves recognition',
      ],
      whatToAvoid: [
        'Making minimum payments only - you\'ll pay 2-3x the original balance in interest',
        'Opening new credit while paying off debt - adds to the problem',
        'Ignoring high-interest debt - credit cards at 20%+ APR cost thousands',
        'Not having a payoff plan - random payments don\'t optimize payoff speed',
        'Using debt consolidation as excuse to spend more - it\'s a tool, not a solution',
        'Closing paid-off credit cards immediately - can hurt credit score (keep oldest card)',
        'Paying off low-interest debt before high-interest - prioritize by rate, not balance',
      ],
      bestPractices: [
        'List all debts with balances, interest rates, and minimum payments',
        'Choose payoff strategy: snowball (psychological wins) or avalanche (save money)',
        'Create realistic payoff timeline - sustainable plan beats aggressive burnout',
        'Negotiate with creditors - many will work with you on payment plans',
        'Build emergency fund while paying debt (small $1000 fund prevents new debt)',
        'Monitor credit score monthly - see improvement as you pay down debt',
        'Stay committed - debt payoff is a marathon, consistency beats intensity',
      ],
    },
    guides: [
      {
        title: 'Create Debt Payoff Plan',
        description: 'Develop a strategic plan to pay off all debt efficiently',
        category: GuideCategory.DEBT_MANAGEMENT,
        difficulty: 3,
        estimatedTime: 45,
        steps: [
          {
            id: '1',
            title: 'List All Debts',
            description: 'Compile complete list of all debts',
            instructions: 'List all debts with balances, interest rates, and minimum payments',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Choose Payoff Strategy',
            description: 'Select snowball or avalanche method',
            instructions: 'Compare strategies and choose the one that best fits your situation',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Create Payment Plan',
            description: 'Develop detailed payment schedule',
            instructions: 'Calculate how much to pay to each debt and timeline for payoff',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Implement and Track',
            description: 'Start paying off debt and track progress',
            instructions: 'Begin making payments according to plan and monitor progress monthly',
            isOptional: false,
            order: 3,
          },
        ],
      },
      {
        title: 'Optimize Your Debt-to-Income Ratio',
        description: 'Improve your debt-to-income ratio through strategic planning',
        category: GuideCategory.DEBT_MANAGEMENT,
        difficulty: 2,
        estimatedTime: 30,
        steps: [
          {
            id: '1',
            title: 'Calculate Current Ratio',
            description: 'Determine your current debt-to-income ratio',
            instructions: 'Divide total monthly debt payments by gross monthly income',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Set Target Ratio',
            description: 'Establish target debt-to-income ratio goal',
            instructions: 'Set realistic target (typically below 36%)',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Develop Reduction Strategy',
            description: 'Create plan to reduce ratio',
            instructions: 'Focus on either increasing income or reducing debt payments',
            isOptional: false,
            order: 2,
          },
        ],
      },
    ],
  },
  securityAgentData,
  // Health/Capacity System Agents
  {
    type: AgentType.CAPACITY_SPECIALIST,
    name: 'The Capacity Specialist',
    description: 'Expert in human operating stability, physical health, mental resilience, and cognitive efficiency',
    expertise: 'Capacity management, recovery planning, effort optimization, burnout prevention, weekly recovery systems, capacity decay prevention',
    avatar: '💪',
    order: 9,
    metadata: {
      proTips: [
        'Capacity is a state (0-100), not a resource - it modifies outcomes, not costs',
        'Recovery requires 2-4 recovery actions per week for meaningful capacity improvement',
        'Sustained high effort (7+ days) triggers capacity decay - balance is essential',
        'Chronic imbalance (70%+ work actions) causes capacity decay regardless of effort',
        'Capacity modifies usable energy cap - high capacity = more energy, low capacity = less energy',
        'Recovery actions (Exercise, Learning, Save Expenses, Rest) improve capacity slowly over time',
        'Weekly recovery occurs on weekly ticks - recovery is gradual and capped, cannot be rushed',
      ],
      whatToAvoid: [
        'Ignoring recovery actions for 7+ days - triggers chronic neglect decay',
        'Sustained high effort for 21+ days - causes -3 capacity decay per week',
        'Chronic work imbalance - 70%+ work actions triggers imbalance decay',
        'Trying to bypass capacity decay - decay is mandatory and cannot be avoided',
        'Rushing burnout recovery - burnout recovery cannot be accelerated',
        'Neglecting weekly recovery - capacity will decay without regular recovery actions',
        'Treating capacity as a resource - it\'s a state that modifies outcomes',
      ],
      bestPractices: [
        'Maintain 2-4 recovery actions per week for optimal capacity recovery',
        'Balance work actions with recovery actions - avoid chronic imbalance',
        'Monitor consecutive high effort days - take breaks before hitting 7-day threshold',
        'Track capacity band (critical/low/medium/high/optimal) to understand current state',
        'Use recovery actions strategically - they consume energy but improve capacity over time',
        'Understand capacity modifies energy cap - high capacity enables more daily energy',
        'Plan recovery periods - capacity recovery is gradual and requires consistency',
      ],
    },
    guides: [
      {
        title: 'Build Your Recovery Plan',
        description: 'Create a personalized recovery plan to improve and maintain capacity',
        category: GuideCategory.RECOVERY_PLANNING,
        difficulty: 2,
        estimatedTime: 30,
        steps: [
          {
            id: '1',
            title: 'Assess Current Capacity',
            description: 'Understand your current capacity state and band',
            instructions: 'Review your current capacity (0-100) and identify your capacity band (critical/low/medium/high/optimal)',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Identify Recovery Actions',
            description: 'Choose recovery actions that fit your lifestyle',
            instructions: 'Select from Exercise, Learning, Save Expenses, and Rest actions that you can consistently perform',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Plan Weekly Recovery Schedule',
            description: 'Schedule 2-4 recovery actions per week',
            instructions: 'Create a weekly schedule ensuring at least 2 recovery actions, aiming for 4 for maximum recovery',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Monitor Effort Levels',
            description: 'Track consecutive high effort days to prevent decay',
            instructions: 'Monitor your daily effort expenditure and take breaks before hitting 7 consecutive high effort days',
            isOptional: false,
            order: 3,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.RECOVERY_COACH,
    name: 'The Recovery Coach',
    description: 'Specialist in recovery mechanics, recovery action optimization, and capacity restoration',
    expertise: 'Recovery action planning, capacity restoration, weekly recovery optimization, recovery action energy management',
    avatar: '🔄',
    order: 10,
    metadata: {
      proTips: [
        'Recovery actions consume energy but grant no XP - they\'re investments in capacity',
        'Minimum 2 recovery actions per week required for any capacity recovery',
        '4+ recovery actions per week provides maximum recovery (+2 capacity per week)',
        'Recovery occurs on weekly ticks - plan ahead for consistent recovery',
        'Rest action is pure recovery - no XP, only capacity improvement',
        'Exercise and Learning provide both XP and recovery - dual benefit actions',
        'Recovery is gradual - expect +1 to +2 capacity per week with consistent recovery',
      ],
      whatToAvoid: [
        'Skipping recovery actions - capacity will decay without recovery',
        'Performing recovery actions without energy - recovery actions consume energy',
        'Expecting immediate recovery - recovery occurs on weekly ticks, not daily',
        'Only doing 1 recovery action per week - need minimum 2 for any recovery',
        'Ignoring recovery during high effort periods - recovery is most important when capacity is low',
        'Treating recovery as optional - recovery is essential for capacity maintenance',
        'Rushing recovery - recovery is capped and gradual, cannot be accelerated',
      ],
      bestPractices: [
        'Schedule recovery actions in advance - consistency is key',
        'Balance recovery action types - mix Exercise, Learning, Save Expenses, and Rest',
        'Track recovery actions per week - aim for 2-4 actions consistently',
        'Plan recovery around energy availability - recovery actions consume energy',
        'Use Rest action when energy is low - Rest has lower energy cost (18) than Exercise (25)',
        'Monitor last recovery action timestamp - ensure regular recovery',
        'Understand recovery is weekly - plan for weekly recovery cycles',
      ],
    },
    guides: [
      {
        title: 'Optimize Your Recovery Actions',
        description: 'Maximize capacity recovery through strategic recovery action planning',
        category: GuideCategory.RECOVERY_PLANNING,
        difficulty: 3,
        estimatedTime: 45,
        steps: [
          {
            id: '1',
            title: 'Understand Recovery Action Types',
            description: 'Learn about different recovery actions and their benefits',
            instructions: 'Review Exercise (25 energy, grants XP), Learning (20 energy, grants XP), Save Expenses (15 energy, grants XP), and Rest (18 energy, no XP)',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Calculate Weekly Recovery Target',
            description: 'Determine optimal recovery action count for your capacity goals',
            instructions: 'Plan for 2-4 recovery actions per week based on your capacity state and recovery goals',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Balance Energy and Recovery',
            description: 'Plan recovery actions considering energy availability',
            instructions: 'Schedule recovery actions when you have sufficient energy, considering daily energy budget',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Track Recovery Progress',
            description: 'Monitor recovery actions and capacity improvement',
            instructions: 'Track recovery actions per week and monitor capacity changes on weekly ticks',
            isOptional: false,
            order: 3,
          },
        ],
      },
    ],
  },
  {
    type: AgentType.BURNOUT_PREVENTION_SPECIALIST,
    name: 'The Burnout Prevention Specialist',
    description: 'Expert in burnout prevention, effort tracking, and capacity stability management',
    expertise: 'Burnout prevention, effort-based decay management, chronic imbalance detection, capacity stability, burnout recovery',
    avatar: '🛡️',
    order: 11,
    metadata: {
      proTips: [
        'Burnout is triggered by sustained low capacity (<30) for 7+ consecutive days',
        'High capacity (61-100) provides burnout resistance and protection',
        'Consecutive high effort days (7+) trigger capacity decay - prevent before it happens',
        'Chronic imbalance (70%+ work actions) causes capacity decay regardless of effort',
        'Recovery actions help prevent and exit burnout - Exercise, Learning, Save Expenses, Rest',
        'Burnout reduces energy cap to 40 and XP efficiency by 70% - prevention is critical',
        'Capacity band monitoring helps identify burnout risk early - critical (<20), low (20-30)',
      ],
      whatToAvoid: [
        'Ignoring consecutive high effort days - 7+ days triggers decay',
        'Chronic work imbalance - 70%+ work actions causes decay',
        'Neglecting recovery during high effort periods - recovery is most critical when capacity is low',
        'Allowing capacity to drop below 30 - increases burnout risk significantly',
        'Ignoring burnout risk warnings - capacity <30 is high risk',
        'Trying to work through burnout - burnout blocks work actions and reduces efficiency',
        'Rushing burnout recovery - burnout recovery cannot be accelerated, requires time',
      ],
      bestPractices: [
        'Monitor consecutive high effort days - take breaks before hitting 7-day threshold',
        'Balance work and recovery actions - avoid chronic imbalance (70%+ work)',
        'Maintain capacity above 30 - provides medium burnout risk instead of high',
        'Track capacity band regularly - identify risk early (critical/low/medium/high/optimal)',
        'Plan recovery during high effort periods - recovery prevents decay',
        'Use recovery actions to exit burnout - Exercise, Learning, Save Expenses, Rest',
        'Understand effort thresholds - 7 days = -1 decay, 14 days = -2 decay, 21+ days = -3 decay',
      ],
    },
    guides: [
      {
        title: 'Prevent Burnout Through Capacity Management',
        description: 'Learn to prevent burnout by managing capacity, effort, and recovery',
        category: GuideCategory.BURNOUT_PREVENTION,
        difficulty: 4,
        estimatedTime: 60,
        steps: [
          {
            id: '1',
            title: 'Understand Burnout Triggers',
            description: 'Learn what causes burnout in the system',
            instructions: 'Understand burnout is triggered by capacity <30 for 7+ consecutive days, and how effort and imbalance contribute',
            isOptional: false,
            order: 0,
          },
          {
            id: '2',
            title: 'Monitor Capacity and Effort',
            description: 'Track capacity band and consecutive high effort days',
            instructions: 'Regularly check capacity band (critical/low/medium/high/optimal) and consecutive high effort days count',
            isOptional: false,
            order: 1,
          },
          {
            id: '3',
            title: 'Implement Prevention Strategies',
            description: 'Apply strategies to prevent capacity decay and burnout',
            instructions: 'Plan recovery actions, balance work/recovery ratio, and take breaks before hitting effort thresholds',
            isOptional: false,
            order: 2,
          },
          {
            id: '4',
            title: 'Create Burnout Recovery Plan',
            description: 'Plan for burnout recovery if it occurs',
            instructions: 'Understand recovery actions help exit burnout, and that burnout recovery cannot be rushed',
            isOptional: false,
            order: 3,
          },
        ],
      },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding agents and guides...')

  for (const agentData of agents) {
    const { guides, ...agentInfo } = agentData

    // Create agent
    const agent = await prisma.agent.upsert({
      where: { type: agentInfo.type },
      create: agentInfo,
      update: agentInfo,
    })

    console.log(`✅ Created agent: ${agent.name}`)

    // Create guides for agent
    for (const guideData of guides) {
      const { steps, ...guideInfo } = guideData

      const guide = await prisma.moneyGuide.upsert({
        where: {
          id: `${agent.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
        },
        create: {
          id: `${agent.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
          agentId: agent.id,
          ...guideInfo,
          steps: steps as any,
        },
        update: {
          ...guideInfo,
          steps: steps as any,
        },
      })

      console.log(`  ✅ Created guide: ${guide.title}`)
    }
  }

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
