/**
 * Bible Laws - Data for Investment Domain
 * 
 * Biblical principles and teachings applied to investing, wealth building, and stewardship of capital.
 */

import { BibleLawData } from './bibleLawsData.js'

export const investmentDomainBibleLaws: BibleLawData[] = [
  {
    lawNumber: 1,
    title: 'Diversify Your Investments',
    scriptureReference: 'Ecclesiastes 11:2',
    originalText: 'Give portions to seven, yes to eight, for you do not know what disaster may come upon the land.',
    domainApplication: 'Don\'t put all your investments in one place. Diversification protects against unexpected losses and aligns with biblical wisdom about not knowing what the future holds.',
    principles: [
      {
        text: 'Spread investments across different asset classes and sectors',
        examples: [
          { description: 'Investing in stocks, bonds, real estate, and commodities across different industries', impact: 'good' },
          { description: 'Putting all money in one stock or one type of investment', impact: 'bad' },
          { description: 'Investing in multiple stocks but all in the same sector', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t know what disaster may come - prepare for uncertainty',
        examples: [
          { description: 'Building portfolio that can weather different economic conditions', impact: 'good' },
          { description: 'Assuming one investment strategy will always work regardless of circumstances', impact: 'bad' },
          { description: 'Having some diversification but not planning for major economic shifts', impact: 'neutral' }
        ]
      },
      {
        text: 'Give portions to multiple investments rather than one',
        examples: [
          { description: 'Allocating investments across 7-8+ different asset classes or strategies', impact: 'good' },
          { description: 'Concentrating wealth in 1-2 investments hoping for maximum return', impact: 'bad' },
          { description: 'Diversifying into 3-4 investments without broader asset allocation', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Use index funds or ETFs to achieve broad diversification',
      'Allocate across stocks, bonds, real estate, and alternative investments',
      'Consider geographic diversification (domestic and international)',
      'Rebalance portfolio periodically to maintain diversification'
    ],
    examples: [
      'Portfolios diversified across asset classes recover better from market downturns',
      'Investors who concentrated in single stocks during dot-com bubble lost everything',
      'Those who diversified across sectors and asset classes maintained wealth through various economic cycles'
    ],
    warnings: [
      'Diversification doesn\'t eliminate risk, it manages it',
      'Over-diversification can dilute returns - balance is key',
      'Don\'t diversify just to diversify - each investment should have purpose'
    ],
    relatedVerses: ['Proverbs 27:12 - "The prudent see danger and take refuge"', 'Proverbs 22:3 - "The prudent see danger and take cover"'],
    order: 1
  },
  {
    lawNumber: 2,
    title: 'Invest What You Can Afford to Lose',
    scriptureReference: 'Luke 14:28-30',
    originalText: 'Suppose one of you wants to build a tower. Won\'t you first sit down and estimate the cost to see if you have enough money to complete it? For if you lay the foundation and are not able to finish it, everyone who sees it will ridicule you.',
    domainApplication: 'Only invest money you can afford to lose. Count the cost before investing. Never invest emergency funds or money needed for essential expenses.',
    principles: [
      {
        text: 'Count the cost before investing - estimate what you can afford',
        examples: [
          { description: 'Calculating investment capacity after covering expenses, emergency fund, and debt payments', impact: 'good' },
          { description: 'Investing money needed for next month\'s bills or mortgage payment', impact: 'bad' },
          { description: 'Investing without clear calculation of available funds', impact: 'neutral' }
        ]
      },
      {
        text: 'Never invest emergency funds or essential expense money',
        examples: [
          { description: 'Keeping 6 months expenses in emergency fund before investing surplus', impact: 'good' },
          { description: 'Using emergency fund for investment opportunities hoping to make quick returns', impact: 'bad' },
          { description: 'Investing while maintaining minimal emergency fund', impact: 'neutral' }
        ]
      },
      {
        text: 'Invest only money you can afford to lose completely',
        examples: [
          { description: 'Investing discretionary income while maintaining financial security', impact: 'good' },
          { description: 'Borrowing money or using credit to invest', impact: 'bad' },
          { description: 'Investing all savings without keeping buffer for unexpected needs', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Build emergency fund first (3-6 months expenses)',
      'Pay off high-interest debt before aggressive investing',
      'Invest only disposable income after covering all expenses',
      'Never invest money needed for upcoming major expenses'
    ],
    examples: [
      'Investors who lost emergency funds in 2008 crash faced severe financial hardship',
      'Those who invested only surplus funds maintained stability during market downturns',
      'Counting the cost prevents panic selling during market volatility'
    ],
    warnings: [
      'This doesn\'t mean you shouldn\'t invest - it means invest wisely',
      'Don\'t be so conservative you miss growth opportunities',
      'Balance security with reasonable investment risk'
    ],
    relatedVerses: ['Proverbs 21:5 - "The plans of the diligent lead to profit"', 'Proverbs 27:12 - "The prudent see danger and take refuge"'],
    order: 2
  },
  {
    lawNumber: 3,
    title: 'Seek Wise Counsel in Investments',
    scriptureReference: 'Proverbs 15:22',
    originalText: 'Plans fail for lack of counsel, but with many advisers they succeed.',
    domainApplication: 'Don\'t make investment decisions alone. Seek advice from multiple wise, experienced advisors. Avoid following single sources or making emotional decisions.',
    principles: [
      {
        text: 'Get counsel from many advisors before major investment decisions',
        examples: [
          { description: 'Consulting financial advisor, accountant, and experienced investors before major moves', impact: 'good' },
          { description: 'Making investment decisions based on one person\'s advice or social media tip', impact: 'bad' },
          { description: 'Getting advice from one advisor without seeking additional perspectives', impact: 'neutral' }
        ]
      },
      {
        text: 'Plans succeed with many advisers - diversify your sources of wisdom',
        examples: [
          { description: 'Gathering input from advisors with different expertise and perspectives', impact: 'good' },
          { description: 'Only listening to advisors who confirm your existing biases', impact: 'bad' },
          { description: 'Seeking advice but only from similar types of advisors', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid emotional or impulsive investment decisions',
        examples: [
          { description: 'Waiting for advisor input and careful analysis before investing', impact: 'good' },
          { description: 'Making investment decisions based on fear, greed, or FOMO', impact: 'bad' },
          { description: 'Getting advice but still making decisions impulsively', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Work with certified financial planners or investment advisors',
      'Join investment clubs or communities for peer learning',
      'Read books and resources from multiple investment perspectives',
      'Pray and seek God\'s wisdom before major investment decisions'
    ],
    examples: [
      'Investors who sought counsel avoided major losses during market bubbles',
      'Those who followed single source advice often fell for scams or bad investments',
      'Having multiple advisors helped identify risks and opportunities others missed'
    ],
    warnings: [
      'Be careful - not all advisors are wise or have your best interests',
      'Don\'t become paralyzed by too much conflicting advice',
      'Ultimately, you must make your own decisions with wisdom'
    ],
    relatedVerses: ['Proverbs 11:14 - "For lack of guidance a nation falls, but victory is won through many advisers"', 'Proverbs 19:20 - "Listen to advice and accept discipline"'],
    order: 3
  },
  {
    lawNumber: 4,
    title: 'Build Wealth Gradually Through Steady Investment',
    scriptureReference: 'Proverbs 13:11',
    originalText: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.',
    domainApplication: 'Invest consistently over time. Wealth built gradually through steady investing tends to last. Avoid get-rich-quick schemes and focus on long-term growth.',
    principles: [
      {
        text: 'Gather money little by little - invest consistently over time',
        examples: [
          { description: 'Setting up automatic monthly investments regardless of market conditions', impact: 'good' },
          { description: 'Only investing when you feel confident or markets are rising', impact: 'bad' },
          { description: 'Investing regularly but stopping during market downturns', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid dishonest money or quick schemes - they dwindle away',
        examples: [
          { description: 'Building wealth through proven investment strategies over decades', impact: 'good' },
          { description: 'Chasing hot stocks, crypto pumps, or get-rich-quick schemes', impact: 'bad' },
          { description: 'Mostly steady investing but occasionally trying speculative bets', impact: 'neutral' }
        ]
      },
      {
        text: 'Focus on long-term growth through steady accumulation',
        examples: [
          { description: 'Staying invested for 20+ years through market cycles', impact: 'good' },
          { description: 'Constantly trading, switching strategies, or timing the market', impact: 'bad' },
          { description: 'Investing long-term but becoming anxious during short-term volatility', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Set up dollar-cost averaging (automatic monthly investments)',
      'Invest in broad market index funds for steady long-term growth',
      'Avoid day trading or frequent portfolio changes',
      'Think in decades, not days or months'
    ],
    examples: [
      'Investors who consistently invested small amounts over 30 years built significant wealth',
      'Those who chased hot investments and constantly switched strategies underperformed',
      'Steady, consistent investing outperforms trying to time the market'
    ],
    warnings: [
      'This doesn\'t mean never adjust your strategy - rebalance periodically',
      'Don\'t become so passive you ignore major life changes',
      'Balance steady investing with occasional strategic adjustments'
    ],
    relatedVerses: ['Proverbs 21:5 - "The plans of the diligent lead to profit"', 'Ecclesiastes 7:8 - "The end of a matter is better than its beginning"'],
    order: 4
  },
  {
    lawNumber: 5,
    title: 'Don\'t Put Trust in Riches',
    scriptureReference: '1 Timothy 6:17',
    originalText: 'Command those who are rich in this present world not to be arrogant nor to put their hope in wealth, which is so uncertain, but to put their hope in God, who richly provides us with everything for our enjoyment.',
    domainApplication: 'Invest wisely, but don\'t put your ultimate trust in investments or wealth. Wealth is uncertain and can be lost. Put your hope in God, not in your portfolio.',
    principles: [
      {
        text: 'Don\'t be arrogant about wealth - it\'s uncertain and can be lost',
        examples: [
          { description: 'Investing wisely while maintaining humility and recognizing wealth\'s uncertainty', impact: 'good' },
          { description: 'Becoming prideful and overconfident when investments perform well', impact: 'bad' },
          { description: 'Investing without considering how wealth might affect character', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t put hope in wealth - put hope in God',
        examples: [
          { description: 'Trusting God for security while being wise steward of investments', impact: 'good' },
          { description: 'Relying solely on investment returns for sense of security and purpose', impact: 'bad' },
          { description: 'Balancing investment planning with faith but not fully integrating them', impact: 'neutral' }
        ]
      },
      {
        text: 'Recognize wealth is uncertain - don\'t base identity on portfolio value',
        examples: [
          { description: 'Maintaining identity and relationships independent of investment performance', impact: 'good' },
          { description: 'Defining self-worth by portfolio value and becoming devastated in downturns', impact: 'bad' },
          { description: 'Feeling good when investments do well but anxious when they decline', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Invest with wisdom but trust God for ultimate security',
      'Don\'t check portfolio obsessively or base mood on market performance',
      'Use wealth to bless others, not just accumulate more',
      'Pray about investment decisions and seek God\'s guidance'
    ],
    examples: [
      'Investors who trusted God maintained peace during 2008 financial crisis',
      'Those who put hope in wealth experienced deep anxiety and depression when markets crashed',
      'Keeping proper perspective on wealth leads to better decision-making and peace'
    ],
    warnings: [
      'This doesn\'t mean don\'t invest - it means invest with proper perspective',
      'Don\'t use this as excuse for poor financial stewardship',
      'Balance faith with wise financial planning'
    ],
    relatedVerses: ['Matthew 6:19-21 - "Do not store up treasures on earth"', 'Proverbs 23:4-5 - "Do not wear yourself out to get rich"'],
    order: 5
  },
  {
    lawNumber: 6,
    title: 'Invest in What You Understand',
    scriptureReference: 'Proverbs 14:15',
    originalText: 'The simple believe anything, but the prudent give thought to their steps.',
    domainApplication: 'Don\'t invest in things you don\'t understand. The prudent think carefully before investing. If you can\'t explain how an investment works, don\'t invest in it.',
    principles: [
      {
        text: 'The prudent give thought - research and understand before investing',
        examples: [
          { description: 'Spending time learning about investments before putting money in', impact: 'good' },
          { description: 'Investing in complex products without understanding how they work', impact: 'bad' },
          { description: 'Investing based on basic understanding without deeper research', impact: 'neutral' }
        ]
      },
      {
        text: 'Don\'t be simple - believe anything without verification',
        examples: [
          { description: 'Verifying claims and doing due diligence before investing', impact: 'good' },
          { description: 'Investing based solely on advertisements, tips, or promises', impact: 'bad' },
          { description: 'Getting some information but not fully verifying investment claims', impact: 'neutral' }
        ]
      },
      {
        text: 'If you can\'t explain it, don\'t invest in it',
        examples: [
          { description: 'Only investing in assets and strategies you can clearly explain to others', impact: 'good' },
          { description: 'Investing in complex derivatives, options, or products you don\'t understand', impact: 'bad' },
          { description: 'Investing in things you somewhat understand but not deeply', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Start with simple investments like index funds before complex strategies',
      'Read prospectuses, do research, and ask questions before investing',
      'Avoid investments that advisors can\'t explain clearly',
      'Learn continuously about investing but stay within your knowledge zone'
    ],
    examples: [
      'Investors who understood their investments made better decisions during volatility',
      'Those who invested in complex products they didn\'t understand lost money in 2008',
      'Sticking to understood investments prevents panic selling and poor decisions'
    ],
    warnings: [
      'This doesn\'t mean never learn new investment strategies',
      'Don\'t become so conservative you miss good opportunities',
      'Balance understanding with reasonable exploration of new investments'
    ],
    relatedVerses: ['Proverbs 18:15 - "The heart of the discerning acquires knowledge"', 'Proverbs 22:3 - "The prudent see danger and take cover"'],
    order: 6
  },
  {
    lawNumber: 7,
    title: 'Store Up for Future Generations',
    scriptureReference: 'Proverbs 13:22',
    originalText: 'A good person leaves an inheritance for their children\'s children, but a sinner\'s wealth is stored up for the righteous.',
    domainApplication: 'Invest with future generations in mind. Build wealth that can bless your children and grandchildren. This requires long-term thinking and disciplined investing.',
    principles: [
      {
        text: 'Leave inheritance for children\'s children - think multi-generationally',
        examples: [
          { description: 'Creating investment plans that benefit multiple future generations', impact: 'good' },
          { description: 'Spending all wealth with no thought for future generations', impact: 'bad' },
          { description: 'Planning to leave something but not specifically for grandchildren', impact: 'neutral' }
        ]
      },
      {
        text: 'Build wealth through good stewardship and righteous means',
        examples: [
          { description: 'Building wealth ethically and teaching heirs to steward it well', impact: 'good' },
          { description: 'Accumulating wealth through exploitation or unethical means', impact: 'bad' },
          { description: 'Building wealth but not preparing heirs to manage it', impact: 'neutral' }
        ]
      },
      {
        text: 'Invest for long-term generational impact',
        examples: [
          { description: 'Investing in assets that appreciate over decades and benefit heirs', impact: 'good' },
          { description: 'Focusing only on short-term gains without long-term planning', impact: 'bad' },
          { description: 'Investing long-term but not specifically considering generational impact', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Create estate plans and trusts for wealth transfer',
      'Teach children about investing and financial stewardship',
      'Invest in appreciating assets rather than depreciating ones',
      'Consider tax-efficient strategies for generational wealth transfer'
    ],
    examples: [
      'Families who invested for generations built lasting legacies',
      'Those who spent everything left nothing for future generations',
      'Multi-generational thinking leads to more thoughtful investment decisions'
    ],
    warnings: [
      'Don\'t hoard excessively - balance saving with living and giving',
      'Prepared heirs are more important than large inheritances',
      'Don\'t become so focused on legacy you neglect current needs'
    ],
    relatedVerses: ['Proverbs 19:14 - "Houses and wealth are inherited from parents"', '2 Corinthians 12:14 - "Parents should save up for their children"'],
    order: 7
  },
  {
    lawNumber: 8,
    title: 'Avoid Greed in Investing',
    scriptureReference: 'Proverbs 28:25',
    originalText: 'The greedy stir up conflict, but those who trust in the Lord will prosper.',
    domainApplication: 'Greed leads to poor investment decisions. Trusting in the Lord and avoiding greed leads to better outcomes. Don\'t let greed drive your investment strategy.',
    principles: [
      {
        text: 'The greedy stir up conflict - greed damages relationships and judgment',
        examples: [
          { description: 'Investing with contentment and reasonable expectations', impact: 'good' },
          { description: 'Making investment decisions driven by insatiable desire for more', impact: 'bad' },
          { description: 'Investing with some greed mixed with reasonable goals', impact: 'neutral' }
        ]
      },
      {
        text: 'Trust in the Lord - not in investment returns or wealth',
        examples: [
          { description: 'Trusting God while being wise steward of investments', impact: 'good' },
          { description: 'Relying on investments to provide what only God can provide', impact: 'bad' },
          { description: 'Balancing trust in God with reliance on investment returns', impact: 'neutral' }
        ]
      },
      {
        text: 'Avoid investment strategies driven by greed',
        examples: [
          { description: 'Following investment plans based on wisdom, not greed', impact: 'good' },
          { description: 'Chasing highest returns regardless of risk or ethics', impact: 'bad' },
          { description: 'Seeking good returns but occasionally making greedy decisions', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Set reasonable investment return expectations',
      'Avoid get-rich-quick schemes and excessive risk-taking',
      'Don\'t invest in unethical companies just for higher returns',
      'Be content with steady, long-term growth rather than trying to beat the market'
    ],
    examples: [
      'Investors who avoided greed made steadier, more consistent returns',
      'Those driven by greed often took excessive risks and lost everything',
      'Contentment in investing leads to better long-term decision-making'
    ],
    warnings: [
      'This doesn\'t mean don\'t seek good returns - it means avoid greed',
      'Don\'t confuse greed with reasonable financial goals',
      'Balance contentment with growth-oriented investing'
    ],
    relatedVerses: ['1 Timothy 6:10 - "The love of money is a root of all kinds of evil"', 'Proverbs 15:27 - "The greedy bring ruin to their households"'],
    order: 8
  }
]


