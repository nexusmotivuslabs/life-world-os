# Energy Burndown System

## Overview

The Energy Burndown System implements **live energy decay** that continuously decreases energy over time from when it was restored. This creates a real-time energy management experience where energy is not static but actively depleting.

## Key Features

### 1. Live Energy Calculation
- Energy is calculated in real-time based on time elapsed since restoration
- Energy continuously decreases at a configurable rate (default: 2 energy/hour)
- No need to wait for daily tick to see energy changes

### 2. Restoration Timestamp Tracking
- `energyRestoredAt` field in `Resources` model tracks when energy was last restored
- Updated when:
  - Daily tick resets energy
  - Sleep restores energy
  - Any energy restoration occurs

### 3. Burndown Information
The system provides detailed burndown metrics:
- **Current Energy**: Live energy after decay
- **Restored Energy**: Original amount restored
- **Energy Decayed**: Total energy lost since restoration
- **Hours Elapsed**: Time since restoration
- **Decay Rate**: Energy lost per hour
- **Hours Until Depletion**: Time remaining until energy reaches 0
- **Depleted At**: Estimated time when energy will be fully depleted

## Configuration

### Decay Rate
Located in `energyBurndownService.ts`:

```typescript
export const ENERGY_DECAY_CONFIG = {
  BASE_DECAY_RATE_PER_HOUR: 2.0, // Energy lost per hour
  MIN_ENERGY: 0, // Minimum energy (never goes below)
}
```

**Default**: 2 energy/hour
- 100 energy → 0 energy in 50 hours (~2 days)
- 50 energy → 0 energy in 25 hours (~1 day)

## Implementation Details

### Backend

#### `energyBurndownService.ts`
- `calculateCurrentEnergy()` - Calculates live energy based on time elapsed
- `getEnergyBurndownInfo()` - Returns detailed burndown metrics
- `getLiveEnergy()` - Gets current live energy for a user
- `updateEnergyRestorationTimestamp()` - Updates restoration timestamp

#### Database Schema
```prisma
model Resources {
  energy          Int       @default(100)
  energyRestoredAt DateTime? // Timestamp when energy was last restored
}
```

#### Integration Points
1. **Daily Tick** (`tickService.ts`):
   - Sets `energyRestoredAt` when energy is reset to 100

2. **Sleep Logging** (`SleepUseCases.ts`):
   - Updates `energyRestoredAt` when sleep restores energy

3. **Energy Status** (`EnergyController.ts`):
   - Returns live energy with burndown information

### Frontend

#### `EnergyStatusCard.tsx`
- Displays live burndown information
- Updates every minute to show current decay
- Shows:
  - Decay rate
  - Time elapsed
  - Energy decayed
  - Time until depletion
  - Restoration timestamp

#### `MasterEnergy.tsx`
- Refreshes energy status every minute
- Ensures live updates are visible

## API Response

### GET `/api/energy/status`

```json
{
  "baseEnergy": 85, // Live energy (after burndown)
  "restoredEnergy": 100, // Original restored amount
  "burndown": {
    "energyDecayed": 15,
    "hoursElapsed": 7.5,
    "decayRatePerHour": 2.0,
    "hoursUntilDepletion": 42.5,
    "depletedAt": "2024-01-02T10:30:00Z"
  },
  "restoredAt": "2024-01-01T03:00:00Z"
}
```

## Usage Examples

### Example 1: Energy Restored from Sleep
1. User logs sleep at 10:00 PM
2. Sleep restores 80 energy
3. `energyRestoredAt` set to 10:00 PM
4. Energy starts decaying at 2/hour
5. At 2:00 AM (4 hours later): 80 - (4 × 2) = 72 energy
6. At 10:00 AM (12 hours later): 80 - (12 × 2) = 56 energy

### Example 2: Daily Tick Reset
1. Daily tick runs at midnight
2. Energy reset to 100
3. `energyRestoredAt` set to midnight
4. Energy starts decaying immediately
5. At noon (12 hours later): 100 - (12 × 2) = 76 energy

## Benefits

1. **Real-Time Feedback**: Users see energy decreasing in real-time
2. **Urgency**: Creates natural urgency to use energy before it decays
3. **Planning**: Users can see when energy will be depleted
4. **Transparency**: Clear visibility into energy decay mechanics
5. **Engagement**: Live system keeps users engaged

## Future Enhancements

1. **Variable Decay Rates**: Different decay rates based on activity level
2. **Decay Pauses**: Pause decay during certain activities (e.g., sleep)
3. **Decay Acceleration**: Faster decay when capacity is low
4. **Visual Indicators**: Animated decay visualization
5. **Notifications**: Alerts when energy is low or depleted

## Technical Notes

- Energy calculation is done server-side for accuracy
- Frontend refreshes every minute to show updates
- Timestamps are stored in UTC
- Decay calculation uses floating-point precision but rounds to integers
- Minimum energy is 0 (never negative)

