import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col text-slate-100">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-[#0e1322] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Multi-Document Intelligence Workbench</h1>
            <p className="text-xs text-slate-400">Technical Assessment scaffold</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/RahulJaggi/multi-document-intelligence-workbench"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-[#0b0f19] py-4 text-center text-xs text-slate-550">
        <p>&copy; {new Date().getFullYear()} Multi-Document Intelligence Workbench.</p>
      </footer>
    </div>
  );
};
export default Layout;
