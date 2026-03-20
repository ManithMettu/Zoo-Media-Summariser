import { useState } from "react";

interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  negative: {
    label: "Negative",
    color: "text-rose-700 bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
  },
};

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
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

  const sentiment = result ? sentimentConfig[result.sentiment] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center gap-3">
        <span className="font-semibold text-gray-900 tracking-tight">AI Summarizer</span>
        <span className="ml-auto text-xs text-gray-400 font-mono">Powered by Groq · LLaMA 3.3</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col p-6 gap-4 max-w-7xl mx-auto w-full">
        {/* Title */}
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
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Analysis</span>
              {result && sentiment && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sentiment.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sentiment.dot}`} />
                  {sentiment.label}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 flex flex-col min-h-[320px]">
              {/* Empty state */}
              {!result && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-sm">Your analysis will appear here</p>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="flex-1 flex flex-col gap-4 animate-pulse">
                  <div>
                    <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-rose-500 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className="flex-1 flex flex-col gap-5">
                  {/* Summary */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Key Points */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Key Points</p>
                    <ul className="flex flex-col gap-2.5">
                      {result.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
