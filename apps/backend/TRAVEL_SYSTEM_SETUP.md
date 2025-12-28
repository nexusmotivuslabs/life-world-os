# Travel System Setup

The Travel System can use either Google Places API (expensive but accurate) or LLM-based generation (cost-effective, recommended).

## Recommended: LLM-Based (Groq) - Cost-Effective

Groq is fast, cheap, and perfect for generating location recommendations.

### 1. Get Groq API Key

1. Go to https://console.groq.com
2. Sign up for a free account
3. Create an API key
4. Copy your API key

### 2. Install Groq SDK

```bash
cd apps/backend
npm install groq-sdk
```

### 3. Add to .env

Add to `apps/backend/.env`:

```env
# Groq API (recommended - fast and cheap)
GROQ_API_KEY=your-groq-api-key-here

# Enable LLM-based location generation (defaults to true if Google Places not set)
USE_LLM_FOR_LOCATIONS=true
```

### 4. Restart Backend

The system will automatically use Groq for location recommendations.

## Alternative: Google Places API (Expensive)

If you prefer Google Places API for more accurate real-time data:

```env
# Google Places API (expensive)
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here

# Disable LLM mode
USE_LLM_FOR_LOCATIONS=false
```

## Cost Comparison

- **Groq**: ~$0.27 per 1M input tokens, ~$0.27 per 1M output tokens
  - Typical location query: ~500 tokens = **$0.0001 per query**
- **Google Places API**: $17 per 1,000 requests
  - **$0.017 per query** (170x more expensive!)

## How It Works

### LLM Mode (Groq/OpenAI)
- User describes a location
- LLM generates 10-15 relevant location recommendations
- Returns structured data with names, addresses, ratings, descriptions
- Fast, cheap, and works well for general recommendations

### Google Places Mode
- Queries real-time Google Places database
- Returns actual business data, ratings, photos
- More accurate but significantly more expensive
- Requires billing account setup

## Switching Between Modes

The system automatically chooses:
1. If `USE_LLM_FOR_LOCATIONS=true` OR `GOOGLE_PLACES_API_KEY` is not set → Uses LLM
2. If `USE_LLM_FOR_LOCATIONS=false` AND `GOOGLE_PLACES_API_KEY` is set → Uses Google Places

## Testing

Check the health endpoint to see which mode is active:

```bash
curl http://localhost:3001/api/travel/health
```

Response:
```json
{
  "status": "ok",
  "locationService": "using-groq-llm",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```


