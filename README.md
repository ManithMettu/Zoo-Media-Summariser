# AI Text Summarizer

A minimal full-stack web app that accepts a block of text, sends it to an LLM, and returns a structured summary — one sentence, three key points, and a sentiment label.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend   | Node.js + Express + TypeScript          |
| AI        | Groq API — `llama-3.3-70b-versatile`   |

---

## Project Structure

```
assignment-summarizer/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx          # Main UI — two-column layout
│   │   ├── main.tsx
│   │   └── index.css        # Tailwind directives
│   ├── .env                 # VITE_API_URL
│   ├── .env.example
│   └── package.json
└── server/                  # Express backend
    ├── src/
    │   └── index.ts         # POST /api/summarize
    ├── .env                 # GROQ_API_KEY, PORT, CLIENT_URL
    ├── .env.example
    └── package.json
```

---

## Setup

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

**Backend** — copy and fill in your Groq API key:
```bash
cd server
cp .env.example .env
```

`server/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
CLIENT_URL=http://localhost:5173
```

**Frontend** — already set up for local development:
```bash
cd client
cp .env.example .env
```

`client/.env`:
```
VITE_API_URL=http://localhost:3000
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Run the backend

```bash
cd server
npm run dev
# → Server running on port 3000
```

### 4. Run the frontend

```bash
cd client
npm run dev
# → http://localhost:5173
```

---

## API

### `POST /api/summarize`

**Request**
```json
{ "text": "Your text here..." }
```

**Response — success**
```json
{
  "summary": "One sentence overview of the text.",
  "keyPoints": ["Point one", "Point two", "Point three"],
  "sentiment": "positive"
}
```

**Response — errors**

| Scenario           | Status | Body                              |
|--------------------|--------|-----------------------------------|
| Empty input        | 400    | `{ "error": "Input text is required" }` |
| Bad model JSON     | 500    | `{ "error": "Invalid model response" }` |
| API/network failure| 500    | `{ "error": "Failed to summarize text" }` |

---

## Why Groq?

Groq's inference API runs LLaMA 3.3 70B at extremely low latency (typically under 1 second for short inputs) with a generous free tier — no credit card required. For a task like structured text extraction, a fast open-weight model is more than sufficient and avoids OpenAI billing friction during evaluation.

---

## Prompt Design

The system prompt is written to eliminate ambiguity and prevent the model from adding anything outside the JSON object:

```
You are a text analysis assistant. Analyze the provided text and respond with ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "summary": "one sentence summary of the text",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "sentiment": "positive"
}

Rules:
- summary: exactly 1 sentence
- keyPoints: exactly 3 items
- sentiment: must be exactly one of: positive, neutral, negative
- Return ONLY the JSON object, nothing else
```

**Key decisions:**

- **Explicit format in the prompt** — showing the exact JSON shape removes guesswork for the model and reduces the chance of it wrapping output in markdown fences.
- **Enumerated rules** — listing constraints as numbered rules (rather than prose) reduces the chance the model ignores one.
- **`temperature: 0.3`** — lower temperature keeps output deterministic and structured. Creative tasks benefit from higher values; structured extraction does not.
- **Sentinel values** — restricting sentiment to exactly three strings (`positive`, `neutral`, `negative`) makes client-side handling trivial and predictable.

The JSON is parsed with a `try/catch`. If parsing fails, a `500` is returned rather than crashing or returning garbage to the client.

---

## Example Output

**Input:**
> SpaceX successfully launched its Starship rocket on a test flight, reaching orbital velocity for the first time. The vehicle demonstrated heat shield performance during reentry and performed a controlled splashdown. Engineers called the milestone a major step toward Mars missions and reusable heavy-lift launch vehicles.

**Output:**
```json
{
  "summary": "SpaceX's Starship rocket achieved orbital velocity and a controlled reentry on its latest test flight, marking a significant milestone toward future Mars missions.",
  "keyPoints": [
    "Starship reached orbital velocity for the first time during the test flight",
    "The heat shield performed successfully during atmospheric reentry",
    "Engineers view the milestone as a key step toward reusable heavy-lift vehicles and Mars travel"
  ],
  "sentiment": "positive"
}
```

**Rendered in the UI:**

```
┌─────────────────────────────────────────────────────────────┐
│ SUMMARY                                                      │
│ SpaceX's Starship rocket achieved orbital velocity and a     │
│ controlled reentry, marking a key milestone toward Mars.     │
├─────────────────────────────────────────────────────────────│
│ KEY POINTS                                                   │
│  1  Starship reached orbital velocity for the first time     │
│  2  Heat shield performed successfully during reentry        │
│  3  Engineers see it as a step toward Mars & reusability     │
├─────────────────────────────────────────────────────────────│
│ SENTIMENT   ● Positive                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Trade-offs & Shortcuts

| Decision | Trade-off |
|----------|-----------|
| Plain `JSON.parse` instead of Groq's structured output mode | Simpler code, but relies on the model following the prompt. A `response_format: { type: "json_object" }` param would guarantee valid JSON from the API side. |
| No input length limit | Very long inputs could hit token limits or inflate cost. A character cap (e.g. 10,000 chars) would be the right guardrail. |
| No auth or rate limiting | Fine for local/demo use. `express-rate-limit` would be the first addition for any public deployment. |
| Frontend calls backend directly | Works for local dev. In production, a proxy (Vite's `server.proxy` or a reverse proxy) avoids exposing the backend port. |
| Single endpoint, no streaming | Streaming the response would improve perceived latency for longer inputs. |

---

## What I'd Add With More Time

- **Groq structured output** — use `response_format: { type: "json_object" }` to guarantee parse-safe responses
- **Input character counter + limit** — prevent accidental large payloads
- **Rate limiting** — `express-rate-limit` middleware on the `/api/summarize` route
- **Copy to clipboard** — one-click copy of summary or full JSON
- **Batch mode** — accept multiple text blocks and return results for each
- **Confidence note** — ask the model to flag low-confidence sentiment classifications
