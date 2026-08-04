import React from 'react';

export const ResultsSection: React.FC = () => {
  return (
    <div className="bg-[#151b2d] border border-slate-850 rounded-xl p-6 shadow-xl h-full min-h-[300px] flex flex-col">
      <h3 className="font-semibold text-lg text-slate-200 mb-3">Analysis Insights</h3>
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <div className="text-4xl mb-2 text-slate-650">📊</div>
        <p className="text-sm">No analysis performed yet.</p>
        <p className="text-xs text-slate-500 mt-1">Upload files and enter a prompt to generate insights.</p>
      </div>
      {/* TODO: Implement streaming Markdown display and source citations here */}
    </div>
  );
};
