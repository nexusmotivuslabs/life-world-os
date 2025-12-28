/**
 * Bible Laws - Data for Money Domain
 * 
 * Biblical principles and teachings applied to money, wealth, and financial stewardship.
 */

export interface PrincipleExample {
  description: string
  impact: 'good' | 'bad' | 'neutral'
}

export interface Principle {
  text: string
  examples?: PrincipleExample[]
}

export interface BibleLawData {
  lawNumber: number
  title: string
  scriptureReference: string
  originalText?: string
  domainApplication: string
  principles: Principle[]
  practicalApplications: string[]
  examples?: string[]
  warnings?: string[]
  relatedVerses?: string[]
  order: number
}

export const moneyDomainBibleLaws: BibleLawData[] = [
  {
    lawNumber: 1,
    title: 'The Love of Money is the Root of All Evil',
    scriptureReference: '1 Timothy 6:10',
    originalText: 'For the love of money is a root of all kinds of evil. Some people, eager for money, have wandered from the faith and pierced themselves with many griefs.',
    domainApplication: 'This principle warns against making money the primary focus of life. When money becomes an idol, it leads to corruption, greed, and destruction. The issue is not money itself, but the love and obsession with it.',
    principles: [
      {
        text: 'Money is a tool, not a master - use it wisely but don\'t serve it',
        examples: [
          {
            description: 'Using income to provide for family needs while maintaining work-life balance',
            impact: 'good'
          },
          {
            description: 'Working 80-hour weeks, sacrificing family time and health to earn more money',
            impact: 'bad'
          },
          {
            description: 'Earning a comfortable income without making money the center of life decisions',
            impact: 'neutral'
          }
        ]
      },
      {
        text: 'Avoid greed and the trap of endless accumulation',
        examples: [
          {
            description: 'Setting financial goals and being satisfied when reaching them',
            impact: 'good'
          },
          {
            description: 'Constantly moving goalposts, never feeling you have "enough"',
            impact: 'bad'
          },
          {
            description: 'Saving for future goals while maintaining current quality of life',
            impact: 'neutral'
          }
        ]
      },
      {
        text: 'Keep money in proper perspective relative to faith, family, and relationships',
        examples: [
          {
            description: 'Declining a promotion that requires relocation to stay close to family and community',
            impact: 'good'
          },
          {
            description: 'Prioritizing career advancement over important relationships and commitments',
            impact: 'bad'
          },
          {
            description: 'Balancing financial goals with relationship and faith commitments',
            impact: 'neutral'
          }
        ]
      },
      {
        text: 'Recognize that true wealth is found in relationships and spiritual growth, not just financial accumulation',
        examples: [
          {
            description: 'Investing time in mentoring others and spiritual development alongside financial growth',
            impact: 'good'
          },
          {
            description: 'Focusing solely on financial metrics while neglecting personal relationships',
            impact: 'bad'
          },
          {
            description: 'Maintaining both financial stability and meaningful relationships',
            impact: 'neutral'
          }
        ]
      }
    ],
    practicalApplications: [
      'Set financial goals but don\'t sacrifice relationships or integrity to achieve them',
      'Regularly evaluate your motivation - are you serving money or using it to serve others?',
      'Give generously to avoid hoarding mentality',
      'Pray and seek wisdom when making major financial decisions'
    ],
    examples: [
      'Many lottery winners end up miserable because money became their focus',
      'Business leaders who prioritize profit over people often lose their reputation and relationships',
      'Those who give generously often report greater life satisfaction than those who hoard'
    ],
    warnings: [
      'Don\'t confuse this with saying money itself is evil - it\'s the love of money that causes problems',
      'Be careful not to judge others\' financial success as inherently wrong',
      'Avoid legalism - having money isn\'t sinful, but making it your god is'
    ],
    relatedVerses: ['Matthew 6:24 - "No one can serve two masters"', 'Ecclesiastes 5:10 - "Whoever loves money never has enough"'],
    order: 1
  },
  {
    lawNumber: 2,
    title: 'The Borrower is Slave to the Lender',
    scriptureReference: 'Proverbs 22:7',
    originalText: 'The rich rule over the poor, and the borrower is slave to the lender.',
    domainApplication: 'Debt creates bondage and limits freedom. While some debt may be necessary, excessive debt enslaves you to creditors and reduces your ability to make choices based on values rather than obligations.',
    principles: [
      {
        text: 'Avoid unnecessary debt - live within your means',
        examples: [
          { description: 'Buying a used car with cash instead of financing a new one you can\'t afford', impact: 'good' },
          { description: 'Using credit cards for daily expenses without ability to pay off monthly', impact: 'bad' },
          { description: 'Using a low-interest mortgage to buy a home within your budget', impact: 'neutral' }
        ]
      },
      {
        text: 'Pay off debts as quickly as possible to regain freedom',
        examples: [
          { description: 'Paying extra on mortgage principal while maintaining emergency fund', impact: 'good' },
          { description: 'Keeping minimum payments while accumulating more debt', impact: 'bad' },
          { description: 'Following standard payment schedule without acceleration', impact: 'neutral' }
        ]
      },
      {
        text: 'If you must borrow, do so wisely and with a plan to repay',
        examples: [
          { description: 'Taking student loans for degree with clear career path and repayment plan', impact: 'good' },
          { description: 'Borrowing without understanding terms or having repayment strategy', impact: 'bad' },
          { description: 'Using business loan for expansion with calculated ROI and repayment timeline', impact: 'neutral' }
        ]
      },
      {
        text: 'Use debt as a tool, not a lifestyle',
        examples: [
          { description: 'Using debt strategically for appreciating assets, avoiding consumer debt', impact: 'good' },
          { description: 'Living paycheck-to-paycheck while carrying credit card balances', impact: 'bad' },
          { description: 'Maintaining manageable debt levels for essential purchases', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Create a debt payoff plan and prioritize high-interest debt',
      'Build an emergency fund to avoid needing debt for unexpected expenses',
      'Use cash or debit for purchases when possible',
      'If borrowing for education or business, ensure the investment will generate returns'
    ],
    examples: [
      'People with high credit card debt often feel trapped and unable to pursue opportunities',
      'Those who pay off mortgages early gain significant financial freedom',
      'Businesses that operate debt-free have more flexibility during economic downturns'
    ],
    warnings: [
      'Some debt (like mortgages or business loans) can be strategic if managed well',
      'Don\'t become so debt-averse that you miss growth opportunities',
      'Balance debt avoidance with wise investment in assets that appreciate'
    ],
    relatedVerses: ['Romans 13:8 - "Let no debt remain outstanding"', 'Deuteronomy 28:12 - "You will lend to many nations but will borrow from none"'],
    order: 2
  },
  {
    lawNumber: 3,
    title: 'Give and It Will Be Given to You',
    scriptureReference: 'Luke 6:38',
    originalText: 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.',
    domainApplication: 'Generosity creates a cycle of blessing. When you give freely, you open yourself to receive. This isn\'t a "prosperity gospel" manipulation, but a principle that generous people often experience abundance in various forms.',
    principles: [
      {
        text: 'Practice regular giving as a financial discipline',
        examples: [
          { description: 'Setting up automatic monthly donations to trusted charities', impact: 'good' },
          { description: 'Never giving or only giving when pressured or reminded', impact: 'bad' },
          { description: 'Giving occasionally when you remember or have extra money', impact: 'neutral' }
        ]
      },
      {
        text: 'Give cheerfully, not reluctantly or under compulsion',
        examples: [
          { description: 'Giving with joy and gratitude for what you\'ve received', impact: 'good' },
          { description: 'Giving with resentment or feeling forced by social pressure', impact: 'bad' },
          { description: 'Giving mechanically without emotional connection', impact: 'neutral' }
        ]
      },
      {
        text: 'Trust that generosity leads to blessing',
        examples: [
          { description: 'Giving faithfully and experiencing increased opportunities and relationships', impact: 'good' },
          { description: 'Refusing to give because you\'re afraid you won\'t have enough', impact: 'bad' },
          { description: 'Giving but not tracking or recognizing the blessings received', impact: 'neutral' }
        ]
      },
      {
        text: 'Give in proportion to what you have received',
        examples: [
          { description: 'Increasing giving percentage as income grows', impact: 'good' },
          { description: 'Giving same small amount regardless of income growth', impact: 'bad' },
          { description: 'Maintaining consistent giving percentage across income levels', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Set up automatic giving to causes you believe in',
      'Give your time, talent, and treasure - not just money',
      'Practice hospitality and generosity in daily life',
      'Support your local church and charitable organizations'
    ],
    examples: [
      'Many successful business leaders credit their success to early habits of giving',
      'Those who tithe often report better financial management overall',
      'Generous communities tend to prosper as resources circulate'
    ],
    warnings: [
      'Don\'t give expecting specific returns - give from the heart',
      'Avoid giving beyond your means and creating financial hardship',
      'Be wise about where you give - ensure organizations are trustworthy'
    ],
    relatedVerses: ['2 Corinthians 9:7 - "God loves a cheerful giver"', 'Proverbs 11:24 - "One person gives freely, yet gains even more"'],
    order: 3
  },
  {
    lawNumber: 4,
    title: 'Honor the Lord with Your Wealth',
    scriptureReference: 'Proverbs 3:9-10',
    originalText: 'Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.',
    domainApplication: 'Prioritize honoring God with your finances before spending on yourself. This "firstfruits" principle means giving first, not giving what\'s left over. This act of faith and priority often leads to financial blessing.',
    principles: [
      {
        text: 'Give first, spend second - prioritize honoring God with your income',
        examples: [
          { description: 'Automatically setting aside tithe and offering before paying other bills', impact: 'good' },
          { description: 'Giving only what\'s left over after all expenses and wants', impact: 'bad' },
          { description: 'Giving regularly but after essential expenses are covered', impact: 'neutral' }
        ]
      },
      {
        text: 'Use your wealth in ways that honor God\'s principles',
        examples: [
          { description: 'Choosing investments and businesses that align with biblical values', impact: 'good' },
          { description: 'Making money through unethical means or supporting harmful industries', impact: 'bad' },
          { description: 'Making financial decisions without considering ethical implications', impact: 'neutral' }
        ]
      },
      {
        text: 'Be a good steward of what God has entrusted to you',
        examples: [
          { description: 'Managing finances wisely, saving, investing, and giving appropriately', impact: 'good' },
          { description: 'Squandering resources or being wasteful with what you\'ve been given', impact: 'bad' },
          { description: 'Managing finances adequately but not strategically', impact: 'neutral' }
        ]
      },
      {
        text: 'Recognize that all wealth ultimately belongs to God',
        examples: [
          { description: 'Holding possessions loosely, ready to use resources for God\'s purposes', impact: 'good' },
          { description: 'Hoarding wealth and viewing it as solely yours to control', impact: 'bad' },
          { description: 'Acknowledging God\'s ownership but not actively stewarding accordingly', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Practice tithing (giving 10%) as a starting point',
      'Give from your first income, not leftover money',
      'Make financial decisions that align with biblical values',
      'Invest in ways that honor God and benefit others'
    ],
    examples: [
      'Many who tithe consistently report financial stability despite income levels',
      'Businesses that operate with biblical principles often build strong reputations',
      'Those who prioritize giving often find they have more than expected'
    ],
    warnings: [
      'Don\'t give mechanically without heart - God values the heart behind giving',
      'This isn\'t a formula to manipulate God for wealth',
      'Amounts vary by individual circumstances - give as you\'re able'
    ],
    relatedVerses: ['Malachi 3:10 - "Bring the whole tithe into the storehouse"', 'Deuteronomy 14:22 - "Be sure to set aside a tenth"'],
    order: 4
  },
  {
    lawNumber: 5,
    title: 'Store Up Treasures in Heaven',
    scriptureReference: 'Matthew 6:19-21',
    originalText: 'Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven... For where your treasure is, there your heart will be also.',
    domainApplication: 'While it\'s wise to save and invest, ultimate security isn\'t found in earthly wealth which can be lost. Invest in eternal things - relationships, character, service to others, and spiritual growth.',
    principles: [
      {
        text: 'Balance earthly savings with eternal investments',
        examples: [
          { description: 'Saving for retirement while also investing time and money in missions and charity', impact: 'good' },
          { description: 'Saving every penny and never giving or serving others', impact: 'bad' },
          { description: 'Saving adequately but not intentionally investing in eternal things', impact: 'neutral' }
        ]
      },
      {
        text: 'Invest in relationships, character, and service, not just financial assets',
        examples: [
          { description: 'Spending time and money on mentoring, relationships, and character development', impact: 'good' },
          { description: 'Focusing only on building financial portfolio while neglecting relationships', impact: 'bad' },
          { description: 'Maintaining relationships without intentional investment in character growth', impact: 'neutral' }
        ]
      },
      {
        text: 'Recognize that earthly wealth is temporary',
        examples: [
          { description: 'Using wealth generously knowing it can be lost, storing up eternal treasures', impact: 'good' },
          { description: 'Living in fear of losing wealth and hoarding excessively', impact: 'bad' },
          { description: 'Acknowledging wealth\'s temporary nature but not acting on that knowledge', impact: 'neutral' }
        ]
      },
      {
        text: 'Let your spending reflect eternal priorities',
        examples: [
          { description: 'Spending more on experiences, relationships, and service than material goods', impact: 'good' },
          { description: 'Spending primarily on status symbols and luxury items', impact: 'bad' },
          { description: 'Spending evenly across categories without clear priority alignment', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Save for retirement but don\'t make it your only focus',
      'Invest in relationships and experiences over material possessions',
      'Use wealth to help others and advance God\'s kingdom',
      'Develop character and wisdom alongside financial growth'
    ],
    examples: [
      'People who prioritize relationships over wealth often report greater life satisfaction',
      'Those who give to missions and charity often feel more fulfilled than those who only accumulate',
      'Legacies built on character and service outlast those built only on money'
    ],
    warnings: [
      'This doesn\'t mean you shouldn\'t save or plan - be wise with earthly resources',
      'Balance is key - provide for your family while investing in eternal things',
      'Don\'t use this as an excuse to avoid financial responsibility'
    ],
    relatedVerses: ['1 Timothy 6:18-19 - "Command them to do good, to be rich in good deeds"', 'Luke 12:33 - "Sell your possessions and give to the poor"'],
    order: 5
  },
  {
    lawNumber: 6,
    title: 'The Plans of the Diligent Lead to Profit',
    scriptureReference: 'Proverbs 21:5',
    originalText: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
    domainApplication: 'Financial success requires planning, diligence, and hard work. Quick schemes and get-rich-quick mentalities lead to loss. Steady, planned effort over time builds lasting wealth.',
    principles: [
      {
        text: 'Create financial plans and stick to them',
        examples: [
          { description: 'Writing down goals, creating budgets, and reviewing progress monthly', impact: 'good' },
          { description: 'Living financially without any plan or goals', impact: 'bad' },
          { description: 'Having a plan but not consistently following it', impact: 'neutral' }
        ]
      },
      {
        text: 'Work diligently and consistently toward financial goals',
        examples: [
          { description: 'Taking consistent action toward goals every month, year after year', impact: 'good' },
          { description: 'Setting goals but rarely taking action or giving up quickly', impact: 'bad' },
          { description: 'Working toward goals sporadically or only when motivated', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid get-rich-quick schemes and shortcuts',
        examples: [
          { description: 'Building wealth through proven methods like investing and business over time', impact: 'good' },
          { description: 'Chasing pyramid schemes, risky day trading, or lottery tickets', impact: 'bad' },
          { description: 'Occasionally trying risky investments while mostly using sound strategies', impact: 'neutral' }
        ]
      },
      {
        text: 'Be patient - wealth building is a marathon, not a sprint',
        examples: [
          { description: 'Staying committed to long-term strategies despite short-term setbacks', impact: 'good' },
          { description: 'Constantly switching strategies or giving up when results aren\'t immediate', impact: 'bad' },
          { description: 'Following strategies but becoming discouraged during slow periods', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Create a budget and financial plan',
      'Set specific, measurable financial goals',
      'Review and adjust your plan regularly',
      'Invest in education and skills that increase earning potential'
    ],
    examples: [
      'Those who create and follow budgets consistently build wealth over time',
      'Businesses with solid business plans outperform those operating without plans',
      'Investors who follow long-term strategies outperform those chasing quick gains'
    ],
    warnings: [
      'Don\'t become so focused on planning that you never take action',
      'Plans should be flexible - adjust as circumstances change',
      'Planning without execution is worthless'
    ],
    relatedVerses: ['Proverbs 13:4 - "The sluggard craves and gets nothing"', 'Proverbs 14:23 - "All hard work brings a profit"'],
    order: 6
  },
  {
    lawNumber: 7,
    title: 'Better a Little with Righteousness Than Much with Injustice',
    scriptureReference: 'Proverbs 16:8',
    originalText: 'Better a little with righteousness than much gain with injustice.',
    domainApplication: 'Financial success gained through unethical means is not true success. It\'s better to have less wealth earned honestly than great wealth gained through corruption, exploitation, or dishonesty.',
    principles: [
      {
        text: 'Always earn money ethically and honestly',
        examples: [
          { description: 'Building business by providing real value and treating all stakeholders fairly', impact: 'good' },
          { description: 'Making money through fraud, exploitation, or deceptive practices', impact: 'bad' },
          { description: 'Earning honestly but not considering broader ethical implications', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid shortcuts that compromise integrity',
        examples: [
          { description: 'Turning down profitable opportunities that require ethical compromise', impact: 'good' },
          { description: 'Taking shortcuts like tax evasion or cutting corners on quality', impact: 'bad' },
          { description: 'Occasionally making questionable decisions for financial gain', impact: 'neutral' }
        ]
      },
      {
        text: 'Treat employees, customers, and partners fairly',
        examples: [
          { description: 'Paying fair wages, honoring contracts, and treating all parties with respect', impact: 'good' },
          { description: 'Exploiting workers, misleading customers, or cheating partners', impact: 'bad' },
          { description: 'Meeting minimum legal requirements but not going beyond', impact: 'neutral' }
        ]
      },
      {
        text: 'Build wealth through value creation, not exploitation',
        examples: [
          { description: 'Creating businesses that solve real problems and benefit communities', impact: 'good' },
          { description: 'Profiting by taking advantage of vulnerable people or situations', impact: 'bad' },
          { description: 'Running business that provides value but primarily focuses on profit', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Pay fair wages and treat employees with respect',
      'Be honest in business dealings and negotiations',
      'Avoid tax evasion or financial deception',
      'Choose business practices that benefit all stakeholders'
    ],
    examples: [
      'Companies with strong ethical practices often have better long-term success',
      'Business leaders who exploit others often face consequences eventually',
      'Those who build wealth ethically sleep better and maintain relationships'
    ],
    warnings: [
      'Ethical decisions may cost money in the short term but pay off long-term',
      'Don\'t confuse ethical business with poor business practices',
      'You can be both ethical and financially successful'
    ],
    relatedVerses: ['Proverbs 10:2 - "Ill-gotten treasures have no lasting value"', 'Proverbs 20:17 - "Food gained by fraud tastes sweet"'],
    order: 7
  },
  {
    lawNumber: 8,
    title: 'A Wise Person Saves for the Future',
    scriptureReference: 'Proverbs 6:6-8',
    originalText: 'Go to the ant, you sluggard; consider its ways and be wise! It has no commander, no overseer or ruler, yet it stores its provisions in summer and gathers its food at harvest.',
    domainApplication: 'The ant teaches us to save during times of abundance to prepare for times of need. Financial wisdom includes saving for emergencies, retirement, and future opportunities.',
    principles: [
      {
        text: 'Save consistently, even small amounts',
        examples: [
          { description: 'Automating savings and saving 20% of income consistently', impact: 'good' },
          { description: 'Never saving or only saving when forced by circumstances', impact: 'bad' },
          { description: 'Saving occasionally when you remember or have extra money', impact: 'neutral' }
        ]
      },
      {
        text: 'Build an emergency fund for unexpected expenses',
        examples: [
          { description: 'Maintaining 6 months of expenses in emergency fund', impact: 'good' },
          { description: 'Having no emergency fund and using debt for unexpected expenses', impact: 'bad' },
          { description: 'Having small emergency fund that covers only minor expenses', impact: 'neutral' }
        ]
      },
      {
        text: 'Save during times of abundance for future needs',
        examples: [
          { description: 'Increasing savings during good financial times to prepare for lean times', impact: 'good' },
          { description: 'Spending all income during good times with no thought for future', impact: 'bad' },
          { description: 'Maintaining same saving rate regardless of income changes', impact: 'neutral' }
        ]
      },
      {
        text: 'Practice delayed gratification for long-term security',
        examples: [
          { description: 'Choosing to save for future goals over immediate wants', impact: 'good' },
          { description: 'Always choosing immediate pleasure over long-term security', impact: 'bad' },
          { description: 'Balancing some immediate wants with some future savings', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Automate savings so you pay yourself first',
      'Build an emergency fund of 3-6 months expenses',
      'Save for retirement consistently throughout your career',
      'Save for major purchases instead of always financing'
    ],
    examples: [
      'Those with emergency funds handle crises without going into debt',
      'People who start saving early for retirement retire comfortably',
      'Businesses that save during good times survive economic downturns'
    ],
    warnings: [
      'Don\'t hoard excessively - balance saving with giving and living',
      'Saving should be proportional to income and circumstances',
      'Don\'t save out of fear - save out of wisdom and stewardship'
    ],
    relatedVerses: ['Proverbs 30:25 - "Ants are creatures of little strength, yet they store up their food in the summer"', 'Proverbs 27:12 - "The prudent see danger and take refuge"'],
    order: 8
  },
  {
    lawNumber: 9,
    title: 'Do Not Withhold Good from Those Who Deserve It',
    scriptureReference: 'Proverbs 3:27',
    originalText: 'Do not withhold good from those to whom it is due, when it is in your power to act.',
    domainApplication: 'When you have the ability to help others financially, do so. This includes paying fair wages promptly, helping those in need, and not delaying payments you owe.',
    principles: [
      {
        text: 'Pay employees and contractors promptly and fairly',
        examples: [
          { description: 'Paying workers on time with fair wages that reflect their value', impact: 'good' },
          { description: 'Delaying payments or underpaying workers to maximize profit', impact: 'bad' },
          { description: 'Paying minimum required but not considering fairness or market rates', impact: 'neutral' }
        ]
      },
      {
        text: 'Help those in genuine need when you have the ability',
        examples: [
          { description: 'Generously helping family, friends, and community members in genuine need', impact: 'good' },
          { description: 'Ignoring needs of others while accumulating wealth', impact: 'bad' },
          { description: 'Helping occasionally but not consistently or systematically', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t delay payments to improve your cash flow at others\' expense',
        examples: [
          { description: 'Paying bills and invoices on time, even when it\'s not required', impact: 'good' },
          { description: 'Intentionally delaying payments to vendors or contractors unnecessarily', impact: 'bad' },
          { description: 'Paying on required dates but not early when possible', impact: 'neutral' }
        ]
      },
      {
        text: 'Use your financial resources to do good',
        examples: [
          { description: 'Directing resources toward charitable causes and helping others', impact: 'good' },
          { description: 'Using wealth only for personal pleasure and accumulation', impact: 'bad' },
          { description: 'Giving some to charity but primarily focusing on personal use', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Pay bills on time, especially to small businesses',
      'Give bonuses and raises when business does well',
      'Support charitable causes that align with your values',
      'Be generous with tips and appreciation gifts'
    ],
    examples: [
      'Businesses that pay promptly build strong vendor relationships',
      'Employers who treat employees generously have lower turnover',
      'Those who help others often receive help when they need it'
    ],
    warnings: [
      'Help wisely - don\'t enable dependency or poor choices',
      'Set boundaries to avoid being taken advantage of',
      'Help should be proportional to your ability'
    ],
    relatedVerses: ['James 2:15-16 - "If a brother or sister is without clothes"', 'Proverbs 19:17 - "Whoever is kind to the poor lends to the Lord"'],
    order: 9
  },
  {
    lawNumber: 10,
    title: 'Wealth Gained Quickly Will Diminish',
    scriptureReference: 'Proverbs 13:11',
    originalText: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.',
    domainApplication: 'Wealth built slowly and honestly tends to last, while wealth gained quickly (through schemes, inheritance without preparation, or dishonesty) often disappears just as fast. Patient, steady wealth-building is more sustainable.',
    principles: [
      {
        text: 'Build wealth gradually through consistent effort',
        examples: [
          { description: 'Investing consistently over decades and building multiple income streams', impact: 'good' },
          { description: 'Expecting to get rich quickly through one big win or scheme', impact: 'bad' },
          { description: 'Building wealth but becoming impatient and switching strategies frequently', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid get-rich-quick schemes and gambling',
        examples: [
          { description: 'Focusing on proven investment strategies and avoiding speculative bets', impact: 'good' },
          { description: 'Spending money on lottery tickets, risky schemes, or gambling', impact: 'bad' },
          { description: 'Occasionally trying risky investments while mostly using sound methods', impact: 'neutral' }
        ]
      },
      {
        text: 'Be patient - real wealth takes time to build',
        examples: [
          { description: 'Staying committed to long-term wealth-building strategies for decades', impact: 'good' },
          { description: 'Giving up on strategies when results don\'t come quickly', impact: 'bad' },
          { description: 'Maintaining strategies but frequently questioning if they\'re working', impact: 'neutral' }
        ]
      },
      {
        text: 'Focus on sustainable income streams over windfalls',
        examples: [
          { description: 'Building businesses and investments that generate ongoing income', impact: 'good' },
          { description: 'Relying on one-time opportunities or hoping for inheritance', impact: 'bad' },
          { description: 'Building some sustainable income but also pursuing one-time opportunities', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Invest consistently in diversified assets over time',
      'Build businesses with solid fundamentals, not quick flips',
      'Develop skills and expertise that create lasting value',
      'Avoid lottery tickets, risky day trading, or pyramid schemes'
    ],
    examples: [
      'Those who invest consistently over decades build significant wealth',
      'Lottery winners often lose their money quickly',
      'Businesses built on solid foundations outlast get-rich-quick ventures'
    ],
    warnings: [
      'Some legitimate opportunities do provide faster returns - evaluate carefully',
      'Inheritance can be good if you\'re prepared to manage it',
      'Don\'t confuse slow building with never taking calculated risks'
    ],
    relatedVerses: ['Proverbs 28:22 - "The stingy are eager to get rich"', 'Proverbs 20:21 - "An inheritance claimed too soon will not be blessed"'],
    order: 10
  },
  {
    lawNumber: 11,
    title: 'Commit Your Plans to the Lord',
    scriptureReference: 'Proverbs 16:3',
    originalText: 'Commit to the Lord whatever you do, and he will establish your plans.',
    domainApplication: 'Include God in your financial planning and decision-making. Seek wisdom through prayer and biblical principles when making financial choices. Trust that God will guide and establish your plans.',
    principles: [
      {
        text: 'Pray about major financial decisions',
        examples: [
          { description: 'Seeking God\'s guidance through prayer before major purchases or investments', impact: 'good' },
          { description: 'Making financial decisions without seeking God\'s wisdom or input', impact: 'bad' },
          { description: 'Praying occasionally but primarily relying on own judgment', impact: 'neutral' }
        ]
      },
      {
        text: 'Seek biblical wisdom when facing financial choices',
        examples: [
          { description: 'Studying what the Bible says about money and applying those principles', impact: 'good' },
          { description: 'Ignoring biblical principles and following worldly financial advice only', impact: 'bad' },
          { description: 'Acknowledging biblical principles but not actively applying them', impact: 'neutral' }
        ]
      },
      {
        text: 'Trust God with your financial future',
        examples: [
          { description: 'Making wise plans while trusting God\'s provision and timing', impact: 'good' },
          { description: 'Worrying constantly about finances and trying to control everything', impact: 'bad' },
          { description: 'Planning financially but struggling with anxiety about the future', impact: 'neutral' }
        ]
      },
      {
        text: 'Include God in your financial planning process',
        examples: [
          { description: 'Regularly reviewing financial plans with prayer and seeking God\'s direction', impact: 'good' },
          { description: 'Creating financial plans without considering God\'s purposes or priorities', impact: 'bad' },
          { description: 'Having financial plans but not regularly seeking God\'s input on them', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Pray before major purchases or investments',
      'Seek wise counsel from godly advisors',
      'Study what the Bible says about money and stewardship',
      'Make financial decisions in alignment with God\'s principles'
    ],
    examples: [
      'Those who seek God\'s guidance often make better financial decisions',
      'Businesses operated with prayer and biblical principles often prosper',
      'People who commit finances to God report greater peace and less anxiety'
    ],
    warnings: [
      'This doesn\'t mean God will make you rich - His ways are higher',
      'Don\'t use this as an excuse to avoid planning and hard work',
      'God\'s "establishment" may look different than you expect'
    ],
    relatedVerses: ['Proverbs 3:5-6 - "Trust in the Lord with all your heart"', 'James 1:5 - "If any of you lacks wisdom, you should ask God"'],
    order: 11
  },
  {
    lawNumber: 12,
    title: 'One Who Increases Wealth by Exorbitant Interest',
    scriptureReference: 'Proverbs 28:8',
    originalText: 'Whoever increases wealth by taking interest or profit from the poor amasses it for another, who will be kind to the poor.',
    domainApplication: 'Exploiting the poor through high interest rates, unfair pricing, or predatory lending is wrong. Such wealth doesn\'t last and often passes to those who treat others better. Charge fair rates and treat all customers justly.',
    principles: [
      {
        text: 'Charge fair interest rates, don\'t exploit those in need',
        examples: [
          { description: 'Charging reasonable interest rates that cover costs and provide fair return', impact: 'good' },
          { description: 'Charging exorbitant interest rates that trap borrowers in debt', impact: 'bad' },
          { description: 'Charging market rates without considering borrower circumstances', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t take advantage of vulnerable people financially',
        examples: [
          { description: 'Refusing to exploit vulnerable customers even when legally allowed', impact: 'good' },
          { description: 'Targeting vulnerable people with unfair terms and predatory practices', impact: 'bad' },
          { description: 'Not targeting vulnerable people but not going extra mile to help them', impact: 'neutral' }
        ]
      },
      {
        text: 'Operate businesses that serve customers fairly',
        examples: [
          { description: 'Building business model that benefits both company and customers', impact: 'good' },
          { description: 'Prioritizing profit over customer welfare and fairness', impact: 'bad' },
          { description: 'Meeting legal requirements but not exceeding them for customer benefit', impact: 'neutral' }
        ]
      },
      {
        text: 'Wealth gained through exploitation doesn\'t last',
        examples: [
          { description: 'Building wealth through fair practices that create lasting success', impact: 'good' },
          { description: 'Exploiting others for quick profit, losing reputation and business', impact: 'bad' },
          { description: 'Using some unfair practices while mostly operating fairly', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Avoid payday loans and high-interest credit products',
      'Charge fair prices, especially to those with less',
      'If lending, use reasonable interest rates',
      'Support fair lending practices and financial inclusion'
    ],
    examples: [
      'Predatory lenders often face regulatory consequences',
      'Businesses that exploit customers lose reputation and customers',
      'Financial institutions with fair practices build lasting success'
    ],
    warnings: [
      'Reasonable interest is not exploitation - businesses need to cover costs',
      'Risk-based pricing can be fair - evaluate case by case',
      'Don\'t confuse fair business practices with charity'
    ],
    relatedVerses: ['Exodus 22:25 - "If you lend money to one of my people among you who is needy"', 'Ezekiel 18:8 - "He does not lend to them at interest"'],
    order: 12
  },
  {
    lawNumber: 13,
    title: 'A Good Person Leaves an Inheritance',
    scriptureReference: 'Proverbs 13:22',
    originalText: 'A good person leaves an inheritance for their children\'s children, but a sinner\'s wealth is stored up for the righteous.',
    domainApplication: 'Building wealth to pass to future generations is a good goal. This requires wise financial management, long-term planning, and teaching the next generation how to handle wealth responsibly.',
    principles: [
      {
        text: 'Plan to pass wealth to future generations',
        examples: [
          { description: 'Creating estate plans, wills, and trusts to pass wealth responsibly', impact: 'good' },
          { description: 'Spending everything with no thought for future generations', impact: 'bad' },
          { description: 'Hoping to leave something but not making formal plans', impact: 'neutral' }
        ]
      },
      {
        text: 'Teach children financial wisdom and responsibility',
        examples: [
          { description: 'Teaching kids about money, saving, giving, and investing from early age', impact: 'good' },
          { description: 'Keeping children ignorant about finances or spoiling them with money', impact: 'bad' },
          { description: 'Teaching some financial concepts but not comprehensive financial education', impact: 'neutral' }
        ]
      },
      {
        text: 'Build wealth that can bless multiple generations',
        examples: [
          { description: 'Building substantial wealth and teaching heirs to steward it well', impact: 'good' },
          { description: 'Building wealth but not preparing heirs, leading to squandering', impact: 'bad' },
          { description: 'Building moderate wealth but not thinking about multi-generational impact', impact: 'neutral' }
        ]
      },
      {
        text: 'Manage money well to leave a positive legacy',
        examples: [
          { description: 'Using wealth to bless others and teaching values alongside money', impact: 'good' },
          { description: 'Leaving wealth but not values, causing conflict and waste', impact: 'bad' },
          { description: 'Leaving money without much thought about legacy or values', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Create estate plans and wills',
      'Teach children about money, saving, and giving',
      'Build generational wealth through wise investments',
      'Consider trusts and other tools for wealth transfer'
    ],
    examples: [
      'Families that teach financial literacy create multi-generational wealth',
      'Those who plan estates avoid probate and family conflicts',
      'Businesses passed to well-prepared children often continue successfully'
    ],
    warnings: [
      'Don\'t hoard excessively in the name of inheritance',
      'Balance leaving an inheritance with living generously now',
      'Prepared heirs are more important than large inheritances'
    ],
    relatedVerses: ['Proverbs 19:14 - "Houses and wealth are inherited from parents"', '2 Corinthians 12:14 - "Parents should save up for their children"'],
    order: 13
  },
  {
    lawNumber: 14,
    title: 'The Worker Deserves Their Wages',
    scriptureReference: '1 Timothy 5:18',
    originalText: 'For Scripture says, "Do not muzzle an ox while it is treading out the grain," and "The worker deserves their wages."',
    domainApplication: 'Fair compensation for work is a biblical principle. Employers should pay fair wages, and workers should do their best work. Both parties should honor their financial agreements.',
    principles: [
      {
        text: 'Pay fair wages that reflect the value of work',
        examples: [
          { description: 'Paying competitive wages that recognize employee value and contribution', impact: 'good' },
          { description: 'Paying minimum wage when you can afford more, exploiting workers', impact: 'bad' },
          { description: 'Paying market rates without considering if they\'re truly fair', impact: 'neutral' }
        ]
      },
      {
        text: 'Do your best work and earn your pay',
        examples: [
          { description: 'Giving full effort and value, exceeding expectations in your work', impact: 'good' },
          { description: 'Doing minimal work or slacking off while still expecting full pay', impact: 'bad' },
          { description: 'Doing adequate work that meets requirements but doesn\'t exceed them', impact: 'neutral' }
        ]
      },
      {
        text: 'Honor employment agreements and contracts',
        examples: [
          { description: 'Fulfilling all terms of employment agreements and contracts faithfully', impact: 'good' },
          { description: 'Violating contracts or agreements when it benefits you', impact: 'bad' },
          { description: 'Meeting basic contract terms but not going beyond agreement', impact: 'neutral' }
        ]
      },
      {
        text: 'Compensate work fairly and promptly',
        examples: [
          { description: 'Paying workers fairly and on time, even early when possible', impact: 'good' },
          { description: 'Delaying payments or underpaying workers unnecessarily', impact: 'bad' },
          { description: 'Paying required amounts on required dates but not going beyond', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Research market rates and pay competitively',
      'Give raises and bonuses when appropriate',
      'Do quality work that deserves the compensation',
      'Negotiate fair pay without greed or exploitation'
    ],
    examples: [
      'Companies that pay well attract and retain better talent',
      'Employees who work diligently advance and earn more',
      'Fair compensation builds trust and loyalty in relationships'
    ],
    warnings: [
      'Fair doesn\'t always mean equal - pay based on value and contribution',
      'Don\'t use this to justify excessive executive pay',
      'Balance fair pay with business sustainability'
    ],
    relatedVerses: ['Leviticus 19:13 - "Do not hold back the wages of a hired worker overnight"', 'Colossians 4:1 - "Masters, provide your slaves with what is right and fair"'],
    order: 14
  },
  {
    lawNumber: 15,
    title: 'Do Not Co-Sign for Debts You Cannot Afford',
    scriptureReference: 'Proverbs 22:26-27',
    originalText: 'Do not be one who shakes hands in pledge or puts up security for debts; if you lack the means to pay, your very bed will be snatched from under you.',
    domainApplication: 'Co-signing loans puts you at risk for others\' debts. Only co-sign if you can afford to pay the full amount yourself. Be very cautious about financial guarantees for others.',
    principles: [
      {
        text: 'Avoid co-signing loans unless you can pay them yourself',
        examples: [
          { description: 'Only co-signing when you can fully cover the debt if borrower defaults', impact: 'good' },
          { description: 'Co-signing loans you cannot afford, risking your own financial stability', impact: 'bad' },
          { description: 'Co-signing occasionally without fully evaluating ability to cover debt', impact: 'neutral' }
        ]
      },
      {
        text: 'Be very selective about financial guarantees',
        examples: [
          { description: 'Carefully evaluating each request and only guaranteeing when appropriate', impact: 'good' },
          { description: 'Guaranteeing loans or debts without careful consideration', impact: 'bad' },
          { description: 'Making guarantees based on relationship rather than financial capacity', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t put your financial security at risk for others',
        examples: [
          { description: 'Helping others financially within your means without risking your security', impact: 'good' },
          { description: 'Sacrificing your own financial stability to help others', impact: 'bad' },
          { description: 'Taking moderate risks to help others that may impact your finances', impact: 'neutral' }
        ]
      },
      {
        text: 'Help others in ways that don\'t endanger your own finances',
        examples: [
          { description: 'Giving gifts or providing guidance instead of co-signing risky loans', impact: 'good' },
          { description: 'Co-signing or guaranteeing debts that put your finances at risk', impact: 'bad' },
          { description: 'Providing some help but not addressing root cause of financial need', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Say no to co-signing requests you cannot afford',
      'If you must help, consider giving a gift instead of co-signing',
      'Help others find alternatives to loans they cannot afford alone',
      'Protect your own financial foundation first'
    ],
    examples: [
      'Many co-signers end up paying debts they didn\'t create',
      'Parents who co-sign student loans often struggle in retirement',
      'Those who avoid co-signing maintain financial independence'
    ],
    warnings: [
      'Sometimes helping family may be appropriate - evaluate carefully',
      'There\'s a difference between co-signing and giving gifts',
      'Don\'t become so protective that you never help others'
    ],
    relatedVerses: ['Proverbs 6:1-5 - "My son, if you have put up security for your neighbor"', 'Proverbs 17:18 - "One who has no sense shakes hands in pledge"'],
    order: 15
  }
  // Note: This is a sample of 15 Bible laws for the money domain.
  // You can expand this to include more biblical principles about money, wealth, and stewardship.
]

