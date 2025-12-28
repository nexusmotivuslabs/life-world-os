/**
 * 48 Laws of Power - Data for Energy Domain
 * 
 * Applications of the 48 Laws of Power to energy management, sleep, capacity, and vitality.
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

export const energyDomainPowerLaws: PowerLawData[] = [
  {
    lawNumber: 1,
    title: 'Never Outshine the Master',
    originalDescription: 'Make your masters appear more brilliant than they are and you will attain the heights of power.',
    domainApplication: 'Never outshine your body\'s natural energy rhythms. Work with your circadian cycle, not against it. When you try to override your body\'s signals with caffeine or willpower, you create dependency and eventual collapse.',
    strategies: [
      'Respect your body\'s natural energy peaks and valleys',
      'Schedule high-energy tasks during your natural peak hours',
      'Let your body\'s signals guide your energy allocation, don\'t force it',
      'Work with your circadian rhythm, not against it'
    ],
    examples: [
      'Elite athletes who train with their circadian rhythms outperform those who fight against them',
      'CEOs who respect their energy cycles make better decisions than those who push through exhaustion',
      'People who align work with natural energy peaks are more productive than those who force themselves'
    ],
    warnings: [
      'This doesn\'t mean being lazy - it means strategic energy management',
      'Sometimes you must push, but make it the exception, not the rule',
      'Don\'t use this as an excuse to avoid necessary work'
    ],
    counterStrategies: [
      'Others may try to exploit your energy patterns - maintain boundaries',
      'Don\'t let others schedule you during your low-energy periods',
      'Protect your peak energy times for your most important work'
    ],
    order: 1
  },
  {
    lawNumber: 2,
    title: 'Never Put Too Much Trust in Friends, Learn How to Use Enemies',
    originalDescription: 'Be wary of friends—they will betray you more quickly, for they are easily aroused to envy.',
    domainApplication: 'Don\'t trust temporary energy boosts (caffeine, sugar) as your primary energy source. They create dependency and mask underlying issues. Instead, use "enemies" like rest and recovery - things that feel like weakness but are actually strength.',
    strategies: [
      'Treat caffeine as a tool, not a foundation - use sparingly',
      'Embrace rest as strategic, not weakness',
      'Build base energy through sleep, not temporary stimulants',
      'View recovery as an investment, not a cost'
    ],
    examples: [
      'People who rely on caffeine crash harder than those who maintain natural energy',
      'Athletes who prioritize recovery outperform those who train constantly',
      'Leaders who rest strategically make better decisions than those who push continuously'
    ],
    warnings: [
      'This doesn\'t mean avoiding all stimulants - use them strategically',
      'Balance is key - some caffeine is fine, dependency is not',
      'Don\'t become dependent on any single energy source'
    ],
    order: 2
  },
  {
    lawNumber: 3,
    title: 'Conceal Your Intentions',
    originalDescription: 'Keep people off-balance and in the dark by never revealing the purpose behind your actions.',
    domainApplication: 'Don\'t reveal your energy limits to others who might exploit them. Maintain boundaries around your rest and recovery. Let others see your output, not your energy management strategy.',
    strategies: [
      'Set boundaries around sleep and rest without explaining why',
      'Don\'t reveal your energy patterns to those who might schedule you during low periods',
      'Let your results speak - don\'t explain your energy management methods',
      'Protect your rest periods as non-negotiable'
    ],
    examples: [
      'Successful people who protect their sleep don\'t explain it - they just do it',
      'Leaders who maintain energy boundaries are more effective than those who are always available',
      'People who keep energy strategies private maintain their competitive advantage'
    ],
    warnings: [
      'Be honest with yourself about your energy needs',
      'Some contexts require transparency - use judgment',
      'Don\'t use this to avoid accountability'
    ],
    order: 3
  },
  {
    lawNumber: 6,
    title: 'Court Attention at All Costs',
    originalDescription: 'Everything is judged by its appearance. Stand out. Make yourself a magnet of attention.',
    domainApplication: 'Make your high energy visible. When you have full base energy, use it strategically to stand out. High energy is magnetic - people are drawn to those with vitality.',
    strategies: [
      'Use peak energy periods for high-visibility work',
      'Schedule important meetings during your energy peaks',
      'Let your energy level be your competitive advantage',
      'Show up with full energy when it matters most'
    ],
    examples: [
      'Entrepreneurs who maintain high energy attract better opportunities',
      'Leaders with consistent energy inspire more confidence',
      'People with visible vitality get more opportunities and respect'
    ],
    warnings: [
      'Don\'t fake energy - build real base energy through sleep',
      'High energy should be authentic, not performative',
      'Don\'t exhaust yourself trying to appear energetic'
    ],
    order: 6
  },
  {
    lawNumber: 10,
    title: 'Infection: Avoid the Unhappy and Unlucky',
    originalDescription: 'You can die from someone else\'s misery. Emotional states are as infectious as diseases.',
    domainApplication: 'Energy is contagious. Surround yourself with people who have high energy and good sleep habits. Avoid those who normalize exhaustion and burnout - their energy-draining mindset will infect you.',
    strategies: [
      'Associate with people who prioritize sleep and energy management',
      'Join communities that value rest and recovery',
      'Distance yourself from those who glorify burnout',
      'Protect your energy from draining relationships'
    ],
    examples: [
      'People who join fitness communities often improve their energy',
      'Those who surround themselves with exhausted people tend to become exhausted',
      'Leaders who associate with high-energy people maintain their own energy'
    ],
    warnings: [
      'This doesn\'t mean abandoning friends in need',
      'Help others, but don\'t let their energy patterns become yours',
      'Balance compassion with self-protection'
    ],
    order: 10
  },
  {
    lawNumber: 15,
    title: 'Crush Your Enemy Totally',
    originalDescription: 'If you leave one ember smoldering, it will reignite. Crush your enemy completely.',
    domainApplication: 'Completely eliminate energy drains. Don\'t just reduce them - eliminate them entirely. Partial solutions leave energy leaks that drain you over time.',
    strategies: [
      'Identify all energy drains and eliminate them completely',
      'Don\'t compromise on sleep - make it non-negotiable',
      'Remove toxic relationships, environments, and habits that drain energy',
      'Eliminate energy leaks, not just reduce them'
    ],
    examples: [
      'People who completely eliminate caffeine dependency have more stable energy',
      'Those who fully commit to sleep schedules outperform those who are inconsistent',
      'Leaders who eliminate all energy drains maintain peak performance'
    ],
    warnings: [
      'Some energy drains are necessary (work, responsibilities)',
      'Focus on eliminating unnecessary drains, not essential ones',
      'Don\'t become isolated in pursuit of perfect energy'
    ],
    order: 15
  },
  {
    lawNumber: 22,
    title: 'Use the Surrender Tactic: Transform Weakness into Power',
    originalDescription: 'When you are weaker, surrender. Do not fight for honor in a losing battle.',
    domainApplication: 'When your energy is low, surrender to rest. Don\'t fight exhaustion with willpower. Transform rest into power by making it strategic. Low energy is a signal to recharge, not a weakness to overcome.',
    strategies: [
      'When energy is low, rest immediately - don\'t push through',
      'Use rest periods strategically to build capacity',
      'Transform "weakness" (need for rest) into strength (recovery)',
      'View rest as strategic, not defeat'
    ],
    examples: [
      'Elite performers who rest when tired outperform those who push through',
      'Leaders who take breaks make better decisions than those who work continuously',
      'Athletes who surrender to recovery come back stronger'
    ],
    warnings: [
      'This doesn\'t mean being lazy - rest is active recovery',
      'Balance rest with productive activity',
      'Don\'t use this as an excuse to avoid all work'
    ],
    order: 22
  },
  {
    lawNumber: 29,
    title: 'Plan All the Way to the End',
    originalDescription: 'The ending is everything. Plan all the way to it, taking into account all the possible consequences.',
    domainApplication: 'Plan your energy allocation for the entire day, week, and month. Don\'t just focus on immediate energy - plan for sustainable energy management. Consider how today\'s energy use affects tomorrow\'s capacity.',
    strategies: [
      'Plan energy allocation before the day begins',
      'Schedule high-energy tasks during peak periods',
      'Reserve energy for important decisions and tasks',
      'Consider long-term energy sustainability in all plans'
    ],
    examples: [
      'People who plan their energy use are more productive',
      'Those who allocate energy strategically avoid burnout',
      'Leaders who plan for energy sustainability maintain peak performance longer'
    ],
    warnings: [
      'Plans must be flexible - energy is unpredictable',
      'Don\'t over-plan - leave room for spontaneity',
      'Balance planning with adaptability'
    ],
    order: 29
  },
  {
    lawNumber: 38,
    title: 'Think as You Like But Behave Like Others',
    originalDescription: 'If you make a show of going against the times, flaunting your unconventional ideas, people will think you only want attention.',
    domainApplication: 'Think strategically about energy management, but don\'t make a show of it. Sleep well and manage energy, but don\'t constantly talk about it. Let your results speak.',
    strategies: [
      'Prioritize sleep without making it a public identity',
      'Manage energy strategically without announcing it',
      'Let high energy be your secret advantage',
      'Focus on results, not your energy management methods'
    ],
    examples: [
      'Successful people who sleep well don\'t need to talk about it',
      'Those who manage energy well let results speak for themselves',
      'Leaders with high energy don\'t need to explain their methods'
    ],
    warnings: [
      'This doesn\'t mean hiding your needs',
      'Set boundaries, but don\'t make energy management your personality',
      'Balance privacy with necessary communication'
    ],
    order: 38
  },
  {
    lawNumber: 48,
    title: 'Assume Formlessness',
    originalDescription: 'By taking a shape, by having a visible plan, you open yourself to attack.',
    domainApplication: 'Don\'t be rigid about energy management. Adapt to circumstances. Some days require more energy, some less. Be formless - adapt your energy strategy to the situation.',
    strategies: [
      'Adapt energy allocation to changing circumstances',
      'Don\'t be rigid about sleep schedules - adjust when needed',
      'Maintain flexibility while keeping core principles',
      'Let energy management adapt to life\'s demands'
    ],
    examples: [
      'People who adapt their energy management survive unexpected demands',
      'Those who are flexible with rest recover faster from disruptions',
      'Leaders who adapt energy strategies handle crises better'
    ],
    warnings: [
      'Flexibility doesn\'t mean abandoning principles',
      'Maintain core habits while adapting to circumstances',
      'Don\'t use flexibility as an excuse for poor energy management'
    ],
    order: 48
  }
]

