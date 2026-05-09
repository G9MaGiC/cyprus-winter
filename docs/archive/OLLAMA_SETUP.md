**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Ollama Setup — Cyprus Winter AI Chat

Run the Cyprus Winter AI chat assistant locally using [Ollama](https://ollama.com). No API keys required.

---

## Prerequisites

- [Ollama](https://ollama.com) installed on your machine
- Cyprus Winter dev server (`npm run dev`)

---

## Setup Steps

### 1. Install and start Ollama

Install from [ollama.com](https://ollama.com). On macOS/Linux, the Ollama app typically runs the server automatically. If not:

```bash
ollama serve
```

### 2. Pull a model

The chat API uses OpenAI-compatible completions. Pull a model that supports chat:

```bash
ollama pull llama3.2
```

Other supported models:

- `llama3.1` — larger, more capable
- `llama3.2` — default in Cyprus Winter (good balance)
- `mistral` — fast, smaller
- `phi3` — compact, efficient

### 3. Configure environment

Create or edit `.env.local` in the project root:

```
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

- `OLLAMA_BASE_URL` — required; Ollama’s OpenAI-compatible API endpoint
- `OLLAMA_MODEL` — optional; defaults to `llama3.2` if not set

### 4. Restart the dev server

```bash
npm run dev
```

---

## Verification

1. **Health check**

   ```bash
   curl -s http://localhost:3000/api/health | jq '.ai'
   ```

   Should return `true` when Ollama is configured.

2. **Chat in the app**

   - Open [http://localhost:3000](http://localhost:3000)
   - Click "Ask AI" (floating button or nav)
   - Send a message (e.g. "Best wineries near Troodos")
   - You should get a response from your local model

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ai: false` in health check | Ensure `OLLAMA_BASE_URL` is set in `.env.local` and the dev server was restarted |
| Connection refused | Start Ollama: `ollama serve` or open the Ollama app |
| Model not found | Pull the model: `ollama pull llama3.2` |
| Slow responses | Use a smaller model (e.g. `phi3`, `mistral`) or ensure enough RAM |
| Chat returns 503 | Check that no other AI provider env vars are conflicting; Ollama is tried after Groq in the provider order |

---

## Provider Priority

Cyprus Winter tries AI providers in this order: AI Gateway → xAI → Groq → **Ollama** → Moonshot → OpenAI. If you have multiple keys set, Ollama is used only when earlier providers are not configured.

To force Ollama, set only `OLLAMA_BASE_URL` (and optionally `OLLAMA_MODEL`) in `.env.local`.
