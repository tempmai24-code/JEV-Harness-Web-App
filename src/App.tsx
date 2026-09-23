/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar, ActiveTab } from './components/TopBar';
import { LivePipeline } from './components/LivePipeline';
import { JevPlayground } from './components/JevPlayground';
import { ProfitCalculator } from './components/ProfitCalculator';
import { CodeStudio } from './components/CodeStudio';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { ExportModal } from './components/ExportModal';
import { ArbitrageOpportunity } from './types/arbitrage';
import { AAVE_V3_ARBITRUM_POOL_ADDRESS } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [selectedOppForJev, setSelectedOppForJev] = useState<ArbitrageOpportunity | null>(null);

  const handleSelectForJev = (opp: ArbitrageOpportunity) => {
    setSelectedOppForJev(opp);
    setActiveTab('jev');
  };

  const handleQuickSimulate = () => {
    setActiveTab('jev');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSimulate={handleQuickSimulate}
        onDownloadBundle={() => setIsExportModalOpen(true)}
        isStreaming={true}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && (
          <LivePipeline
            onSelectForJev={handleSelectForJev}
            onOpenCode={() => setActiveTab('code')}
          />
        )}

        {activeTab === 'jev' && (
          <JevPlayground initialOpp={selectedOppForJev} />
        )}

        {activeTab === 'math' && (
          <ProfitCalculator />
        )}

        {activeTab === 'code' && (
          <CodeStudio />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocs />
        )}
      </main>

      {/* Subdued Protocol Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span>Arbitrum One Execution</span>
            <span aria-hidden="true">·</span>
            <span>Aave V3 Pool: <span className="text-slate-400 font-semibold">{AAVE_V3_ARBITRUM_POOL_ADDRESS}</span></span>
          </div>

          <div className="flex items-center gap-3">
            <span>TypeSafe AI JEV System-One ($0.042/1M tokens)</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-sans font-medium"
            >
              Export Transcript & Bundle
            </button>
          </div>
        </div>
      </footer>

      {/* Export Bundle Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
