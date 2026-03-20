import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "./prompt";

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function summarize(text: string): Promise<SummarizeResponse> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return JSON.parse(raw) as SummarizeResponse;
}
