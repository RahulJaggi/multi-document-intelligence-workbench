import React from 'react';

export const PromptSection: React.FC = () => {
  return (
    <div className="bg-[#151b2d] border border-slate-850 rounded-xl p-6 shadow-xl">
      <h3 className="font-semibold text-lg text-slate-200 mb-3">Analysis Options</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Instruction / Prompt
          </label>
          <textarea
            className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm min-h-[100px] resize-none"
            placeholder="Describe what you want the AI to analyze in these documents (e.g. Compare pricing clauses, extract key takeaways...)"
          />
        </div>
        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-all shadow-md">
          Run Analysis
        </button>
      </div>
      {/* TODO: Implement query submission and processing state here */}
    </div>
  );
};
