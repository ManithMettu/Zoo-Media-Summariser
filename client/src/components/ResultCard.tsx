interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
}

interface ResultCardProps {
  result: SummarizeResult | null;
  loading: boolean;
  error: string;
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

export default function ResultCard({ result, loading, error }: ResultCardProps) {
  const sentiment = result ? sentimentConfig[result.sentiment] : null;

  return (
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
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
            </div>

            <div className="border-t border-gray-100" />

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
  );
}
