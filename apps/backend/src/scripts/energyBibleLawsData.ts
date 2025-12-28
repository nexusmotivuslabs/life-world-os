/**
 * Bible Laws - Data for Energy Domain
 * 
 * Biblical principles and teachings applied to energy management, sleep, rest, and vitality.
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

export const energyDomainBibleLaws: BibleLawData[] = [
  {
    lawNumber: 1,
    title: 'Your Body is a Temple',
    scriptureReference: '1 Corinthians 6:19-20',
    originalText: 'Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.',
    domainApplication: 'Your body and energy are gifts from God. Treat them with respect. Proper sleep, nutrition, and rest honor God by stewarding what He has given you. Neglecting your body is neglecting a gift from God.',
    principles: [
      {
        text: 'Your body is a temple - treat it with respect and care',
        examples: [
          { description: 'Prioritizing 7-9 hours of sleep as honoring God\'s gift', impact: 'good' },
          { description: 'Sacrificing sleep for work or entertainment, treating body as disposable', impact: 'bad' },
          { description: 'Getting adequate sleep but not prioritizing quality rest', impact: 'neutral' }
        ]
      },
      {
        text: 'You are not your own - steward your energy for God\'s purposes',
        examples: [
          { description: 'Managing energy to serve God and others effectively', impact: 'good' },
          { description: 'Using energy only for personal gain and pleasure', impact: 'bad' },
          { description: 'Balancing personal and service-oriented energy use', impact: 'neutral' }
        ]
      },
      {
        text: 'Honor God with your body through proper rest and care',
        examples: [
          { description: 'Viewing sleep as an act of worship and stewardship', impact: 'good' },
          { description: 'Treating rest as laziness or weakness', impact: 'bad' },
          { description: 'Resting adequately but without spiritual perspective', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Schedule sleep as a non-negotiable priority',
      'View energy management as stewardship, not selfishness',
      'Use restored energy to serve God and others',
      'Treat your body with the respect due a temple',
      'Prioritize rest as honoring God\'s gift'
    ],
    examples: [
      'People who view their body as a temple take better care of their energy',
      'Those who honor God with rest have more energy to serve others',
      'Leaders who steward their energy well serve more effectively'
    ],
    warnings: [
      'Don\'t use this as an excuse for laziness',
      'Balance rest with productive service',
      'Avoid extremes - both overwork and underwork dishonor God'
    ],
    relatedVerses: [
      'Romans 12:1 - "Therefore, I urge you, brothers and sisters, in view of God\'s mercy, to offer your bodies as a living sacrifice"',
      'Proverbs 3:7-8 - "Do not be wise in your own eyes; fear the Lord and shun evil. This will bring health to your body"'
    ],
    order: 1
  },
  {
    lawNumber: 2,
    title: 'Come to Me, All You Who Are Weary',
    scriptureReference: 'Matthew 11:28',
    originalText: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    domainApplication: 'When you are exhausted, come to God in rest. True rest is found in God, not just sleep. Spiritual rest restores energy in ways physical rest alone cannot. Don\'t try to power through exhaustion - rest in God.',
    principles: [
      {
        text: 'God offers rest to the weary - accept it',
        examples: [
          { description: 'Taking time for prayer and spiritual rest when exhausted', impact: 'good' },
          { description: 'Pushing through exhaustion without seeking God\'s rest', impact: 'bad' },
          { description: 'Getting physical rest but neglecting spiritual rest', impact: 'neutral' }
        ]
      },
      {
        text: 'Rest is a gift from God, not a sign of weakness',
        examples: [
          { description: 'Embracing rest as God\'s provision for your needs', impact: 'good' },
          { description: 'Feeling guilty about needing rest and recovery', impact: 'bad' },
          { description: 'Resting physically but not finding spiritual restoration', impact: 'neutral' }
        ]
      },
      {
        text: 'True rest comes from God, not just physical sleep',
        examples: [
          { description: 'Combining physical rest with spiritual rest and prayer', impact: 'good' },
          { description: 'Relying only on sleep without seeking God\'s rest', impact: 'bad' },
          { description: 'Getting adequate sleep but missing spiritual restoration', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'When exhausted, seek God in prayer and rest',
      'Combine physical rest with spiritual rest',
      'Don\'t feel guilty about needing rest - it\'s God\'s gift',
      'Use rest periods for spiritual renewal',
      'Trust that God will restore your energy'
    ],
    examples: [
      'People who combine physical and spiritual rest recover faster',
      'Those who seek God in exhaustion find deeper restoration',
      'Leaders who rest in God maintain energy longer'
    ],
    warnings: [
      'This doesn\'t mean avoiding all work',
      'Balance rest with responsibility',
      'Don\'t use rest as an escape from God\'s calling'
    ],
    relatedVerses: [
      'Psalm 23:2-3 - "He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul"',
      'Exodus 33:14 - "The Lord replied, \'My Presence will go with you, and I will give you rest.\'"'
    ],
    order: 2
  },
  {
    lawNumber: 3,
    title: 'Six Days You Shall Labor',
    scriptureReference: 'Exodus 20:9-10',
    originalText: 'Six days you shall labor and do all your work, but the seventh day is a sabbath to the Lord your God.',
    domainApplication: 'God designed a rhythm of work and rest. Six days of work, one day of rest. This pattern prevents burnout and maintains sustainable energy. Ignoring this rhythm leads to exhaustion and decreased capacity.',
    principles: [
      {
        text: 'Work six days, rest one - follow God\'s rhythm',
        examples: [
          { description: 'Working hard six days, then taking a full day of rest', impact: 'good' },
          { description: 'Working seven days without rest, ignoring God\'s pattern', impact: 'bad' },
          { description: 'Working most days but not consistently taking a full rest day', impact: 'neutral' }
        ]
      },
      {
        text: 'Sabbath rest is sacred - protect it',
        examples: [
          { description: 'Setting aside one day per week for rest and restoration', impact: 'good' },
          { description: 'Using rest days for more work or draining activities', impact: 'bad' },
          { description: 'Taking rest days but not fully disconnecting from work', impact: 'neutral' }
        ]
      },
      {
        text: 'This rhythm prevents burnout and maintains energy',
        examples: [
          { description: 'People who follow Sabbath rest maintain higher energy long-term', impact: 'good' },
          { description: 'Those who work continuously eventually burn out', impact: 'bad' },
          { description: 'Taking occasional rest but not following consistent rhythm', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Schedule one full day of rest per week',
      'Protect your rest day from work and draining activities',
      'Use rest day for restoration, not just inactivity',
      'Trust that rest makes you more productive, not less',
      'Follow God\'s rhythm of work and rest'
    ],
    examples: [
      'People who observe Sabbath maintain higher energy and productivity',
      'Those who ignore rest rhythms eventually experience burnout',
      'Leaders who follow work-rest cycles serve more effectively long-term'
    ],
    warnings: [
      'This doesn\'t mean being lazy the other six days',
      'Work hard when it\'s time to work',
      'Balance is key - both work and rest are important'
    ],
    relatedVerses: [
      'Mark 2:27 - "The Sabbath was made for man, not man for the Sabbath"',
      'Hebrews 4:9-10 - "There remains, then, a Sabbath-rest for the people of God; for anyone who enters God\'s rest also rests from their works"'
    ],
    order: 3
  },
  {
    lawNumber: 4,
    title: 'Be Still and Know That I Am God',
    scriptureReference: 'Psalm 46:10',
    originalText: 'Be still, and know that I am God.',
    domainApplication: 'Stillness and rest are acts of faith. When you rest, you acknowledge that God is in control, not your constant activity. Rest requires trust that God will provide even when you\'re not working.',
    principles: [
      {
        text: 'Stillness is an act of faith and trust',
        examples: [
          { description: 'Taking time for stillness and rest, trusting God\'s provision', impact: 'good' },
          { description: 'Being unable to rest due to anxiety and need for control', impact: 'bad' },
          { description: 'Resting physically but not finding stillness of mind', impact: 'neutral' }
        ]
      },
      {
        text: 'In rest, you acknowledge God\'s sovereignty',
        examples: [
          { description: 'Using rest periods to reflect on God\'s goodness and provision', impact: 'good' },
          { description: 'Feeling guilty about rest, as if God needs your constant work', impact: 'bad' },
          { description: 'Resting but not connecting it to faith', impact: 'neutral' }
        ]
      },
      {
        text: 'Stillness allows you to know God more deeply',
        examples: [
          { description: 'Using rest for prayer, meditation, and spiritual growth', impact: 'good' },
          { description: 'Filling rest time with distractions and noise', impact: 'bad' },
          { description: 'Resting but not using time to connect with God', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Practice stillness as an act of faith',
      'Use rest periods for prayer and reflection',
      'Trust that rest doesn\'t mean God\'s work stops',
      'Find peace in stillness, knowing God is in control',
      'Allow stillness to deepen your relationship with God'
    ],
    examples: [
      'People who practice stillness maintain better energy and peace',
      'Those who rest in faith experience deeper restoration',
      'Leaders who practice stillness make better decisions'
    ],
    warnings: [
      'Stillness doesn\'t mean avoiding all responsibility',
      'Balance stillness with action',
      'Don\'t use this as an excuse for inaction'
    ],
    relatedVerses: [
      'Isaiah 30:15 - "In repentance and rest is your salvation, in quietness and trust is your strength"',
      'Psalm 37:7 - "Be still before the Lord and wait patiently for him"'
    ],
    order: 4
  },
  {
    lawNumber: 5,
    title: 'Do Not Be Anxious',
    scriptureReference: 'Matthew 6:25-27',
    originalText: 'Therefore I tell you, do not worry about your life... Can any one of you by worrying add a single hour to your life?',
    domainApplication: 'Anxiety drains energy. Worry about energy, sleep, or capacity doesn\'t restore it - it depletes it. Trust God with your energy needs. Worry is energy wasted on things you cannot control.',
    principles: [
      {
        text: 'Worry doesn\'t add energy - it drains it',
        examples: [
          { description: 'Trusting God with energy needs and focusing on what you can control', impact: 'good' },
          { description: 'Worrying constantly about sleep, energy, and capacity', impact: 'bad' },
          { description: 'Being concerned about energy but not obsessing over it', impact: 'neutral' }
        ]
      },
      {
        text: 'Trust God with your energy and rest needs',
        examples: [
          { description: 'Doing your part (sleep, rest) and trusting God with results', impact: 'good' },
          { description: 'Trying to control every aspect of energy through worry', impact: 'bad' },
          { description: 'Managing energy well but not trusting God with outcomes', impact: 'neutral' }
        ]
      },
      {
        text: 'Focus on what you can control, not what you cannot',
        examples: [
          { description: 'Prioritizing sleep and rest, then trusting God with the rest', impact: 'good' },
          { description: 'Worrying about energy you cannot control or change', impact: 'bad' },
          { description: 'Managing energy but still feeling anxious about it', impact: 'neutral' }
        ]
      }
    ],
    practicalApplications: [
      'Do your part (sleep, rest) and trust God',
      'Don\'t worry about energy you cannot control',
      'Focus on what you can do, not what you cannot',
      'Let go of anxiety about energy levels',
      'Trust that God will provide the energy you need'
    ],
    examples: [
      'People who trust God with energy have less anxiety and more peace',
      'Those who worry about energy waste energy on worry itself',
      'Leaders who trust God maintain energy better than those who worry'
    ],
    warnings: [
      'This doesn\'t mean being careless about energy',
      'Still do your part - sleep, rest, manage energy',
      'Balance trust with responsible action'
    ],
    relatedVerses: [
      'Philippians 4:6-7 - "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God"',
      '1 Peter 5:7 - "Cast all your anxiety on him because he cares for you"'
    ],
    order: 5
  }
]

