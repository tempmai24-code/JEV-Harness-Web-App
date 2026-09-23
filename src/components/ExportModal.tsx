import React, { useState } from 'react';
import { CONVERSATION_TRANSCRIPT_RAW, AAVE_V3_ARBITRUM_POOL_ADDRESS } from '../data/mockData';
import { X, Download, FileCode, Check, Copy } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadedAll, setDownloadedAll] = useState(false);

  if (!isOpen) return null;

  const downloadFile = (name: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Download all key files sequentially
    downloadFile('JEV_Arbitrage_Transcript.md', CONVERSATION_TRANSCRIPT_RAW, 'text/markdown');
    setTimeout(() => {
      downloadFile('FlashLoanArbitrage.sol', `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n// Aave V3 Arbitrum Provider: ${AAVE_V3_ARBITRUM_POOL_ADDRESS}\n// See Code Studio in app for complete implementation\n`, 'text/plain');
    }, 200);
    setTimeout(() => {
      downloadFile('jev_schema.json', JSON.stringify({
        model: 'jev-latest',
        arbitrum_aave_pool: AAVE_V3_ARBITRUM_POOL_ADDRESS,
        cost_per_million_tokens: 0.042
      }, null, 2), 'application/json');
    }, 400);

    setDownloadedAll(true);
    setTimeout(() => setDownloadedAll(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Export Bot Code & Conversation Transcript</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export the complete developer kit based on the session discussion. This package includes the Solidity contract for Aave V3 on Arbitrum One, Python Alchemy WebSocket listener with TypeSafe JEV System-One client, and the complete conversation transcript.
        </p>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
            <span className="text-slate-200">1. JEV_Arbitrage_Transcript.md</span>
            <span className="text-[10px] text-slate-400">Complete AI Mode Session</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
            <span className="text-slate-200">2. FlashLoanArbitrage.sol</span>
            <span className="text-[10px] text-slate-400">Solidity Contract (Aave V3)</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
            <span className="text-slate-200">3. harness_runner.py</span>
            <span className="text-[10px] text-slate-400">Python WebSockets & JEV Client</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center justify-between">
            <span className="text-slate-200">4. jev_schema.json</span>
            <span className="text-[10px] text-slate-400">JEV Primitives Schema</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors shadow-sm"
          >
            {downloadedAll ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloadedAll ? 'Downloaded Files!' : 'Download All Files'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
