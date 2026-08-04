import React, { useState } from 'react';
import { UploadSection, UploadedDocument } from '../components/UploadSection.js';
import { PromptSection } from '../components/PromptSection.js';
import { ResultsSection } from '../components/ResultsSection.js';

export const Home: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const handleUploadSuccess = (newDocs: UploadedDocument[]) => {
    setUploadedDocs((prev) => [...prev, ...newDocs]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Workspace Dashboard</h2>
          <p className="text-sm text-slate-400">Perform multi-document synthesis and query analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <UploadSection onUploadSuccess={handleUploadSuccess} />
          
          {/* Uploaded Documents React State Display */}
          {uploadedDocs.length > 0 && (
            <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Active Knowledge Base ({uploadedDocs.length})
              </h4>
              <ul className="space-y-2">
                {uploadedDocs.map((doc) => {
                  const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
                  return (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-lg shrink-0">{isPdf ? '📕' : '📄'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate select-all">
                            ID: {doc.id}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <PromptSection />
        </div>
        <div className="lg:col-span-2">
          <ResultsSection />
        </div>
      </div>
    </div>
  );
};
export default Home;
