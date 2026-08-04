import React from 'react';
import { UploadSection } from '../components/UploadSection.js';
import { PromptSection } from '../components/PromptSection.js';
import { ResultsSection } from '../components/ResultsSection.js';

export const Home: React.FC = () => {
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
          <UploadSection />
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
