import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { validateText } from "./validate.js";
import { summarize } from "./llm.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.post("/api/summarize", async (req: Request, res: Response) => {
  const validationError = validateText(req.body.text);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const result = await summarize(req.body.text as string);
    res.json(result);
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: "Invalid model response" });
    } else {
      res.status(500).json({ error: "Failed to summarize text" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
