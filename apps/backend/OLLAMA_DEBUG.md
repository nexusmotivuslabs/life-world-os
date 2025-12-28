# Ollama Local Debugging Guide

## Quick Commands

### 1. Check Ollama Status
```bash
# List all available models
curl http://localhost:11434/api/tags | jq

# Or use the debug script
npm run ollama:debug -- --models
```

### 2. Test a Model Directly
```bash
# Test with a prompt
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"deepseek-r1:1.5b","prompt":"Hello","stream":false}' | jq

# Or use the debug script
npm run ollama:debug -- --test "Hello, how are you?"
```

### 3. View Model Details
```bash
# Show model information
curl -X POST http://localhost:11434/api/show \
  -d '{"name":"deepseek-r1:1.5b"}' | jq

# Or use the debug script
npm run ollama:debug -- --show deepseek-r1:1.5b
```

### 4. Check Running Models
```bash
ollama ps
```

### 5. View Ollama Logs

**macOS:**
```bash
# Server logs
cat ~/.ollama/logs/server.log

# Or follow logs in real-time
tail -f ~/.ollama/logs/server.log
```

**Enable Debug Mode:**
```bash
export OLLAMA_DEBUG=1
ollama serve
```

## Using the Debug Script

The project includes a TypeScript debug script:

```bash
# List all models
npm run ollama:debug -- --models

# Show model details
npm run ollama:debug -- --show deepseek-r1:1.5b

# Test with a prompt
npm run ollama:debug -- --test "What is Life World OS?"

# Test with a different model
npm run ollama:debug -- --test "Hello" --model llama3.2
```

## Monitor API Calls from Your App

### Option 1: Add Logging to aiService.ts
The `aiService.ts` already logs errors. To see all requests:

```typescript
// In aiService.ts, add before the API call:
console.log('[Ollama] Request:', { model, prompt: userMessage.substring(0, 50) });
```

### Option 2: Use Network Monitoring
```bash
# Monitor HTTP requests to Ollama
sudo tcpdump -i lo0 -A 'tcp port 11434' | grep -E "POST|GET|model|prompt"
```

### Option 3: Use Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "ollama" or "11434"
4. See all API requests from frontend

## Common Debugging Scenarios

### Model Not Found
```bash
# Check if model exists
curl http://localhost:11434/api/tags | jq '.models[].name'

# Pull the model if missing
ollama pull deepseek-r1:1.5b
```

### Connection Refused
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Or on macOS, open the Ollama app
open -a Ollama
```

### Slow Responses
```bash
# Check model size and system resources
ollama ps

# Test response time
time curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"deepseek-r1:1.5b","prompt":"test","stream":false}'
```

### View Raw API Responses
```bash
# See full response including thinking tags
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"deepseek-r1:1.5b","prompt":"Hello","stream":false}' \
  | jq '.response'
```

## Integration with Your App

### Check What Your App is Sending
Add this to `apps/backend/src/services/aiService.ts`:

```typescript
console.log('[Ollama Debug]', {
  url: ollamaUrl,
  model: model,
  messageCount: messages.length,
  userMessage: userMessage.substring(0, 100)
});
```

### View Backend Logs
```bash
# Watch backend logs
tail -f /tmp/life-world-backend.log

# Or if running in terminal
# Just watch the console output
```

## Web UI (Optional)

Ollama doesn't have a built-in web UI, but you can use:

1. **Open WebUI for Ollama** (third-party):
   ```bash
   docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
     -v open-webui:/app/backend/data --name open-webui \
     --restart always ghcr.io/open-webui/open-webui:main
   ```
   Then visit: http://localhost:3000

2. **Ollama WebUI** (another option):
   ```bash
   npm install -g ollama-webui
   ollama-webui
   ```

## Quick Reference

| Command | Purpose |
|--------|---------|
| `ollama list` | List all models |
| `ollama ps` | Show running models |
| `ollama show <model>` | Show model details |
| `ollama run <model>` | Interactive chat |
| `curl http://localhost:11434/api/tags` | API: List models |
| `npm run ollama:debug` | Use debug script |

