import React, { useState } from 'react';
import { UploadSection, UploadedDocument } from '../components/UploadSection.js';
import { PromptSection } from '../components/PromptSection.js';
import { ResultsSection, AnalysisResult } from '../components/ResultsSection.js';
import api from '../services/api.js';

export const Home: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleUploadSuccess = (newDocs: UploadedDocument[]) => {
    setUploadedDocs((prev) => [...prev, ...newDocs]);
  };

  const handleAnalyze = async (instruction: string) => {
    if (uploadedDocs.length === 0 || !instruction.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    // Format payload to expected document parser format: fileName, fileType, extractedText
    const documentsPayload = uploadedDocs.map((doc) => ({
      fileName: doc.fileName,
      fileType: doc.fileType,
      extractedText: doc.extractedText,
    }));

    try {
      const response = await api.post('/analyze', {
        documents: documentsPayload,
        instruction,
      });

      // Response contains summary, findings, comparison, missingInformation, sources directly
      setAnalysisResult(response.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Analysis failed. Please try again.';
      setAnalysisError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
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
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Knowledge Base ({uploadedDocs.length})
                </h4>
                <button
                  onClick={() => {
                    setUploadedDocs([]);
                    setAnalysisResult(null);
                    setAnalysisError(null);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase font-bold"
                >
                  Clear Base
                </button>
              </div>
              <ul className="space-y-2">
                {uploadedDocs.map((doc) => {
                  const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
                  const isCsv = doc.fileName.toLowerCase().endsWith('.csv');
                  const icon = isPdf ? '📕' : isCsv ? '📊' : '📄';

                  return (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-lg shrink-0">{icon}</span>
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

          <PromptSection
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            hasDocuments={uploadedDocs.length > 0}
          />
        </div>
        <div className="lg:col-span-2">
          <ResultsSection
            result={analysisResult}
            isAnalyzing={isAnalyzing}
            error={analysisError}
          />
        </div>
      </div>
    </div>
  );
};
export default Home;
