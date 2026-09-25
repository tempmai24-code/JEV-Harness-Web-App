import React, { useState } from 'react';
import { Play, Download, Menu, X, Activity, Cpu, Calculator, Code2, BookOpen, Wallet, Zap } from 'lucide-react';
import { WalletState } from '../services/walletService';

export type ActiveTab = 'pipeline' | 'jev' | 'math' | 'code' | 'architecture';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickSimulate: () => void;
  onDownloadBundle: () => void;
  onOpenApiModal: () => void;
  walletState: WalletState;
  isStreaming: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onQuickSimulate,
  onDownloadBundle,
  onOpenApiModal,
  walletState,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'pipeline',
      label: 'Live Pipeline',
      shortLabel: 'Pipeline',
      icon: <Activity className="w-4 h-4" />,
      desc: 'Real-time pool dislocation stream & mempool status'
    },
    {
      id: 'jev',
      label: 'JEV System-One',
      shortLabel: 'JEV Gate',
      icon: <Cpu className="w-4 h-4" />,
      desc: 'Probabilistic pre-flight gatekeeper & Arkham/Nansen evaluation'
    },
    {
      id: 'math',
      label: 'Profit & Gas Math',
      shortLabel: 'Profit Math',
      icon: <Calculator className="w-4 h-4" />,
      desc: 'Aave 0.05% fee, DEX tiers & slippage calculator'
    },
    {
      id: 'code',
      label: 'Harness & Smart Contract',
      shortLabel: 'Contract & Python',
      icon: <Code2 className="w-4 h-4" />,
      desc: 'Solidity FlashLoanSimpleReceiverBase & Python engine'
    },
    {
      id: 'architecture',
      label: 'Architecture & Transcripts',
      shortLabel: 'Docs & Logs',
      icon: <BookOpen className="w-4 h-4" />,
      desc: 'System-One vs System-Two blueprints & chat export'
    }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleSelectTab('pipeline'); }}
            className="text-sm sm:text-base font-semibold tracking-tight text-white hover:text-cyan-300 transition-colors flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></span>
            <span>JEV Flash Arbitrage</span>
          </a>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline border-l border-slate-800 pl-3">
            Arbitrum One · Aave V3
          </span>
        </div>

        {/* Zone 2: 5 clean text navigation links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`transition-colors py-1 ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Wallet/API Binding + Actions + Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Wallet & API Binding Hub Button */}
          <button
            onClick={onOpenApiModal}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all whitespace-nowrap ${
              walletState.isConnected
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800'
            }`}
            title="Bind JEV, Arkham, Nansen APIs & connect Arbitrum wallet"
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            {walletState.isConnected ? (
              <span className="font-mono text-emerald-300 font-semibold text-[11px]">
                {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-3)}
              </span>
            ) : (
              <>
                <span className="hidden sm:inline font-sans text-xs">Bind APIs & Wallet</span>
                <span className="sm:hidden text-xs">APIs</span>
              </>
            )}
            <span className={`w-2 h-2 rounded-full ${walletState.isConnected ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`}></span>
          </button>

          <button
            onClick={onQuickSimulate}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            title="Run quick pre-flight gate check"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Gate</span>
          </button>

          <button
            onClick={onDownloadBundle}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm"
            title="Download complete bot code and conversation transcript"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">Export Bundle</span>
            <span className="sm:hidden text-xs">Export</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Horizontal Tab Bar for Mobile & Tablet screens */}
      <div className="lg:hidden flex items-center overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/80 gap-1.5 text-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs transition-all ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
        <button
          onClick={onOpenApiModal}
          className="flex items-center gap-1 px-3 py-1 rounded-full whitespace-nowrap text-xs bg-slate-900 text-cyan-300 border border-cyan-800/60 font-medium"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>APIs & Wallet</span>
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-3 shadow-2xl space-y-2">
          {/* Quick Bind Action in drawer */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenApiModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-700/80 text-cyan-200 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>API & Wallet Binding Hub</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              {walletState.isConnected ? 'Connected' : 'Bind Now →'}
            </span>
          </button>

          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 pt-1">
            Application Sections
          </div>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-cyan-950/50 border border-cyan-800 text-cyan-200'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-md ${isActive ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    {tab.label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5 leading-snug">
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
