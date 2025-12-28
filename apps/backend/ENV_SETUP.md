# Environment Setup

## Backend .env File

Create `apps/backend/.env` with the following:

```env
# Database
DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5433/lifeworld

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3001

# Ollama Configuration (for local LLM)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Optional: OpenAI Configuration (if using OpenAI instead of Ollama)
# OPENAI_API_KEY=your-openai-api-key-here

# Grok/xAI API (Required for Guide Bot)
# See .dev-secrets/API_KEY_SETUP.md for setup instructions
# Add to apps/backend/.env.local (gitignored)
# XAI_API_KEY=xai-your-grok-api-key-here
# GROK_MODEL=grok-beta

# Optional: Groq Configuration (fast and cheap LLM - recommended for Travel System)
# Get API key from: https://console.groq.com
# GROQ_API_KEY=your-groq-api-key-here

# Optional: Google Places API (for Travel System - expensive, use LLM instead)
# GOOGLE_PLACES_API_KEY=your-google-places-api-key-here

# Travel System Configuration
# Set to 'true' to use LLM for location generation (recommended - cost-effective)
# Set to 'false' to use Google Places API (more accurate but expensive)
# Defaults to 'true' if GOOGLE_PLACES_API_KEY is not set
# USE_LLM_FOR_LOCATIONS=true
```

## Frontend .env File

Create `apps/frontend/.env` with the following:

```env
VITE_API_URL=http://localhost:3001
```

## Security Notes

- **JWT_SECRET**: Must be at least 32 characters. Use a strong random string in production.
- **DATABASE_URL**: Matches the credentials in `docker-compose.yml`
- **OLLAMA_URL**: Default is `http://localhost:11434`. Change if Ollama runs on a different host/port.
- **OLLAMA_MODEL**: Default is `llama3.2`. Change to use a different model (e.g., `mistral`, `qwen2.5`).
- Never commit `.env` files to version control

## Ollama Setup

See [OLLAMA_SETUP.md](../OLLAMA_SETUP.md) for detailed Ollama installation and configuration instructions.
