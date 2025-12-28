# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All endpoints except `/api/auth/*` require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### User

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "currentSeason": "SPRING",
  "seasonStartDate": "2024-01-01T00:00:00Z",
  "overallXP": 0,
  "overallRank": "RECRUIT",
  "overallLevel": 1,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Clouds

#### Get All Clouds
```http
GET /api/clouds
Authorization: Bearer <token>
```

**Response:**
```json
{
  "capacity": 50,
  "engines": 50,
  "oxygen": 50,
  "meaning": 50,
  "optionality": 50,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

#### Update Cloud Strength
```http
PUT /api/clouds/:cloudType
Authorization: Bearer <token>
Content-Type: application/json

{
  "strength": 75
}
```

**cloudType**: `capacity`, `engines`, `oxygen`, `meaning`, `optionality`

**Response:**
```json
{
  "capacity": 75,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Resources

#### Get Resources
```http
GET /api/resources
Authorization: Bearer <token>
```

**Response:**
```json
{
  "oxygen": 0.0,
  "water": 50,
  "gold": 0.0,
  "armor": 0,
  "keys": 0,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

#### Record Resource Transaction
```http
POST /api/resources/transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "oxygen": 1.5,
  "water": 10,
  "gold": 1000.0,
  "armor": 5,
  "keys": 1
}
```

**Response:** Updated resources object

#### Get Resource History
```http
GET /api/resources/history?limit=50
Authorization: Bearer <token>
```

### Engines

#### List Engines
```http
GET /api/engines
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "CAREER",
    "name": "Software Engineer",
    "description": "Full-time job",
    "fragilityScore": 70,
    "currentOutput": 5000.0,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Engine
```http
POST /api/engines
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "CAREER",
  "name": "Software Engineer",
  "description": "Full-time job",
  "fragilityScore": 70,
  "currentOutput": 5000.0,
  "status": "ACTIVE"
}
```

#### Update Engine
```http
PUT /api/engines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Senior Software Engineer",
  "currentOutput": 6000.0
}
```

#### Delete Engine
```http
DELETE /api/engines/:id
Authorization: Bearer <token>
```

### Seasons

#### Get Current Season
```http
GET /api/seasons/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "season": "SPRING",
  "startDate": "2024-01-01T00:00:00Z",
  "daysInSeason": 15
}
```

#### Transition Season
```http
POST /api/seasons/transition
Authorization: Bearer <token>
Content-Type: application/json

{
  "season": "SUMMER",
  "reason": "Ready for peak output"
}
```

**Response:** Updated season info

**Errors:**
- `400` - Transition not allowed (with reason)

#### Get Season History
```http
GET /api/seasons/history?limit=20
Authorization: Bearer <token>
```

### XP System

#### Get XP
```http
GET /api/xp
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overallXP": 5000,
  "overallRank": "PRIVATE",
  "overallLevel": 2,
  "categoryXP": {
    "capacity": 1000,
    "engines": 2000,
    "oxygen": 500,
    "meaning": 300,
    "optionality": 700
  },
  "categoryLevels": {
    "capacity": 2,
    "engines": 3,
    "oxygen": 1,
    "meaning": 1,
    "optionality": 1
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

#### Calculate XP (Preview)
```http
POST /api/xp/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityType": "WORK_PROJECT",
  "customXP": {
    "overall": 500,
    "category": {
      "engines": 300
    }
  }
}
```

**Response:**
```json
{
  "overallXP": 650,
  "categoryXP": {
    "capacity": 120,
    "engines": 390,
    "oxygen": 65,
    "meaning": 0,
    "optionality": 0
  },
  "seasonMultiplier": 1.3
}
```

#### Record Activity
```http
POST /api/xp/activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityType": "WORK_PROJECT",
  "description": "Completed major feature",
  "customXP": {
    "overall": 500,
    "category": {
      "engines": 300
    }
  },
  "resourceChanges": {
    "oxygen": 0.5,
    "water": -5
  }
}
```

**Response:**
```json
{
  "xpGained": {
    "overallXP": 650,
    "categoryXP": {...},
    "seasonMultiplier": 1.3
  },
  "newOverallXP": 5650,
  "newRank": "PRIVATE",
  "newLevel": 2,
  "milestones": {
    "newMilestones": [],
    "unlockedKeys": 0
  }
}
```

#### Get XP History
```http
GET /api/xp/history?limit=50
Authorization: Bearer <token>
```

#### Get Categories
```http
GET /api/xp/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isBalanced": false,
  "averageLevel": 1.6,
  "categoryLevels": {
    "capacity": 2,
    "engines": 3,
    "oxygen": 1,
    "meaning": 1,
    "optionality": 1
  },
  "warnings": [
    "Oxygen level is significantly below average"
  ],
  "recommendations": [
    "Focus on financial stability and savings"
  ]
}
```

### Progression

#### Get Overall Progression
```http
GET /api/progression/overall
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overallXP": 5000,
  "overallRank": "PRIVATE",
  "overallLevel": 2,
  "xpForNextRank": 0,
  "progressToNextRank": 100.0
}
```

#### Get Category Progression
```http
GET /api/progression/categories
Authorization: Bearer <token>
```

#### Get Milestones
```http
GET /api/progression/milestones
Authorization: Bearer <token>
```

#### Check Milestones
```http
POST /api/progression/check-milestones
Authorization: Bearer <token>
```

**Response:**
```json
{
  "newMilestones": ["SIX_MONTHS_EXPENSES"],
  "unlockedKeys": 1
}
```

#### Get Balance
```http
GET /api/progression/balance
Authorization: Bearer <token>
```

### Dashboard

#### Get Dashboard
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response:** Complete dashboard data including user, season, clouds, resources, XP, balance, and engines

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Activity Types

- `WORK_PROJECT` - Work project completion
- `EXERCISE` - Exercise session
- `SAVE_EXPENSES` - Saving expenses
- `LEARNING` - Learning/course completion
- `SEASON_COMPLETION` - Season cycle completion
- `MILESTONE` - Milestone achievement
- `CUSTOM` - Custom activity

## Cloud Types

- `capacity` - Capacity Cloud
- `engines` - Engines Cloud
- `oxygen` - Oxygen Cloud
- `meaning` - Meaning Cloud
- `optionality` - Optionality Cloud


