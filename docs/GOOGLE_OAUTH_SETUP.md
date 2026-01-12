# Google OAuth 2.0 Authentication Setup

This guide explains how to set up and use Google OAuth 2.0 authentication in the Life World OS application.

## Overview

The application supports two authentication methods:
1. **Email/Password** - Traditional username/password authentication
2. **Google OAuth 2.0** - Social login using Google Identity Services

Users can sign in with either method. Google OAuth uses ID token verification on the backend for security.

## Prerequisites

- Google Cloud Platform account
- Access to Google Cloud Console
- Backend and frontend running locally or in production

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for testing before publishing)

### 1.2 Create OAuth 2.0 Client ID

1. In the **Create OAuth client ID** dialog:
   - **Application type**: Web application
   - **Name**: Life World OS (or your preferred name)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (local development)
     - `http://localhost:5002` (local development - alternative port)
     - `https://yourdomain.com` (production)
     - `https://www.yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - Leave empty (we use Google Identity Services, not redirect flow)
     - OR add: `http://localhost:5173` and `https://yourdomain.com` if using redirect flow
2. Click **Create**
3. Copy the **Client ID** (you'll need this for environment variables)

## Step 2: Environment Variables

### 2.1 Backend Environment Variables

Add to `apps/backend/.env` or `apps/backend/.env.local`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret  # Optional, only needed for redirect flow
```

**Note**: For Google Identity Services (ID token verification), only `GOOGLE_CLIENT_ID` is required. The client secret is only needed if using server-side redirect flow.

### 2.2 Frontend Environment Variables

Add to `apps/frontend/.env` or `apps/frontend/.env.local`:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important**: Frontend environment variables must be prefixed with `VITE_` in Vite applications.

### 2.3 Production Environment Variables

For production deployments, add these to your environment configuration files:

**Staging** (`config/environments/staging.env`):
```env
STAGING_GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=${STAGING_GOOGLE_CLIENT_ID}
```

**Production** (`config/environments/prod.env.example`):
```env
PROD_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=${PROD_GOOGLE_CLIENT_ID}
```

**Security Note**: Store these in your secrets manager (AWS Secrets Manager, Azure Key Vault, etc.) in production. Never commit actual client IDs/secrets to version control.

## Step 3: Database Migration

Google OAuth requires schema changes to support users without passwords (OAuth-only users).

### 3.1 Update Prisma Schema

The User model needs these changes:
- `passwordHash` should be optional (nullable)
- Add `googleId` field (unique, nullable)

Example schema change:
```prisma
model User {
  // ... existing fields ...
  passwordHash               String?     @db.VarChar(255)  // Changed to optional
  googleId                   String?     @unique @db.VarChar(255)  // New field for Google user ID
  // ... rest of fields ...
}
```

### 3.2 Create and Run Migration

```bash
cd apps/backend
npm run migrate
```

This will:
1. Create a migration file
2. Update the database schema
3. Make existing `passwordHash` values nullable (no data loss)

**Important**: Test the migration in a development environment first.

## Step 4: Install Dependencies

### 4.1 Backend Dependencies

```bash
cd apps/backend
npm install google-auth-library
```

### 4.2 Frontend Dependencies

No additional frontend dependencies needed. Google Identity Services is loaded from Google's CDN.

## Step 5: Implementation Details

### 5.1 Authentication Flow

1. **Frontend**: User clicks "Sign in with Google" button
2. **Google Identity Services**: Shows Google sign-in popup
3. **User**: Selects Google account and grants permissions
4. **Frontend**: Receives ID token from Google
5. **Frontend**: Sends ID token to backend `/api/auth/google` endpoint
6. **Backend**: Verifies ID token with Google
7. **Backend**: Creates or finds user account
8. **Backend**: Returns JWT token
9. **Frontend**: Stores JWT token and redirects user

### 5.2 User Account Creation

- **New Google users**: Account is automatically created with:
  - Email from Google profile
  - Username generated from email (before @)
  - No password hash (OAuth-only user)
  - Google ID stored for future logins
- **Existing email users**: If email already exists:
  - If user has password: Google ID is linked to existing account
  - If user is OAuth-only: User is logged in
- **Username conflicts**: If username from email is taken, a number is appended

### 5.3 Security Considerations

- **ID Token Verification**: All Google ID tokens are verified on the backend
- **Token Expiration**: ID tokens expire after 1 hour (handled automatically)
- **JWT Tokens**: Application uses its own JWT tokens (7-day expiration by default)
- **No Token Storage**: Google tokens are never stored, only used for verification

## Step 6: Testing

### 6.1 Local Testing

1. Start backend: `cd apps/backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Navigate to login page
4. Click "Sign in with Google"
5. Select a test Google account
6. Verify you're logged in and redirected

### 6.2 Test Users

If your OAuth consent screen is in "Testing" status:
- Add test users in Google Cloud Console
- Only test users can sign in until you publish the app
- To publish: OAuth consent screen > Publishing status > Publish app

### 6.3 Common Issues

**Issue**: "Error 400: redirect_uri_mismatch"
- **Solution**: Check authorized JavaScript origins in Google Cloud Console
- Ensure URLs match exactly (including http/https, port numbers)

**Issue**: "Token verification failed"
- **Solution**: Verify `GOOGLE_CLIENT_ID` matches the Client ID in Google Cloud Console
- Check backend logs for detailed error messages

**Issue**: "User creation failed"
- **Solution**: Check database connection
- Verify Prisma migration completed successfully
- Check backend logs for database errors

## Step 7: Production Deployment

### 7.1 Update Authorized Origins

In Google Cloud Console, add your production domains:
- `https://yourdomain.com`
- `https://api.yourdomain.com` (if needed)
- Remove localhost URLs (or keep for staging)

### 7.2 Environment Variables

Set environment variables in your production environment:
- Use secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
- Never commit production credentials to version control
- Use different OAuth client IDs for staging and production (recommended)

### 7.3 Monitoring

Monitor these metrics:
- Google OAuth sign-in success rate
- Token verification failures
- User account creation rate
- Error rates in backend logs

## Step 8: Code Reference

### 8.1 Backend Endpoint

**POST** `/api/auth/google`

**Request Body**:
```json
{
  "idToken": "google-id-token-here"
}
```

**Response**:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### 8.2 Frontend Usage

The Google Sign-In button is automatically available on login and register pages. Users can choose between:
- Email/Password authentication
- Google OAuth authentication

## Step 9: Troubleshooting

### 9.1 Enable Logging

To debug OAuth issues, enable detailed logging:

**Backend** (add to `.env`):
```env
NODE_ENV=development
LOG_LEVEL=debug
```

### 9.2 Check Google Cloud Console

1. Verify OAuth consent screen is configured
2. Check authorized JavaScript origins
3. Verify API is enabled (Identity API)
4. Check quota limits (if applicable)

### 9.3 Database Issues

If user creation fails:
```bash
# Check database connection
cd apps/backend
npm run db:studio

# Verify schema
npx prisma validate

# Check migrations
npx prisma migrate status
```

## Step 10: Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-library Node.js Documentation](https://github.com/googleapis/google-auth-library-nodejs)

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Review Google Cloud Console for configuration issues
3. Verify environment variables are set correctly
4. Test with a new Google account to rule out user-specific issues

---

**Last Updated**: 2024
**Version**: 1.0
