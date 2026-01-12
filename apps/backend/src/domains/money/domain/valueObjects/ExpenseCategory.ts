/**
 * ExpenseCategory Value Object
 * 
 * Represents a category of monthly expenses with standard recommendations.
 */
export enum ExpenseCategoryType {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  HEALTHCARE = 'HEALTHCARE',
  DEBT_PAYMENTS = 'DEBT_PAYMENTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  PERSONAL_CARE = 'PERSONAL_CARE',
  EDUCATION = 'EDUCATION',
  SAVINGS_INVESTMENTS = 'SAVINGS_INVESTMENTS',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export interface ExpenseCategoryInfo {
  type: ExpenseCategoryType
  name: string
  description: string
  icon: string
  recommendedPercentage?: number // Recommended % of income (e.g., 30% for housing)
  isEssential: boolean // True for essential expenses
  examples: string[]
}

export class ExpenseCategory {
  private static readonly CATEGORY_INFO: Record<ExpenseCategoryType, ExpenseCategoryInfo> = {
    [ExpenseCategoryType.HOUSING]: {
      type: ExpenseCategoryType.HOUSING,
      name: 'Housing',
      description: 'Rent, mortgage, property taxes, maintenance, HOA fees',
      icon: '🏠',
      recommendedPercentage: 30,
      isEssential: true,
      examples: ['Rent/Mortgage', 'Property Taxes', 'Home Insurance', 'Maintenance', 'HOA Fees'],
    },
    [ExpenseCategoryType.FOOD]: {
      type: ExpenseCategoryType.FOOD,
      name: 'Food',
      description: 'Groceries, dining out, takeout, snacks',
      icon: '🍔',
      recommendedPercentage: 10,
      isEssential: true,
      examples: ['Groceries', 'Restaurants', 'Takeout', 'Coffee/Drinks', 'Snacks'],
    },
    [ExpenseCategoryType.TRANSPORTATION]: {
      type: ExpenseCategoryType.TRANSPORTATION,
      name: 'Transportation',
      description: 'Car payments, gas, public transit, parking, maintenance',
      icon: '🚗',
      recommendedPercentage: 15,
      isEssential: true,
      examples: ['Car Payment', 'Gas/Fuel', 'Public Transit', 'Parking', 'Maintenance/Repairs', 'Insurance'],
    },
    [ExpenseCategoryType.UTILITIES]: {
      type: ExpenseCategoryType.UTILITIES,
      name: 'Utilities',
      description: 'Electric, water, gas, internet, phone, trash',
      icon: '💡',
      recommendedPercentage: 5,
      isEssential: true,
      examples: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone', 'Trash/Recycling'],
    },
    [ExpenseCategoryType.INSURANCE]: {
      type: ExpenseCategoryType.INSURANCE,
      name: 'Insurance',
      description: 'Health, life, disability, auto, renters/homeowners insurance',
      icon: '🛡️',
      recommendedPercentage: 10,
      isEssential: true,
      examples: ['Health Insurance', 'Life Insurance', 'Disability Insurance', 'Auto Insurance', 'Renters/Home Insurance'],
    },
    [ExpenseCategoryType.HEALTHCARE]: {
      type: ExpenseCategoryType.HEALTHCARE,
      name: 'Healthcare',
      description: 'Medical bills, prescriptions, doctor visits, dental, vision',
      icon: '🏥',
      recommendedPercentage: 5,
      isEssential: true,
      examples: ['Doctor Visits', 'Prescriptions', 'Dental Care', 'Vision Care', 'Medical Bills'],
    },
    [ExpenseCategoryType.DEBT_PAYMENTS]: {
      type: ExpenseCategoryType.DEBT_PAYMENTS,
      name: 'Debt Payments',
      description: 'Credit cards, student loans, personal loans, other debts',
      icon: '💳',
      recommendedPercentage: 20,
      isEssential: true,
      examples: ['Credit Cards', 'Student Loans', 'Personal Loans', 'Payday Loans', 'Other Debts'],
    },
    [ExpenseCategoryType.ENTERTAINMENT]: {
      type: ExpenseCategoryType.ENTERTAINMENT,
      name: 'Entertainment',
      description: 'Streaming services, hobbies, games, events, subscriptions',
      icon: '🎬',
      recommendedPercentage: 5,
      isEssential: false,
      examples: ['Streaming Services', 'Hobbies', 'Games', 'Events/Concerts', 'Subscriptions'],
    },
    [ExpenseCategoryType.PERSONAL_CARE]: {
      type: ExpenseCategoryType.PERSONAL_CARE,
      name: 'Personal Care',
      description: 'Haircuts, toiletries, clothing, gym memberships',
      icon: '💇',
      recommendedPercentage: 5,
      isEssential: false,
      examples: ['Haircuts', 'Toiletries', 'Clothing', 'Gym Membership', 'Personal Care Products'],
    },
    [ExpenseCategoryType.EDUCATION]: {
      type: ExpenseCategoryType.EDUCATION,
      name: 'Education',
      description: 'Tuition, books, courses, training, professional development',
      icon: '📚',
      recommendedPercentage: 5,
      isEssential: false,
      examples: ['Tuition', 'Books', 'Online Courses', 'Training', 'Professional Development'],
    },
    [ExpenseCategoryType.SAVINGS_INVESTMENTS]: {
      type: ExpenseCategoryType.SAVINGS_INVESTMENTS,
      name: 'Savings & Investments',
      description: 'Emergency fund contributions, retirement savings, investments',
      icon: '💰',
      recommendedPercentage: 20,
      isEssential: false,
      examples: ['Emergency Fund', 'Retirement Savings', 'Investments', 'Sinking Funds'],
    },
    [ExpenseCategoryType.MISCELLANEOUS]: {
      type: ExpenseCategoryType.MISCELLANEOUS,
      name: 'Miscellaneous',
      description: 'Other expenses that don\'t fit into other categories',
      icon: '📦',
      isEssential: false,
      examples: ['Gifts', 'Donations', 'Miscellaneous Purchases'],
    },
  }

  private constructor(public readonly info: ExpenseCategoryInfo) {}

  /**
   * Get category by type
   */
  static getCategory(type: ExpenseCategoryType): ExpenseCategory {
    return new ExpenseCategory(this.CATEGORY_INFO[type])
  }

  /**
   * Get all categories
   */
  static getAllCategories(): ExpenseCategory[] {
    return Object.values(this.CATEGORY_INFO).map(info => new ExpenseCategory(info))
  }

  /**
   * Get essential categories only
   */
  static getEssentialCategories(): ExpenseCategory[] {
    return Object.values(this.CATEGORY_INFO)
      .filter(info => info.isEssential)
      .map(info => new ExpenseCategory(info))
  }

  /**
   * Calculate recommended amount based on monthly income
   */
  calculateRecommended(monthlyIncome: number): number {
    if (!this.info.recommendedPercentage) {
      return 0
    }
    return (monthlyIncome * this.info.recommendedPercentage) / 100
  }

  /**
   * Check if current spending is within recommended range
   */
  isWithinRecommended(currentAmount: number, monthlyIncome: number, tolerance: number = 0.1): boolean {
    if (!this.info.recommendedPercentage) {
      return true
    }
    const recommended = this.calculateRecommended(monthlyIncome)
    const variance = Math.abs(currentAmount - recommended) / recommended
    return variance <= tolerance
  }
}





