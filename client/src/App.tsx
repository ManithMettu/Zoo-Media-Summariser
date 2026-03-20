import { useState } from "react";
import ResultCard from "./components/ResultCard";

interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
}

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummarizeResult | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to analyze text.");
        return;
      }
      setResult(data as SummarizeResult);
    } catch {
      setError("Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center gap-3">
        <span className="font-semibold text-gray-900 tracking-tight">AI Summarizer</span>
        <span className="ml-auto text-xs text-gray-400 font-mono">Powered by Groq · LLaMA 3.3</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col p-6 gap-4 max-w-7xl mx-auto w-full">
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Summarize anything, instantly
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Paste any text — articles, docs, notes — and get a clean AI-powered breakdown.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT — Input */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Input</span>
              <span className="text-xs text-gray-400 font-mono">{wordCount} words</span>
            </div>

            <textarea
              className="flex-1 w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm leading-relaxed p-4 resize-none focus:outline-none min-h-[320px]"
              placeholder="Paste your article, document, or any block of text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Summarize
                  </>
                )}
              </button>
              {(text || result) && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 text-sm transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — Output */}
          <ResultCard result={result} loading={loading} error={error} />
        </div>
      </main>
    </div>
  );
}
