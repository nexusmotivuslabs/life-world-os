# Ollama Integration

The Master Money System now uses **Ollama** for local LLM inference, allowing you to run everything locally without API costs.

## Quick Start

1. **Install Ollama**
   ```bash
   # Visit https://ollama.ai and install, or:
   # macOS: brew install ollama
   # Linux: curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull Required Models**
   ```bash
   # LLM model for chat/responses (choose one)
   ollama pull llama3.2        # Fast, recommended
   # ollama pull mistral       # Better quality, slower
   # ollama pull qwen2.5       # Good for structured tasks
   
   # Embedding model for vector search
   ollama pull nomic-embed-text
   ```

3. **Configure Environment**
   Add to `apps/backend/.env`:
   ```env
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   OLLAMA_EMBEDDING_MODEL=nomic-embed-text
   ```

4. **Update Database Schema**
   The migration uses 768 dimensions for Ollama embeddings. Run:
   ```bash
   cd apps/backend
   psql -d lifeworld -f prisma/migrations/add_pgvector_extension.sql
   ```

## How It Works

### LLM Adapter (`OllamaLMAdapter`)
- Connects to Ollama API at `http://localhost:11434`
- Uses the configured model (default: `llama3.2`)
- Implements the same interface as `OpenAILMAdapter`, so they're interchangeable

### Embedding Adapter (`OllamaEmbeddingAdapter`)
- Uses Ollama's embedding models (default: `nomic-embed-text`)
- Produces 768-dimensional embeddings (vs OpenAI's 1536)
- Database schema is configured for 768 dimensions

### Switching Between Ollama and OpenAI

The adapters are designed to be interchangeable. In the controllers:

**Use Ollama (current setup):**
```typescript
const llmService = new OllamaLMAdapter()
const embeddingService = new OllamaEmbeddingAdapter()
```

**Use OpenAI:**
```typescript
const llmService = new OpenAILMAdapter()
const embeddingService = new OpenAIEmbeddingAdapter()
```

Note: If switching to OpenAI, you'll need to update the database vector column to 1536 dimensions.

## Performance

- **LLM Response Time**: ~1-5 seconds depending on model and hardware
- **Embedding Generation**: ~0.1-0.5 seconds per text
- **Hardware**: Models run on CPU if no GPU available. GPU significantly improves performance.

## Troubleshooting

**"Cannot connect to Ollama"**
- Make sure Ollama is running: `ollama list`
- Check service: `curl http://localhost:11434/api/tags`

**"Model not found"**
- Pull the model: `ollama pull llama3.2`
- List available: `ollama list`

**Dimension mismatch errors**
- Ensure database uses `vector(768)` for Ollama
- Check embedding adapter is using correct model

See [OLLAMA_SETUP.md](../../OLLAMA_SETUP.md) for detailed setup instructions.


