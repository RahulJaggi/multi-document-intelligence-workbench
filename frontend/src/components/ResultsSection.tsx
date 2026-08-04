import React, { useState } from 'react';

export interface AnalysisResult {
  summary: string;
  findings: string[];
  comparison: string[];
  missingInformation: string[];
  sources: string[];
}

interface ResultsSectionProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

const compileCopyText = (res: AnalysisResult): string => {
  let text = `AI ANALYSIS RESULTS\n\n`;
  text += `SUMMARY:\n${res.summary}\n\n`;

  if (res.findings && res.findings.length > 0) {
    text += `FINDINGS:\n`;
    res.findings.forEach((f) => {
      text += `- ${f}\n`;
    });
    text += `\n`;
  }

  if (res.comparison && res.comparison.length > 0) {
    text += `COMPARISON POINTS:\n`;
    res.comparison.forEach((c) => {
      text += `- ${c}\n`;
    });
    text += `\n`;
  }

  if (res.missingInformation && res.missingInformation.length > 0) {
    text += `MISSING INFORMATION / GAPS:\n`;
    res.missingInformation.forEach((m) => {
      text += `- ${m}\n`;
    });
    text += `\n`;
  }

  if (res.sources && res.sources.length > 0) {
    text += `SOURCES:\n`;
    res.sources.forEach((s) => {
      text += `- ${s}\n`;
    });
    text += `\n`;
  }

  return text.trim();
};

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  result,
  isAnalyzing,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      const copyText = compileCopyText(result);
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Check if comparison strings contain vertical bar delimiters (Table Mode)
  const isTableMode =
    result?.comparison &&
    result.comparison.length > 0 &&
    result.comparison.some((item) => item.includes('|'));

  const parseComparisonItem = (item: string) => {
    const parts = item.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      return {
        field: parts[0] || '-',
        docA: parts[1] || '-',
        docB: parts[2] || '-',
        status: parts[3] || 'Details',
      };
    }
    return null;
  };

  // Rendering Loading Skeleton Loader
  if (isAnalyzing) {
    return (
      <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="h-5 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse" />
          <div className="pt-6 space-y-3">
            <div className="h-10 bg-slate-850 rounded w-full animate-pulse" />
            <div className="h-10 bg-slate-850 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Rendering Error State
  if (error) {
    return (
      <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col justify-center items-center text-center">
        <div className="text-4xl mb-3 text-red-500">❌</div>
        <h3 className="font-semibold text-lg text-slate-200">Analysis Error</h3>
        <p className="text-sm text-red-400 max-w-md mt-2 bg-red-950/20 border border-red-900/40 p-4 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  // Rendering Empty State
  if (!result) {
    return (
      <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400">
        <div className="text-4xl mb-2 text-slate-700">📊</div>
        <p className="text-sm font-medium">No analysis available.</p>
        <p className="text-xs text-slate-500 mt-1">
          Perform a query on uploaded documents to render AI findings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col space-y-6">
      {/* Header and Copy Control */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h3 className="font-semibold text-lg text-slate-200">Analysis Insights</h3>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow ${
            copied
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-850 hover:bg-slate-800 text-slate-300 active:bg-slate-900'
          }`}
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>{copied ? 'Copied!' : 'Copy Result'}</span>
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[600px] pr-1">
        {/* Summary Card */}
        <section className="bg-slate-900/50 border border-slate-850 p-5 rounded-xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Summary Overview
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {result.summary}
          </p>
        </section>

        {/* Findings Section */}
        {result.findings && result.findings.length > 0 && (
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Findings
            </h4>
            <ul className="space-y-2.5">
              {result.findings.map((finding, idx) => (
                <li
                  key={idx}
                  className="bg-[#0b0f19]/70 border border-slate-800/80 p-3.5 rounded-lg flex items-start space-x-3 hover:border-slate-700/60 transition-colors"
                >
                  <span className="text-indigo-400 font-semibold shrink-0 text-sm mt-0.5">
                    ●
                  </span>
                  <p className="text-sm text-slate-200 font-medium leading-normal">
                    {finding}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Comparison Section */}
        {result.comparison && result.comparison.length > 0 && (
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Document Comparison
            </h4>

            {isTableMode ? (
              <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-900/30">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900/85 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-3">Field / Aspect</th>
                      <th className="p-3">Document A</th>
                      <th className="p-3">Document B</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.map((item, idx) => {
                      const rowData = parseComparisonItem(item);
                      if (rowData) {
                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors"
                          >
                            <td className="p-3 font-semibold text-slate-200">
                              {rowData.field}
                            </td>
                            <td className="p-3 text-slate-350">{rowData.docA}</td>
                            <td className="p-3 text-slate-350">{rowData.docB}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase ${
                                  rowData.status.toLowerCase().includes('match') &&
                                  !rowData.status.toLowerCase().includes('mismatch')
                                    ? 'bg-emerald-950/50 text-emerald-450 border border-emerald-900/40'
                                    : rowData.status.toLowerCase().includes('mismatch')
                                    ? 'bg-rose-955/50 text-rose-450 border border-rose-900/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700/40'
                                }`}
                              >
                                {rowData.status}
                              </span>
                            </td>
                          </tr>
                        );
                      } else {
                        // Render full span row for non-delimited strings
                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors"
                          >
                            <td colSpan={4} className="p-3 text-slate-300 leading-normal">
                              {item}
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="space-y-2 bg-[#0b0f19]/30 border border-slate-850 p-4 rounded-lg">
                {result.comparison.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-300 leading-relaxed flex items-start space-x-2">
                    <span className="text-slate-500 mt-1 shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Gaps / Missing Information */}
        {result.missingInformation && result.missingInformation.length > 0 && (
          <section className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Missing Information / Gaps
            </h4>
            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-lg space-y-2">
              {result.missingInformation.map((info, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-450 mt-0.5 text-xs shrink-0">⚠️</span>
                  <p className="text-xs text-amber-300 font-medium leading-normal">{info}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sources Section */}
        {result.sources && result.sources.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sources & Referenced Documents
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center space-x-2"
                >
                  <span className="text-lg">📁</span>
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
