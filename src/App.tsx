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
import { ApiWalletBindingModal } from './components/ApiWalletBindingModal';
import { ArbitrageOpportunity } from './types/arbitrage';
import { AAVE_V3_ARBITRUM_POOL_ADDRESS } from './data/mockData';
import { WalletState } from './services/walletService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [selectedOppForJev, setSelectedOppForJev] = useState<ArbitrageOpportunity | null>(null);

  // Global Web3 Wallet Connection State
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: true,
    address: '0x71C95911e9a5d330f4d621842EC243EE1343292e',
    chainId: 42161,
    networkName: 'Arbitrum One',
    balanceEth: '2.4820',
    isArbitrum: true,
    providerType: 'simulated',
    error: null
  });

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
        onOpenApiModal={() => setIsApiModalOpen(true)}
        walletState={walletState}
        isStreaming={true}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && (
          <LivePipeline
            onSelectForJev={handleSelectForJev}
            onOpenCode={() => setActiveTab('code')}
            onOpenApiModal={() => setIsApiModalOpen(true)}
            walletState={walletState}
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
              onClick={() => setIsApiModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-sans font-medium"
            >
              API & Wallet Binding Hub
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors font-sans font-medium"
            >
              Export Bundle
            </button>
          </div>
        </div>
      </footer>

      {/* Export Bundle Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* API & Wallet Binding Hub Modal */}
      <ApiWalletBindingModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        walletState={walletState}
        setWalletState={setWalletState}
      />
    </div>
  );
}
