# Ollama Setup Guide

This guide explains how to set up Ollama for local LLM inference in the Master Money System.

## Installation

1. **Install Ollama**
   - Visit https://ollama.ai
   - Download and install Ollama for your operating system
   - Verify installation: `ollama --version`

2. **Start Ollama Service**
   - Ollama runs as a service on `http://localhost:11434` by default
   - On macOS/Linux: It starts automatically after installation
   - On Windows: Start the Ollama service from the Start menu

## Required Models

### LLM Models (for chat/responses)

Pull one of these models:

```bash
# Recommended: Fast and capable
ollama pull llama3.2

# Alternative: Better quality, slower
ollama pull mistral

# Alternative: Good for structured tasks
ollama pull qwen2.5
```

### Embedding Models (for vector search)

Pull one of these embedding models:

```bash
# Recommended: Good balance of quality and speed (768 dimensions)
ollama pull nomic-embed-text

# Alternative: Higher quality, larger model
ollama pull mxbai-embed-large
```

## Configuration

Set environment variables in your `.env` file:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Optional: Use OpenAI instead (if you prefer)
# OPENAI_API_KEY=your-key-here
```

## Important Notes

### Embedding Dimensions

- **Ollama (nomic-embed-text)**: 768 dimensions
- **OpenAI (text-embedding-3-small)**: 1536 dimensions

The database migration uses **768 dimensions** to match Ollama's default embedding model. If you switch to OpenAI embeddings, you'll need to:

1. Update the migration file to use `vector(1536)` instead of `vector(768)`
2. Create a new migration or manually alter the column

### Vector Database Schema

The `knowledge_articles` table uses a vector column. Make sure pgvector extension is installed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then run the migration:
```bash
psql -d lifeworld -f prisma/migrations/add_pgvector_extension.sql
```

## Testing

Test Ollama connectivity:

```bash
# Test if Ollama is running
curl http://localhost:11434/api/tags

# Test LLM
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello!"}]
}'

# Test embeddings
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "Hello world"
}'
```

## Switching Between Ollama and OpenAI

The adapters are designed to be interchangeable. To switch:

### Use Ollama (default):
```typescript
const llmService = new OllamaLMAdapter()
const embeddingService = new OllamaEmbeddingAdapter()
```

### Use OpenAI:
```typescript
const llmService = new OpenAILMAdapter()
const embeddingService = new OpenAIEmbeddingAdapter()
```

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running: `ollama list`
- Check if the service is listening: `curl http://localhost:11434/api/tags`
- Verify `OLLAMA_URL` environment variable

### "Model not found"
- Pull the model: `ollama pull llama3.2`
- Check available models: `ollama list`
- Verify `OLLAMA_MODEL` environment variable matches pulled model

### Embedding dimension mismatch
- If using Ollama: Ensure database uses `vector(768)`
- If using OpenAI: Change to `vector(1536)` and regenerate embeddings

## Performance Tips

1. **Model Selection**: Smaller models (llama3.2) are faster but less capable. Larger models (mistral) are more capable but slower.

2. **Batch Processing**: Ollama doesn't support batch embeddings efficiently. For large-scale embedding generation, consider:
   - Using OpenAI embeddings for initial seeding
   - Processing embeddings in smaller batches
   - Caching embeddings to avoid regeneration

3. **Hardware**: LLM performance depends on available RAM and GPU. Models run on CPU if no GPU is available.


