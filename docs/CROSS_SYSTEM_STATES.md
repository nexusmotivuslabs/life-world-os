# Cross-System States

## Overview

Cross-System States are global modifiers that affect multiple systems simultaneously. Unlike tier-based systems that operate within specific domains, cross-system states cut across all tiers and influence behavior and outcomes universally.

## The Four Cross-System States

### 1. Trust

**Mantra**: Trust is a forward-looking belief.

**Definition**: Trust is built on three pillars:
- **Competence**: You can do the thing
- **Reliability**: You do the thing consistently
- **Alignment**: You act in the shared interest

**Global Modifier Effects**:

Trust acts as a global modifier that affects multiple systems:

#### Finance System
- **Low Trust**: Higher transaction costs, restricted access to financial products, increased verification requirements
- **High Trust**: Lower fees, access to premium products, streamlined processes, better rates

#### Career System
- **Low Trust**: Limited opportunities, restricted responsibilities, increased oversight
- **High Trust**: More autonomy, better assignments, faster promotions, access to strategic projects

#### Health System
- **Low Trust**: Limited access to healthcare providers, higher costs, restricted treatment options
- **High Trust**: Better provider relationships, coordinated care, preventive access

#### Energy System
- **Low Trust**: Higher energy costs for actions (more verification, rework, monitoring)
- **High Trust**: Lower energy costs (less monitoring, more autonomy, faster execution)

#### Learning System
- **Low Trust**: Restricted access to resources, limited mentorship, fewer opportunities
- **High Trust**: Access to exclusive resources, mentorship, accelerated learning paths

**Trust Mechanics**:
- Trust compounds slowly through consistent, reliable behavior
- Trust decays quickly through repeated violations
- Trust affects opportunity costs across all systems
- High trust reduces friction and increases optionality

### 2. Reputation

**Mantra**: Reputation is not what people think of you. It is what they expect from you.

**Definition**: Reputation is the forward-looking expectation others have of your behavior and outcomes.

**Global Modifier Effects**:

Reputation governs access to opportunities, partnerships, and resources across all systems:

- **Low Reputation**: Doors close, opportunities disappear, partnerships dissolve
- **High Reputation**: Doors open, opportunities multiply, partnerships form easily

**Reputation Mechanics**:
- Reputation compounds like interest (slow to build, fast to destroy)
- Every interaction is a micro-deposit or withdrawal
- Reputation affects what systems and opportunities become available
- Reputation is an invisible stat that governs system access

### 3. Optionality

**Mantra**: Optionality is the right, but not the obligation, to act.

**Definition**: Optionality represents available choices and strategic freedom across all systems.

**Global Modifier Effects**:

Optionality unlocks higher-risk, higher-reward actions across all systems:

- **Low Optionality**: Restricted actions, limited choices, forced paths
- **High Optionality**: More choices, strategic freedom, ability to wait for better opportunities

**Optionality Mechanics**:
- Optionality decays when resources are idle or misused
- High optionality enables asymmetric risk-reward opportunities
- Optionality affects risk tolerance across all systems
- Optionality is a strategic asset that compounds over time

### 4. Energy Reserve

**Mantra**: Reserve energy enables sustained effort when needed.

**Definition**: Energy Reserve represents stored energy capacity beyond the daily budget, enabling sustained effort across multiple systems during critical periods.

**Global Modifier Effects**:

Energy Reserve enables sustained effort when daily energy is insufficient:

- **Low Energy Reserve**: Forced to stop when daily energy depleted, cannot sustain critical efforts
- **High Energy Reserve**: Can sustain effort across multiple days, handle emergencies, maintain momentum

**Energy Reserve Mechanics**:
- Energy Reserve is built through consistent energy management
- Can be depleted during critical periods
- Regenerates slowly over time
- Enables cross-system sustained efforts

## Implementation Notes

### Trust as Global Modifier

Trust should be implemented as:

1. **System-Wide Modifier**: A single trust value (0-100) that affects all systems
2. **Cost Multiplier**: Low trust increases costs, high trust decreases costs
3. **Opportunity Unlocker**: High trust unlocks opportunities, low trust restricts them
4. **Friction Reducer**: High trust reduces friction (verification, monitoring, oversight)
5. **Compound Effect**: Trust compounds through consistent behavior across all systems

### Trust Calculation

Trust can be calculated based on:
- **Competence Score**: Ability to deliver (tracked across systems)
- **Reliability Score**: Consistency of delivery (tracked over time)
- **Alignment Score**: Acting in shared interest (tracked through decisions)

### Trust Application

When applying trust as a modifier:
- Multiply costs by `(1 - trust/100)` for high trust (reduces costs)
- Multiply costs by `(1 + (100-trust)/100)` for low trust (increases costs)
- Unlock opportunities when trust exceeds thresholds
- Reduce verification/monitoring requirements at high trust levels

## Relationship to Tiers

Cross-System States operate **above** the tier hierarchy:
- They affect all tiers simultaneously
- They modify behavior within each tier
- They create dependencies between tiers
- They enable or restrict access across tiers

## Future Enhancements

1. **Trust Dashboard**: Visualize trust across different relationships and systems
2. **Reputation Tracking**: Track reputation changes over time with event log
3. **Optionality Calculator**: Calculate optionality based on resources, skills, and relationships
4. **Energy Reserve Management**: Tools for building and managing energy reserves
5. **Cross-System Analytics**: Analyze how cross-system states affect overall performance

