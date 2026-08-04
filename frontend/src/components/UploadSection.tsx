import React from 'react';

export const UploadSection: React.FC = () => {
  return (
    <div className="bg-[#151b2d] border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-6 flex flex-col items-center justify-center transition-colors">
      <div className="text-4xl mb-3 text-blue-400">📁</div>
      <h3 className="font-semibold text-lg text-slate-200">Upload Documents</h3>
      <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
        Drag & drop files here, or click to select files. Supports PDF, TXT, and Markdown.
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white rounded-lg font-medium text-sm transition-all shadow-md">
        Select Files
      </button>
      {/* TODO: Implement file uploads & state management here */}
    </div>
  );
};
