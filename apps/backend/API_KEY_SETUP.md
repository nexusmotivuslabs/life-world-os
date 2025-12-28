# API Key Setup for Local Development

## Quick Setup

1. **Create `.env.local` file** in `apps/backend/` directory:
   ```bash
   cd apps/backend
   cp .env.local.example .env.local
   ```

2. **Get your Grok/xAI API Key**:
   - Visit: https://console.x.ai/
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (format: `xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

3. **Add the key to `.env.local`**:
   ```env
   XAI_API_KEY=xai-your-actual-api-key-here
   GROK_MODEL=grok-beta
   ```

4. **Restart your backend server**:
   ```bash
   npm run dev
   # or
   docker-compose up backend
   ```

## File Locations

### For Local Development:
- **File**: `apps/backend/.env.local`
- **Status**: Gitignored (safe to add secrets)
- **Purpose**: Local development only

### For Docker Compose:
- **File**: `.env.dev` (in project root)
- **Status**: Gitignored
- **Purpose**: Docker Compose environment variables

### Example Files (Safe to Commit):
- `apps/backend/.env.example` - Template for backend
- `apps/backend/.env.local.example` - Template for local secrets
- `config/environments/dev.env.example` - Template for Docker Compose

## Environment Variable Names

The backend accepts either:
- `XAI_API_KEY` (preferred)
- `GROK_API_KEY` (alternative, also works)

Both are checked, so use whichever you prefer.

## Verification

After setting up, test the Guide Bot:
1. Start the backend server
2. Open the frontend
3. Click the Guide Bot icon (bottom right)
4. Send a test message
5. If it responds, the API key is working! ✅

## Troubleshooting

**Error: "AI service is not properly configured"**
- Check that `.env.local` exists in `apps/backend/`
- Verify the API key starts with `xai-`
- Make sure there are no extra spaces or quotes
- Restart the backend server

**Error: "401 Unauthorized"**
- Your API key is invalid or expired
- Get a new key from https://console.x.ai/
- Update `.env.local` and restart

**Error: "API key not found"**
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Verify the file is in `apps/backend/` directory
- Check that `dotenv.config()` is called in `aiService.ts` (it is)

## Security Notes

- ✅ `.env.local` is gitignored - safe to add secrets
- ❌ Never commit `.env.local` to git
- ✅ `.env.example` files are safe to commit (no real keys)
- ✅ Use different keys for dev/staging/production


