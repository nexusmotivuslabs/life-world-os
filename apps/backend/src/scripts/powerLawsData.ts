/**
 * 48 Laws of Power - Data for Money Domain
 * Complete list of all 48 laws with financial applications
 */

import { PowerLawDomain } from '@prisma/client'

export interface PowerLawData {
  lawNumber: number
  title: string
  originalDescription: string
  domainApplication: string
  strategies: string[]
  examples?: string[]
  warnings?: string[]
  counterStrategies?: string[]
  order: number
}

export const moneyDomainPowerLaws: PowerLawData[] = [
  {
    lawNumber: 1,
    title: 'Never Outshine the Master',
    originalDescription: 'Make your masters appear more brilliant than they are and you will attain the heights of power.',
    domainApplication: 'In financial contexts, never make your financial advisor, accountant, or mentor feel inferior. Let them take credit for your success to maintain access to their knowledge and networks.',
    strategies: [
      'Attribute financial wins to your advisors\' guidance',
      'Let mentors take public credit while you secure private benefits',
      'In negotiations, let the other party feel they\'re winning while you get what you need'
    ],
    examples: ['Warren Buffett credits Benjamin Graham publicly while building his own empire'],
    warnings: ['Don\'t become subservient - maintain financial independence'],
    counterStrategies: ['Verify advice independently even from trusted advisors'],
    order: 1
  },
  {
    lawNumber: 2,
    title: 'Never Put Too Much Trust in Friends, Learn How to Use Enemies',
    originalDescription: 'Be wary of friends—they will betray you more quickly, for they are easily aroused to envy.',
    domainApplication: 'Keep money separate from friendships. Business partnerships with friends often fail. Former competitors can become valuable allies in financial ventures.',
    strategies: [
      'Keep personal friendships separate from business decisions',
      'Choose business partners based on complementary skills, not friendship',
      'Use contracts and legal structures even with friends'
    ],
    warnings: ['This doesn\'t mean distrusting everyone - maintain healthy professional relationships'],
    order: 2
  },
  {
    lawNumber: 3,
    title: 'Conceal Your Intentions',
    originalDescription: 'Keep people off-balance and in the dark by never revealing the purpose behind your actions.',
    domainApplication: 'In negotiations and business deals, keep your true financial goals and limits private. Revealing your budget or strategy gives others power over you.',
    strategies: [
      'Never reveal your maximum budget in negotiations',
      'Keep investment strategies private until after execution',
      'Let others reveal their position first while you maintain flexibility'
    ],
    warnings: ['Maintain honesty in legally binding agreements', 'Full disclosure is necessary with trusted advisors'],
    order: 3
  },
  {
    lawNumber: 4,
    title: 'Always Say Less Than Necessary',
    originalDescription: 'The more you say, the more common you appear. Powerful people impress by saying less.',
    domainApplication: 'In financial discussions and negotiations, speak sparingly. Let others fill the silence - they often reveal valuable information.',
    strategies: [
      'State your number in negotiations and remain silent',
      'Give brief, non-committal answers about investments',
      'Listen more than you speak in business meetings'
    ],
    warnings: ['Don\'t be rude - maintain professional courtesy', 'Some contexts require effective communication'],
    order: 4
  },
  {
    lawNumber: 5,
    title: 'So Much Depends on Reputation—Guard It with Your Life',
    originalDescription: 'Reputation is the cornerstone of power. Through reputation alone you can intimidate and win.',
    domainApplication: 'Your financial reputation directly impacts your ability to make money. A strong reputation opens doors to opportunities, partnerships, and investments.',
    strategies: [
      'Always pay debts on time, even if it requires sacrifice',
      'Deliver on financial commitments even when inconvenient',
      'Build a track record of successful investments'
    ],
    warnings: ['Don\'t become obsessed with reputation at the expense of results'],
    order: 5
  },
  {
    lawNumber: 6,
    title: 'Court Attention at All Costs',
    originalDescription: 'Everything is judged by its appearance. Stand out. Make yourself a magnet of attention.',
    domainApplication: 'In finance, visibility leads to opportunity. Successful investors and entrepreneurs are known. Build your personal brand in finance.',
    strategies: [
      'Build a strong LinkedIn presence showcasing financial expertise',
      'Publish financial insights through blogs or social media',
      'Speak at financial conferences and networking events'
    ],
    warnings: ['Don\'t seek attention through controversy', 'Ensure your public persona matches reality'],
    order: 6
  },
  {
    lawNumber: 7,
    title: 'Get Others to Do the Work for You, but Always Take the Credit',
    originalDescription: 'Use the wisdom and knowledge of other people to further your own cause.',
    domainApplication: 'Leverage the expertise of financial advisors, accountants, and lawyers. Delegate tasks that don\'t directly generate income. Focus your time on high-value activities.',
    strategies: [
      'Hire experts for specialized knowledge',
      'Delegate administrative tasks to focus on income generation',
      'Build a team where each person excels in their area'
    ],
    warnings: ['Give appropriate credit to maintain team morale', 'Ensure you understand the basics'],
    order: 7
  },
  {
    lawNumber: 8,
    title: 'Make Other People Come to You—Use Bait If Necessary',
    originalDescription: 'When you force the other person to act, you are the one in control.',
    domainApplication: 'Position yourself so others approach you. Create valuable opportunities that attract investors, partners, or buyers. When you\'re in demand, you have leverage.',
    strategies: [
      'Build a valuable business or asset that others want',
      'Create exclusive investment opportunities',
      'Position yourself as an expert others seek'
    ],
    warnings: ['Don\'t be manipulative', 'Ensure your "bait" has real value'],
    order: 8
  },
  {
    lawNumber: 9,
    title: 'Win Through Your Actions, Never Through Argument',
    originalDescription: 'Any momentary triumph through argument creates resentment. Win through actions, not words.',
    domainApplication: 'Prove your financial competence through results, not words. Show returns instead of arguing about strategies. Let your financial success speak for itself.',
    strategies: [
      'Focus on building wealth rather than arguing about strategies',
      'Show investment returns rather than defending your approach',
      'Let business success demonstrate your methods'
    ],
    warnings: ['Don\'t avoid necessary discussions about financial planning'],
    order: 9
  },
  {
    lawNumber: 10,
    title: 'Infection: Avoid the Unhappy and Unlucky',
    originalDescription: 'You can die from someone else\'s misery. Emotional states are as infectious as diseases.',
    domainApplication: 'The mindset and habits of those around you directly impact your success. Associate with financially successful, positive people. Avoid those with poor financial decisions.',
    strategies: [
      'Surround yourself with financially successful people',
      'Join investment clubs and entrepreneur groups',
      'Find mentors who have achieved the success you seek'
    ],
    warnings: ['This doesn\'t mean abandoning friends in genuine need'],
    order: 10
  },
  {
    lawNumber: 11,
    title: 'Learn to Keep People Dependent on You',
    originalDescription: 'To maintain your independence, you must always be needed and wanted.',
    domainApplication: 'In business and finance, create situations where others depend on your expertise, capital, or connections. Maintain multiple streams where you\'re the essential piece.',
    strategies: [
      'Develop unique financial expertise others need',
      'Create business relationships where you provide essential value',
      'Build systems where you\'re the critical component'
    ],
    warnings: ['Don\'t become dependent on others\' dependence', 'Maintain your own independence'],
    order: 11
  },
  {
    lawNumber: 12,
    title: 'Use Selective Honesty and Generosity to Disarm Your Victim',
    originalDescription: 'One sincere and honest move will cover over dozens of dishonest ones.',
    domainApplication: 'In financial dealings, strategic honesty can build trust that opens doors. Be selectively generous - it creates goodwill and future opportunities.',
    strategies: [
      'Be transparent about financial challenges before they become crises',
      'Offer genuine value upfront to build trust',
      'Use honesty strategically in negotiations'
    ],
    warnings: ['Don\'t confuse strategic honesty with manipulation', 'Maintain ethical standards'],
    order: 12
  },
  {
    lawNumber: 13,
    title: 'When Asking for Help, Appeal to People\'s Self-Interest, Never to Their Mercy or Gratitude',
    originalDescription: 'If you need to turn to an ally for help, do not remind him of your past assistance.',
    domainApplication: 'When seeking funding, partnerships, or financial help, frame requests in terms of what\'s in it for them. Show how helping you benefits their own financial interests.',
    strategies: [
      'Frame investment opportunities in terms of investor returns',
      'Show how partnerships create mutual financial benefit',
      'Demonstrate how helping you advances their own goals'
    ],
    warnings: ['Don\'t be manipulative', 'Ensure mutual benefit is genuine'],
    order: 13
  },
  {
    lawNumber: 14,
    title: 'Pose as a Friend, Work as a Spy',
    originalDescription: 'Knowing about your rival is critical. Use spies to gather valuable information.',
    domainApplication: 'In business and finance, gather information through networking and relationships. Understand competitors\' strategies, market conditions, and opportunities without being obvious.',
    strategies: [
      'Attend industry events to gather market intelligence',
      'Build relationships that provide insights into opportunities',
      'Stay informed about competitors and market trends'
    ],
    warnings: ['Don\'t violate trust or confidentiality', 'Use information ethically'],
    order: 14
  },
  {
    lawNumber: 15,
    title: 'Crush Your Enemy Totally',
    originalDescription: 'If one ember is left alight, no matter how dimly it smolders, a fire will eventually break out.',
    domainApplication: 'In competitive financial situations, ensure you fully address threats. Don\'t leave financial problems or competitive advantages half-solved. Complete your financial goals fully.',
    strategies: [
      'Fully eliminate financial liabilities, don\'t just reduce them',
      'When outcompeting, secure your position completely',
      'Finish financial projects to completion'
    ],
    warnings: ['This doesn\'t mean destroying competitors unethically', 'Focus on securing your own position'],
    order: 15
  },
  {
    lawNumber: 16,
    title: 'Use Absence to Increase Respect and Honor',
    originalDescription: 'The more you are seen and heard from, the more common you appear.',
    domainApplication: 'In finance, strategic absence can increase your value. Don\'t be too available. Make your time and expertise scarce to increase their perceived value.',
    strategies: [
      'Limit availability to increase perceived value of your time',
      'Create scarcity in your services or expertise',
      'Use strategic absence to make returns more impactful'
    ],
    warnings: ['Don\'t be unavailable when genuinely needed', 'Balance scarcity with accessibility'],
    order: 16
  },
  {
    lawNumber: 17,
    title: 'Keep Others in Suspended Terror: Cultivate an Air of Unpredictability',
    originalDescription: 'Humans are creatures of habit with an insatiable need to see familiarity in other people\'s actions.',
    domainApplication: 'In negotiations and business, strategic unpredictability can work in your favor. Don\'t be too predictable in your financial moves. Keep competitors guessing.',
    strategies: [
      'Vary your negotiation styles',
      'Don\'t reveal patterns in investment decisions',
      'Maintain flexibility in financial strategies'
    ],
    warnings: ['Don\'t be chaotic', 'Maintain consistency in core values and ethics'],
    order: 17
  },
  {
    lawNumber: 18,
    title: 'Do Not Build Fortresses to Protect Yourself—Isolation Is Dangerous',
    originalDescription: 'The world is dangerous and enemies are everywhere. You must depend on your wits and allies.',
    domainApplication: 'In finance, isolation is dangerous. Build networks, partnerships, and relationships. Don\'t try to go it alone. Diversify not just investments, but also relationships and opportunities.',
    strategies: [
      'Build diverse networks across industries',
      'Create multiple income streams and partnerships',
      'Avoid over-reliance on single relationships or investments'
    ],
    warnings: ['Maintain healthy boundaries', 'Don\'t become too dependent on others'],
    order: 18
  },
  {
    lawNumber: 19,
    title: 'Know Who You\'re Dealing With—Do Not Offend the Wrong Person',
    originalDescription: 'There are many different kinds of people in the world, and you can never assume that everyone will react to your strategies in the same way.',
    domainApplication: 'In financial dealings, understand who you\'re working with. Research investors, partners, and clients. Some relationships are worth more than others. Treat each relationship appropriately.',
    strategies: [
      'Research financial partners and investors thoroughly',
      'Understand the motivations and backgrounds of those you deal with',
      'Tailor your approach based on who you\'re dealing with'
    ],
    warnings: ['Don\'t become paranoid', 'Maintain respect for all people'],
    order: 19
  },
  {
    lawNumber: 20,
    title: 'Do Not Commit to Anyone',
    originalDescription: 'It is the fool who always rushes to take sides. Do not commit to any side or cause but yourself.',
    domainApplication: 'In finance, maintain flexibility. Don\'t commit too early to investments, partnerships, or opportunities. Keep options open. Maintain financial independence.',
    strategies: [
      'Keep multiple investment options open',
      'Don\'t commit to partnerships until terms are favorable',
      'Maintain financial independence and flexibility'
    ],
    warnings: ['Some commitments are necessary for progress', 'Balance flexibility with action'],
    order: 20
  },
  {
    lawNumber: 21,
    title: 'Play a Sucker to Catch a Sucker—Seem Dumber Than Your Mark',
    originalDescription: 'No one likes feeling stupider than the next person. Make your victims feel smart.',
    domainApplication: 'In negotiations, let others think they\'re getting the better deal. Appear less financially savvy than you are. Let them underestimate you, then secure better terms.',
    strategies: [
      'Let others feel they\'re winning in negotiations',
      'Ask questions that reveal information while appearing naive',
      'Let others underestimate your financial acumen'
    ],
    warnings: ['Don\'t actually be a sucker', 'Maintain your financial intelligence'],
    order: 21
  },
  {
    lawNumber: 22,
    title: 'Use the Surrender Tactic: Transform Weakness into Power',
    originalDescription: 'When you are weaker, never fight for honor\'s sake. Choose surrender instead. Surrender gives you time to recover.',
    domainApplication: 'In financial setbacks, strategic retreat can be powerful. Know when to cut losses. Sometimes surrendering a losing position is the smartest move. Preserve capital for better opportunities.',
    strategies: [
      'Know when to cut losses on bad investments',
      'Exit unprofitable business ventures before they drain resources',
      'Preserve capital for better opportunities'
    ],
    warnings: ['Don\'t surrender too easily', 'Distinguish between strategic retreat and giving up'],
    order: 22
  },
  {
    lawNumber: 23,
    title: 'Concentrate Your Forces',
    originalDescription: 'Consolidate your resources. While your enemies are dispersed, you can attack where they are weakest.',
    domainApplication: 'In building wealth, focus your financial resources and energy. Don\'t spread yourself too thin across too many investments or opportunities. Concentrate on your strengths.',
    strategies: [
      'Focus investment capital on your best opportunities',
      'Concentrate effort on income-generating activities',
      'Build expertise in specific areas rather than being mediocre at many'
    ],
    warnings: ['Still maintain some diversification', 'Don\'t put all eggs in one basket'],
    order: 23
  },
  {
    lawNumber: 24,
    title: 'Play the Perfect Courtier',
    originalDescription: 'The perfect courtier thrives in a world where everything revolves around power and political dexterity.',
    domainApplication: 'In financial and business settings, master the art of networking and relationship building. Understand the politics of your industry. Navigate financial institutions and investment communities skillfully.',
    strategies: [
      'Master networking and relationship building in finance',
      'Understand the politics of your industry',
      'Navigate financial institutions and communities skillfully'
    ],
    warnings: ['Don\'t lose your authenticity', 'Maintain your values'],
    order: 24
  },
  {
    lawNumber: 25,
    title: 'Re-Create Yourself',
    originalDescription: 'Do not accept the roles that society foists on you. Re-create yourself by forging a new identity.',
    domainApplication: 'In finance, you\'re not limited by your current financial situation or background. Recreate your financial identity. Build wealth regardless of where you started.',
    strategies: [
      'Don\'t let current financial situation define your potential',
      'Build wealth regardless of background',
      'Create a new financial identity through action'
    ],
    warnings: ['Stay grounded in reality', 'Work with what you have while building toward what you want'],
    order: 25
  },
  {
    lawNumber: 26,
    title: 'Keep Your Hands Clean',
    originalDescription: 'You must seem a paragon of civility and efficiency. Use others as scapegoats to conceal your mistakes.',
    domainApplication: 'In finance, maintain a clean reputation. When things go wrong, ensure you\'re not directly blamed. Use proper legal structures and advisors to protect yourself.',
    strategies: [
      'Use proper legal and financial structures',
      'Work with advisors who can take responsibility when needed',
      'Maintain clean financial records and practices'
    ],
    warnings: ['Don\'t blame others unfairly', 'Take responsibility for your own mistakes'],
    order: 26
  },
  {
    lawNumber: 27,
    title: 'Play on People\'s Need to Believe to Create a Cultlike Following',
    originalDescription: 'People have an overwhelming desire to believe in something. Become the focal point of such desire.',
    domainApplication: 'In business and finance, build a brand or movement that people believe in. Create financial products, services, or communities that attract followers. Build trust and loyalty.',
    strategies: [
      'Build financial brands people believe in',
      'Create communities around financial education or investment strategies',
      'Establish yourself as a trusted authority'
    ],
    warnings: ['Don\'t exploit people\'s beliefs', 'Provide genuine value'],
    order: 27
  },
  {
    lawNumber: 28,
    title: 'Enter Action with Boldness',
    originalDescription: 'If you are unsure of a course of action, do not attempt it. Your doubts will infect your execution.',
    domainApplication: 'In finance, when you make decisions, commit fully. Hesitation and doubt can sabotage financial success. Research thoroughly, then act with conviction.',
    strategies: [
      'Research thoroughly, then act with conviction',
      'When investing, commit fully rather than hesitating',
      'Remove doubt through preparation, then execute boldly'
    ],
    warnings: ['Don\'t confuse boldness with recklessness', 'Still do your due diligence'],
    order: 28
  },
  {
    lawNumber: 29,
    title: 'Plan All the Way to the End',
    originalDescription: 'The ending is everything. Plan to the end, taking into account all possible consequences and obstacles.',
    domainApplication: 'In finance, plan your financial future completely. Consider all scenarios, risks, and outcomes. Have exit strategies for investments. Plan for different economic conditions.',
    strategies: [
      'Create comprehensive financial plans with multiple scenarios',
      'Plan exit strategies for all investments',
      'Consider all possible outcomes and risks'
    ],
    warnings: ['Don\'t become paralyzed by over-planning', 'Balance planning with action'],
    order: 29
  },
  {
    lawNumber: 30,
    title: 'Make Your Accomplishments Seem Effortless',
    originalDescription: 'Your actions must seem natural and executed with ease. All the toil and practice that go into them must be concealed.',
    domainApplication: 'In finance, make your wealth-building appear effortless. Don\'t show the struggle. Present financial success as the natural result of skill and strategy, not luck or hard work.',
    strategies: [
      'Present financial success as natural and strategic',
      'Don\'t show financial struggles publicly',
      'Make complex financial moves appear simple'
    ],
    warnings: ['Don\'t lie about your journey', 'Be honest with yourself and trusted advisors'],
    order: 30
  },
  {
    lawNumber: 31,
    title: 'Control the Options: Get Others to Play with the Cards You Deal',
    originalDescription: 'The best deceptions seem to give the other person a choice. Give them options, all of which serve your purpose.',
    domainApplication: 'In negotiations and financial deals, structure options so all outcomes benefit you. Present choices that seem fair but guide decisions in your favor.',
    strategies: [
      'Structure investment offers with multiple options that all benefit you',
      'Present negotiation choices that guide toward your preferred outcome',
      'Control the framing of financial decisions'
    ],
    warnings: ['Don\'t be manipulative', 'Ensure mutual benefit'],
    order: 31
  },
  {
    lawNumber: 32,
    title: 'Play to People\'s Fantasies',
    originalDescription: 'The truth is often avoided because it is ugly and unpleasant. Never appeal to truth and reality unless you are prepared for the anger that comes from disenchantment.',
    domainApplication: 'In financial products and services, understand what people want to believe about money and wealth. Frame offerings in terms of people\'s financial dreams and aspirations.',
    strategies: [
      'Frame financial products in terms of people\'s dreams',
      'Understand what people want to believe about wealth',
      'Present financial opportunities that align with aspirations'
    ],
    warnings: ['Don\'t exploit fantasies unethically', 'Provide real value'],
    order: 32
  },
  {
    lawNumber: 33,
    title: 'Discover Each Man\'s Thumbscrew',
    originalDescription: 'Everyone has a weakness, an insecurity, an unspoken desire. Find it and you hold the key to manipulating them.',
    domainApplication: 'In financial negotiations and business, understand what motivates others. Identify their financial goals, fears, and desires. Use this understanding to structure mutually beneficial deals.',
    strategies: [
      'Understand what motivates financial partners and investors',
      'Identify others\' financial goals and fears',
      'Structure deals that address their key motivations'
    ],
    warnings: ['Use this ethically', 'Don\'t exploit vulnerabilities maliciously'],
    order: 33
  },
  {
    lawNumber: 34,
    title: 'Be Royal in Your Own Fashion: Act Like a King to Be Treated Like One',
    originalDescription: 'The way you carry yourself will often determine how you are treated. In the long run, appearing vulgar or common will make people disrespect you.',
    domainApplication: 'In finance, carry yourself with confidence and professionalism. Present yourself as successful and capable. People treat you based on how you present yourself. Act like you belong in wealthy circles.',
    strategies: [
      'Present yourself professionally and confidently',
      'Dress and act in ways that command respect',
      'Carry yourself as if you\'re already successful'
    ],
    warnings: ['Don\'t be arrogant', 'Back up appearance with substance'],
    order: 34
  },
  {
    lawNumber: 35,
    title: 'Master the Art of Timing',
    originalDescription: 'Never seem to be in a hurry—hurrying betrays a lack of control over yourself and over time.',
    domainApplication: 'In finance, timing is everything. Know when to invest, when to exit, when to negotiate. Patience and perfect timing can mean the difference between success and failure.',
    strategies: [
      'Wait for the right moment to make financial moves',
      'Don\'t rush into investments or deals',
      'Study market cycles and timing'
    ],
    warnings: ['Don\'t use timing as an excuse for inaction', 'Sometimes you must act even when timing isn\'t perfect'],
    order: 35
  },
  {
    lawNumber: 36,
    title: 'Disdain Things You Cannot Have: Ignoring Them Is the Best Revenge',
    originalDescription: 'By acknowledging a petty problem you give it existence and credibility. The more attention you pay an enemy, the stronger you make him.',
    domainApplication: 'In finance, don\'t waste energy on missed opportunities or competitors\' success. Focus on your own financial goals. Ignore market noise and focus on what you can control.',
    strategies: [
      'Don\'t waste energy on missed investment opportunities',
      'Ignore market noise and focus on your strategy',
      'Don\'t compare yourself to others\' financial success'
    ],
    warnings: ['Don\'t ignore important information', 'Learn from mistakes and missed opportunities'],
    order: 36
  },
  {
    lawNumber: 37,
    title: 'Create Compelling Spectacles',
    originalDescription: 'Striking imagery and grand symbolic gestures create the aura of power. People respond to appearances.',
    domainApplication: 'In finance and business, create impressive presentations and demonstrations of success. Visual proof of wealth and success attracts opportunities and builds credibility.',
    strategies: [
      'Create impressive presentations of your financial success',
      'Use visual demonstrations to show value',
      'Make your business and investments appear impressive'
    ],
    warnings: ['Ensure substance matches spectacle', 'Don\'t create false appearances'],
    order: 37
  },
  {
    lawNumber: 38,
    title: 'Think as You Like but Behave Like Others',
    originalDescription: 'If you make a show of going against the times, flaunting your unconventional ideas and unorthodox ways, people will think you only want attention.',
    domainApplication: 'In finance, you can think differently about money and investments, but behave conventionally in social and business settings. Don\'t flaunt unconventional financial ideas unnecessarily.',
    strategies: [
      'Think differently about investments but present conventionally',
      'Don\'t flaunt unconventional financial ideas unnecessarily',
      'Fit in socially while maintaining unique financial strategies'
    ],
    warnings: ['Don\'t lose your authentic financial philosophy', 'Sometimes innovation requires breaking conventions'],
    order: 38
  },
  {
    lawNumber: 39,
    title: 'Stir Up Waters to Catch Fish',
    originalDescription: 'Anger and emotion are strategically counterproductive. Stay calm and objective. Make your enemies angry while you stay cool and collected.',
    domainApplication: 'In financial negotiations and conflicts, stay calm while others become emotional. Emotional people make poor financial decisions. Your calmness gives you advantage.',
    strategies: [
      'Stay calm and objective in financial negotiations',
      'Let others become emotional while you remain rational',
      'Use calmness as a strategic advantage'
    ],
    warnings: ['Don\'t manipulate emotions unethically', 'Some situations require emotional connection'],
    order: 39
  },
  {
    lawNumber: 40,
    title: 'Despise the Free Lunch',
    originalDescription: 'What is offered for free is dangerous—it usually involves either a trick or a hidden obligation.',
    domainApplication: 'In finance, be skeptical of "free" offers, "guaranteed returns," or "risk-free" investments. Everything has a cost. Understand what you\'re really paying or what\'s really being asked.',
    strategies: [
      'Be skeptical of free financial offers',
      'Understand the true cost of "free" services',
      'Question guaranteed returns or risk-free investments'
    ],
    warnings: ['Not everything free is bad', 'Some legitimate free resources exist'],
    order: 40
  },
  {
    lawNumber: 41,
    title: 'Avoid Stepping into a Great Man\'s Shoes',
    originalDescription: 'What happens first always appears better and more original than what comes after.',
    domainApplication: 'In finance and business, don\'t try to directly replicate someone else\'s success. Create your own path. Following in a great investor\'s footsteps makes your success seem derivative.',
    strategies: [
      'Create your own investment and business strategies',
      'Don\'t try to replicate others\' success exactly',
      'Build your own unique financial path'
    ],
    warnings: ['Learn from successful people', 'Adapt strategies rather than copying'],
    order: 41
  },
  {
    lawNumber: 42,
    title: 'Strike the Shepherd and the Sheep Will Scatter',
    originalDescription: 'Trouble can often be traced to a single strong individual. Neutralize this individual and you neutralize the group.',
    domainApplication: 'In business competition, identify and address the key decision-maker or influencer. In financial deals, understand who the real power is. Deal with the person who matters.',
    strategies: [
      'Identify key decision-makers in financial deals',
      'Address the real power in business relationships',
      'Understand who actually controls resources and decisions'
    ],
    warnings: ['Don\'t be manipulative or unethical', 'Respect organizational structures'],
    order: 42
  },
  {
    lawNumber: 43,
    title: 'Work on the Hearts and Minds of Others',
    originalDescription: 'Coercion creates a reaction that will eventually work against you. You must seduce others into wanting to move in your direction.',
    domainApplication: 'In finance, people make decisions based on emotion then justify with logic. Appeal to people\'s emotions and desires, not just logic. Make others want to invest, partner, or work with you.',
    strategies: [
      'Appeal to emotions as well as logic in financial presentations',
      'Make people want to invest or partner with you',
      'Connect financial opportunities to people\'s desires'
    ],
    warnings: ['Don\'t manipulate emotions unethically', 'Still provide logical justification'],
    order: 43
  },
  {
    lawNumber: 44,
    title: 'Disarm and Infuriate with the Mirror Effect',
    originalDescription: 'The mirror reflects reality, but it is also the perfect tool for deception. When you mirror your enemies, doing exactly as they do, they cannot figure out your strategy.',
    domainApplication: 'In financial negotiations, mirror the other party\'s style and approach. This can disarm them and make them comfortable. It also makes your strategy harder to predict.',
    strategies: [
      'Mirror negotiation styles to build rapport',
      'Match the communication style of financial partners',
      'Use mirroring to make others comfortable'
    ],
    warnings: ['Don\'t lose your authentic style', 'Mirror strategically, not slavishly'],
    order: 44
  },
  {
    lawNumber: 45,
    title: 'Preach the Need for Change, but Never Reform Too Much at Once',
    originalDescription: 'Everyone understands the need for change, but on the deep level people are creatures of habit. Too much innovation is traumatic and will lead to revolt.',
    domainApplication: 'In finance, introduce changes gradually. Whether it\'s new investment strategies, business models, or financial systems, change incrementally. Too much change at once creates resistance.',
    strategies: [
      'Introduce new investment strategies gradually',
      'Make financial changes incrementally',
      'Ease people into new financial approaches'
    ],
    warnings: ['Sometimes major changes are necessary', 'Don\'t let gradualism become procrastination'],
    order: 45
  },
  {
    lawNumber: 46,
    title: 'Never Appear Too Perfect',
    originalDescription: 'Being perfect can make others envious and afraid. It is better to occasionally make a mistake or reveal a small flaw.',
    domainApplication: 'In finance, appearing too perfect or successful can create resentment and make others unwilling to help. Show occasional vulnerabilities or share small setbacks to appear more relatable.',
    strategies: [
      'Share appropriate vulnerabilities to build connection',
      'Don\'t appear too perfect or wealthy',
      'Show relatability while maintaining success'
    ],
    warnings: ['Don\'t fake failures', 'Maintain authenticity'],
    order: 46
  },
  {
    lawNumber: 47,
    title: 'Do Not Go Past the Mark You Aimed For; In Victory, Learn When to Stop',
    originalDescription: 'The moment of victory is often the moment of greatest vulnerability. In the heat of victory, arrogance and overconfidence can push you past the goal.',
    domainApplication: 'In finance, know when to exit investments, when to stop negotiating, when to take profits. Don\'t be greedy. The ability to stop when ahead is a key financial skill.',
    strategies: [
      'Know when to exit investments and take profits',
      'Set clear financial goals and stop when achieved',
      'Don\'t be greedy - take wins when you have them'
    ],
    warnings: ['Don\'t stop too early', 'Balance taking profits with letting winners run'],
    order: 47
  },
  {
    lawNumber: 48,
    title: 'Assume Formlessness',
    originalDescription: 'By taking a shape, by having a visible plan, you open yourself to attack. Instead of taking a form for your enemy to grasp, keep yourself adaptable and on the move.',
    domainApplication: 'In finance, remain flexible and adaptable. Don\'t become rigid in your strategies. Markets change, opportunities shift. The ability to adapt quickly is a major financial advantage.',
    strategies: [
      'Remain flexible in investment strategies',
      'Adapt quickly to changing market conditions',
      'Don\'t become rigid in financial approaches'
    ],
    warnings: ['Flexibility doesn\'t mean lack of planning', 'Maintain core principles while adapting tactics'],
    order: 48
  }
]


