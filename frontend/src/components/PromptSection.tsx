import React, { useState } from 'react';

interface PromptSectionProps {
  onAnalyze: (instruction: string) => void;
  isAnalyzing: boolean;
  hasDocuments: boolean;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  onAnalyze,
  isAnalyzing,
  hasDocuments,
}) => {
  const [instruction, setInstruction] = useState('');

  const presets = [
    'Compare all uploaded documents.',
    'Find inconsistencies.',
    'Extract important dates.',
    'Summarize the uploaded documents.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && hasDocuments && !isAnalyzing) {
      onAnalyze(instruction.trim());
    }
  };

  const handlePresetClick = (preset: string) => {
    setInstruction(preset);
  };

  const isButtonDisabled = !hasDocuments || !instruction.trim() || isAnalyzing;

  return (
    <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl">
      <h3 className="font-semibold text-lg text-slate-200 mb-3">Analysis Options</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Instruction / Prompt
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isAnalyzing}
            className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm min-h-[110px] resize-none transition-colors"
            placeholder="e.g. Compare pricing clauses, extract key dates, find inconsistencies..."
          />
        </div>

        {/* Quick select presets */}
        <div>
          <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">
            Quick Prompts
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset)}
                disabled={isAnalyzing}
                className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-855 text-slate-350 border border-slate-800 rounded-full text-[11px] font-medium transition-all truncate max-w-full"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Trigger Button */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 ${
            isButtonDisabled
              ? 'bg-indigo-950/40 text-slate-500 border border-indigo-950/20 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:bg-indigo-700'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing Workbench...</span>
            </>
          ) : (
            <span>Run AI Analysis</span>
          )}
        </button>
      </form>

      {/* Validation Warning Indicator */}
      {!hasDocuments && (
        <p className="mt-3 text-[11px] text-amber-500/80 flex items-center space-x-1">
          <span>⚠️</span>
          <span>Please upload at least one document to run the analysis.</span>
        </p>
      )}
    </div>
  );
};
