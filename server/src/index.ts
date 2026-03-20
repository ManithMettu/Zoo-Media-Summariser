import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface SummarizeRequest {
  text: string;
}

interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
}

app.post("/api/summarize", async (req: Request, res: Response) => {
  const { text } = req.body as SummarizeRequest;

  if (!text || text.trim() === "") {
    res.status(400).json({ error: "Input text is required" });
    return;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a text analysis assistant. Analyze the provided text and respond with ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "summary": "one sentence summary of the text",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "sentiment": "positive"
}

Rules:
- summary: exactly 1 sentence
- keyPoints: exactly 3 items
- sentiment: must be exactly one of: positive, neutral, negative
- Return ONLY the JSON object, nothing else`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: SummarizeResponse;
    try {
      parsed = JSON.parse(raw) as SummarizeResponse;
    } catch {
      res.status(500).json({ error: "Invalid model response" });
      return;
    }

    res.json(parsed);
  } catch {
    res.status(500).json({ error: "Failed to summarize text" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
