import React from 'react';
import { Play, Download } from 'lucide-react';

export type ActiveTab = 'pipeline' | 'jev' | 'math' | 'code' | 'architecture';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickSimulate: () => void;
  onDownloadBundle: () => void;
  isStreaming: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onQuickSimulate,
  onDownloadBundle,
  isStreaming
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('pipeline'); }}
          className="text-base font-semibold tracking-tight text-white hover:text-cyan-300 transition-colors flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
          JEV Flash Arbitrage
        </a>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">Arbitrum One · Aave V3</span>
      </div>

      {/* Zone 2: 5 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`transition-colors pb-0.5 ${
            activeTab === 'pipeline'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Live Pipeline
        </button>
        <button
          onClick={() => setActiveTab('jev')}
          className={`transition-colors pb-0.5 ${
            activeTab === 'jev'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          JEV System-One
        </button>
        <button
          onClick={() => setActiveTab('math')}
          className={`transition-colors pb-0.5 ${
            activeTab === 'math'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Profit & Gas Math
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`transition-colors pb-0.5 ${
            activeTab === 'code'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Harness & Smart Contract
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`transition-colors pb-0.5 ${
            activeTab === 'architecture'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          Architecture & Transcripts
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onQuickSimulate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          title="Run quick pre-flight gate check"
        >
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          <span>Test Gate</span>
        </button>
        <button
          onClick={onDownloadBundle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm"
          title="Download complete bot code and conversation transcript"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>Export Bundle</span>
        </button>
      </div>
    </header>
  );
};
