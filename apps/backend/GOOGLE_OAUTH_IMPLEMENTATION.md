# Google OAuth Implementation Guide

This document provides implementation details for Google OAuth 2.0 authentication in the backend.

## Architecture

### Authentication Flow

```
User → Frontend (Google Sign-In) → Google → Frontend (ID Token)
  ↓
Frontend → Backend /api/auth/google (ID Token)
  ↓
Backend → Google (Verify ID Token)
  ↓
Backend → Database (Create/Find User)
  ↓
Backend → Frontend (JWT Token)
```

### Components

1. **Google Identity Services** (Frontend) - Handles user sign-in
2. **OAuth2Client** (Backend) - Verifies Google ID tokens
3. **Auth Routes** (Backend) - `/api/auth/google` endpoint
4. **User Service** (Backend) - User creation and lookup logic

## Implementation Steps

### 1. Database Schema Changes

**Prisma Schema Update** (`prisma/schema.prisma`):

```prisma
model User {
  // ... existing fields ...
  passwordHash  String?  @db.VarChar(255)  // Make optional
  googleId      String?  @unique @db.VarChar(255)  // Add Google ID
  // ... rest of fields ...
}
```

**Migration Command**:
```bash
npm run migrate
```

### 2. Install Dependencies

```bash
npm install google-auth-library
```

### 3. Environment Variables

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Code Implementation

#### 4.1 Auth Route Handler

Add to `src/routes/auth.ts`:

```typescript
import { OAuth2Client } from 'google-auth-library'

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Helper function to initialize user data
async function initializeUserData(userId: string) {
  await Promise.all([
    prisma.cloud.create({
      data: {
        userId,
        capacityStrength: 50,
        enginesStrength: 50,
        oxygenStrength: 50,
        meaningStrength: 50,
        optionalityStrength: 50,
      },
    }),
    prisma.resources.create({
      data: {
        userId,
        oxygen: 0,
        water: 50,
        gold: 0,
        armor: 0,
        keys: 0,
        energy: 100,
      },
    }),
    prisma.xP.create({
      data: {
        userId,
        overallXP: 0,
        overallRank: 'RECRUIT',
        overallLevel: 1,
        capacityXP: 0,
        enginesXP: 0,
        oxygenXP: 0,
        meaningXP: 0,
        optionalityXP: 0,
      },
    }),
  ])
}

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' })
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured' })
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { sub: googleId, email, name, picture } = payload

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' })
    }

    // Generate username from email (before @)
    const baseUsername = email.split('@')[0]
    let username = baseUsername
    let usernameCounter = 1

    // Find existing user by Google ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    })

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        })
      }
    } else {
      // Create new user
      // Ensure unique username
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${usernameCounter}`
        usernameCounter++
      }

      try {
        user = await prisma.user.create({
          data: {
            email,
            username,
            googleId,
            passwordHash: null, // OAuth-only user
          },
        })

        // Initialize user data
        await initializeUserData(user.id)
      } catch (createError: any) {
        console.error('User creation error:', createError)
        return res.status(500).json({ 
          error: 'Failed to create user account',
          details: process.env.NODE_ENV === 'development' ? createError.message : undefined
        })
      }
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Google OAuth error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Token used too early')) {
        return res.status(401).json({ error: 'Token not yet valid' })
      }
      if (error.message.includes('Token used too late')) {
        return res.status(401).json({ error: 'Token expired' })
      }
      if (error.message.includes('JWT_SECRET')) {
        return res.status(500).json({ error: 'Server configuration error' })
      }
    }
    
    res.status(500).json({ error: 'Authentication failed' })
  }
})
```

## Error Handling

### Common Errors

1. **400 Bad Request**: Missing ID token
2. **401 Unauthorized**: Invalid or expired token
3. **500 Internal Server Error**: Server configuration issues

### Error Responses

All errors follow this format:
```json
{
  "error": "Error message here",
  "details": "Additional details (development only)"
}
```

## Testing

### Manual Testing

1. Use Google Identity Services in frontend
2. Sign in with Google account
3. Verify token is sent to backend
4. Check backend logs for verification
5. Verify user is created/logged in
6. Check JWT token is returned

### Test Cases

1. **New Google User**: Should create new account
2. **Existing Google User**: Should log in existing account
3. **Existing Email User**: Should link Google ID to existing account
4. **Invalid Token**: Should return 401
5. **Missing Configuration**: Should return 500

## Security Considerations

1. **Token Verification**: Always verify ID tokens on backend
2. **Client ID Validation**: Verify token audience matches client ID
3. **No Token Storage**: Never store Google tokens, only verify
4. **JWT Tokens**: Use application JWT tokens for session management
5. **HTTPS Only**: Always use HTTPS in production

## Performance

- Token verification: ~100-200ms
- User lookup: ~50-100ms
- User creation: ~200-300ms
- Total request time: ~350-600ms

## Monitoring

Monitor these metrics:
- Google OAuth request rate
- Token verification success rate
- User creation rate
- Error rates by type
- Response times

## Future Enhancements

Possible improvements:
1. Token caching (verify once per session)
2. Refresh token support
3. Multiple OAuth providers (GitHub, Microsoft, etc.)
4. Account linking UI
5. OAuth token revocation
