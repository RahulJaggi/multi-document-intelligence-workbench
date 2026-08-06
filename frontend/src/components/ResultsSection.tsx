import React, { useState } from 'react';

// TypeScript interfaces for robust AI response handling
export interface FindingObject {
  finding?: string;
  text?: string;
  description?: string;
  source?: string | string[];
  [key: string]: any;
}

export interface ComparisonObject {
  field?: string;
  aspect?: string;
  comparison?: string;
  feature?: string;
  docA?: string;
  doc1?: string;
  documentA?: string;
  docB?: string;
  doc2?: string;
  documentB?: string;
  status?: string;
  result?: string;
  [key: string]: any;
}

export interface MissingInfoObject {
  info?: string;
  missing?: string;
  description?: string;
  gap?: string;
  [key: string]: any;
}

export interface SourceObject {
  name?: string;
  fileName?: string;
  file?: string;
  [key: string]: any;
}

export interface AnalysisResult {
  summary?: string;
  findings?: (string | FindingObject)[];
  comparison?: (string | ComparisonObject)[];
  missingInformation?: (string | MissingInfoObject)[];
  sources?: (string | SourceObject)[];
}

interface ResultsSectionProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

// Resilient clipboard formatter
const compileCopyText = (res: AnalysisResult): string => {
  let text = `AI ANALYSIS RESULTS\n\n`;
  text += `SUMMARY:\n${res?.summary || 'No summary available.'}\n\n`;

  if (res?.findings && res.findings.length > 0) {
    text += `FINDINGS:\n`;
    res.findings.forEach((f) => {
      if (typeof f === 'string') {
        text += `- ${f}\n`;
      } else if (f) {
        const findingText = f.finding || f.text || f.description || JSON.stringify(f);
        text += `- ${findingText}`;
        if (f.source) {
          const srcStr = Array.isArray(f.source) ? f.source.join(', ') : String(f.source);
          text += ` (Source: ${srcStr})`;
        }
        text += `\n`;
      }
    });
    text += `\n`;
  }

  if (res?.comparison && res.comparison.length > 0) {
    text += `COMPARISON POINTS:\n`;
    res.comparison.forEach((c) => {
      if (typeof c === 'string') {
        text += `- ${c}\n`;
      } else if (c) {
        const field = c.field || c.aspect || c.comparison || c.feature || '-';
        const docA = c.docA || c.doc1 || c.documentA || '-';
        const docB = c.docB || c.doc2 || c.documentB || '-';
        const status = c.status || c.result || '-';
        text += `- ${field} | Doc A: ${docA} | Doc B: ${docB} | Status: ${status}\n`;
      }
    });
    text += `\n`;
  }

  if (res?.missingInformation && res.missingInformation.length > 0) {
    text += `MISSING INFORMATION / GAPS:\n`;
    res.missingInformation.forEach((m) => {
      if (typeof m === 'string') {
        text += `- ${m}\n`;
      } else if (m) {
        const infoText = m.info || m.missing || m.description || m.gap || JSON.stringify(m);
        text += `- ${infoText}\n`;
      }
    });
    text += `\n`;
  }

  if (res?.sources && res.sources.length > 0) {
    text += `SOURCES:\n`;
    res.sources.forEach((s) => {
      if (typeof s === 'string') {
        text += `- ${s}\n`;
      } else if (s) {
        const sourceName = s.name || s.fileName || s.file || JSON.stringify(s);
        text += `- ${sourceName}\n`;
      }
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

  // Determine if vertical table layout is applicable
  const isTableMode =
    result?.comparison &&
    result.comparison.length > 0 &&
    result.comparison.some((item) => {
      if (typeof item === 'object') return true;
      return typeof item === 'string' && item.includes('|');
    });

  // Safe parser for single comparison points
  const parseComparisonItem = (item: string | ComparisonObject) => {
    if (!item) return null;
    if (typeof item === 'object') {
      return {
        field: item.field || item.aspect || item.comparison || item.feature || '-',
        docA: item.docA || item.doc1 || item.documentA || '-',
        docB: item.docB || item.doc2 || item.documentB || '-',
        status: item.status || item.result || 'Details',
      };
    }
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

  // Resilient finding rendering helper (displays findings as Cards)
  const renderFinding = (item: string | FindingObject, idx: number) => {
    if (!item) return null;

    if (typeof item === 'string') {
      return (
        <li
          key={idx}
          className="bg-[#0b0f19]/70 border border-slate-800/80 p-4 rounded-lg flex items-start space-x-3 hover:border-slate-700/60 transition-colors shadow-md min-w-0 overflow-hidden"
        >
          <span className="text-indigo-400 font-semibold shrink-0 text-sm mt-0.5">
            ●
          </span>
          <p className="text-sm text-slate-200 font-medium leading-normal break-words whitespace-pre-wrap min-w-0">
            {item}
          </p>
        </li>
      );
    }

    // Object type finding
    const findingText = item.finding || item.text || item.description || JSON.stringify(item);
    const sourceVal = item.source;

    return (
      <li
        key={idx}
        className="bg-[#0b0f19]/70 border border-slate-800/80 p-4 rounded-lg hover:border-slate-750 transition-all shadow-md space-y-3 flex flex-col justify-between min-w-0 overflow-hidden"
      >
        <div className="flex items-start space-x-3 min-w-0">
          <span className="text-indigo-400 font-semibold shrink-0 text-sm mt-0.5">
            ●
          </span>
          <h3 className="text-sm font-semibold text-slate-200 leading-normal break-words whitespace-pre-wrap min-w-0">
            {findingText}
          </h3>
        </div>
        
        {sourceVal && (
          <div className="text-xs text-slate-400 border-t border-slate-800/60 pt-2 ml-6 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-450 block mb-1 text-[10px] uppercase tracking-wider">
              Source:
            </span>
            {Array.isArray(sourceVal) ? (
              <ul className="list-disc pl-4 space-y-0.5 text-slate-350 min-w-0">
                {sourceVal.map((src, sIdx) => (
                  <li key={sIdx} className="break-all">• {String(src)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-350 break-all">★ {String(sourceVal)}</p>
            )}
          </div>
        )}
      </li>
    );
  };

  // Resilient missing info rendering helper
  const renderMissingInfo = (item: string | MissingInfoObject, idx: number) => {
    if (!item) return null;
    const infoText =
      typeof item === 'string'
        ? item
        : item.info || item.missing || item.description || item.gap || JSON.stringify(item);

    return (
      <div key={idx} className="flex items-start space-x-2">
        <span className="text-amber-450 mt-0.5 text-xs shrink-0">⚠️</span>
        <p className="text-xs text-amber-300 font-medium leading-normal">{infoText}</p>
      </div>
    );
  };

  // Resilient sources rendering helper
  const renderSource = (item: string | SourceObject, idx: number) => {
    if (!item) return null;
    const sourceName =
      typeof item === 'string'
        ? item
        : item.name || item.fileName || item.file || JSON.stringify(item);

    return (
      <div
        key={idx}
        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center space-x-2 shadow-sm"
      >
        <span className="text-lg">📁</span>
        <span>{sourceName}</span>
      </div>
    );
  };

  // Loading indicator
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
            <div className="h-10 bg-slate-855 rounded w-full animate-pulse" />
            <div className="h-10 bg-slate-855 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error Banner
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

  // Empty Board
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
      {/* Header Controls */}
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
        {/* Resilient Summary Overview */}
        <section className="bg-slate-900/50 border border-slate-850 p-5 rounded-xl space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Summary Overview
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {result?.summary || 'No summary overview available.'}
          </p>
        </section>

        {/* Resilient Findings card-list */}
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Findings
          </h4>
          {result?.findings && result.findings.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.findings.map((finding, idx) => renderFinding(finding, idx))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic bg-[#0b0f19]/30 p-3 rounded-lg border border-slate-850">
              No findings data available.
            </p>
          )}
        </section>

        {/* Resilient Comparison Section */}
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Document Comparison
          </h4>
          {result?.comparison && result.comparison.length > 0 ? (
            isTableMode ? (
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
                        const rawText = typeof item === 'string' ? item : JSON.stringify(item);
                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors"
                          >
                            <td colSpan={4} className="p-3 text-slate-300 leading-normal">
                              {rawText}
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
                {result.comparison.map((item, idx) => {
                  const val = typeof item === 'string' ? item : JSON.stringify(item);
                  return (
                    <li
                      key={idx}
                      className="text-sm text-slate-300 leading-relaxed flex items-start space-x-2"
                    >
                      <span className="text-slate-500 mt-1 shrink-0">-</span>
                      <span>{val}</span>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <p className="text-xs text-slate-500 italic bg-[#0b0f19]/30 p-3 rounded-lg border border-slate-850">
              No comparison data available.
            </p>
          )}
        </section>

        {/* Resilient Missing Information */}
        <section className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Missing Information / Gaps
          </h4>
          {result?.missingInformation && result.missingInformation.length > 0 ? (
            <div className="bg-amber-955/20 border border-amber-900/30 p-4 rounded-lg space-y-2">
              {result.missingInformation.map((info, idx) => renderMissingInfo(info, idx))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-[#0b0f19]/30 p-3 rounded-lg border border-slate-850">
              No missing information or gaps reported.
            </p>
          )}
        </section>

        {/* Resilient Sources Section */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sources & Referenced Documents
          </h4>
          {result?.sources && result.sources.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, idx) => renderSource(source, idx))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-[#0b0f19]/30 p-3 rounded-lg border border-slate-850">
              No sources listed.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
export default ResultsSection;
