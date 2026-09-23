import React, { useState } from 'react';
import { CONVERSATION_TRANSCRIPT_RAW, AAVE_V3_ARBITRUM_POOL_ADDRESS } from '../data/mockData';
import { 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Cpu, 
  Radio, 
  Zap, 
  ShieldAlert, 
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'md' | 'txt' | 'json'>('md');

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(CONVERSATION_TRANSCRIPT_RAW);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleDownloadTranscript = (format: 'md' | 'txt' | 'json') => {
    let content = CONVERSATION_TRANSCRIPT_RAW;
    let mimeType = 'text/markdown';
    let filename = `JEV_Flash_Arbitrage_Transcript.${format}`;

    if (format === 'txt') {
      mimeType = 'text/plain';
      content = CONVERSATION_TRANSCRIPT_RAW.replace(/#/g, '').replace(/`/g, '');
    } else if (format === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify({
        title: 'Building an Agent Harness with JEV for Aave Flash Loan Arbitrage on Arbitrum',
        architecture: {
          pillar1_senses: 'Alchemy WebSockets (Arbitrum One)',
          pillar2_brain: 'TypeSafe AI JEV System-One Client (<200ms)',
          pillar3_muscle: 'Python Execution Harness + Web3.py'
        },
        protocol_invariants: {
          network: 'Arbitrum One',
          aave_v3_pool: AAVE_V3_ARBITRUM_POOL_ADDRESS,
          fixed_fee_pct: 0.05,
          block_time_sec: 0.25
        },
        raw_notes: CONVERSATION_TRANSCRIPT_RAW
      }, null, 2);
    }

    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Download Transcript Banner (Directly fulfilling user request in pasted conversation) */}
      <div className="p-4 bg-cyan-950/30 border border-cyan-800/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Downloadable Conversation Transcript & Architecture Guide</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Export the complete technical discussion, mathematical formulas, and architectural blueprints as requested in the session notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
          >
            {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTranscript ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={() => handleDownloadTranscript('md')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={() => handleDownloadTranscript('txt')}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
          >
            .TXT
          </button>

          <button
            onClick={() => handleDownloadTranscript('json')}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
          >
            .JSON
          </button>
        </div>
      </div>

      {/* The 3 Pillars Blueprint Diagram */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          The 3 Pillars of Your Bot's High-Frequency Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Pillar 1: Senses */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>1. Alchemy WebSockets</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">The Senses</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains persistent, open network connection with high-speed Arbitrum nodes. Intercepts DEX Swap event logs (Uniswap V3, SushiSwap, Camelot) the millisecond they happen.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-900">
              Latency: &lt; 50ms push notification
            </div>
          </div>

          {/* Pillar 2: Brain */}
          <div className="p-4 bg-slate-950 rounded-lg border border-cyan-800/80 shadow-[0_0_15px_rgba(6,182,212,0.1)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>2. TypeSafe AI Jev</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">The Brain</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consumes raw block string and Nansen/Arkham alerts. Evaluates typed probabilistic classifications (noul, choice, score) in sub-200ms without text generation.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-900">
              Speed: 120ms–180ms · Cost: $0.042/1M tokens
            </div>
          </div>

          {/* Pillar 3: Muscle */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>3. Python Execution Harness</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400 uppercase">The Muscle</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applies deterministic guard rules. If JEV grants clearance, it immediately signs raw Web3 transaction and calls Aave V3 contract on Arbitrum FCFS Sequencer.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-900">
              Execution: 0.25s Arbitrum block finality
            </div>
          </div>
        </div>
      </div>

      {/* Integration with Arkham Intelligence and Nansen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arkham Box */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Arkham Intelligence: Entity Tracking & Toxic Flow
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Entity Alerts</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Arkham tags labeled smart wallets (e.g. Wintermute, Jump Crypto, Cumberland, DWF Labs) and contract deployers. When an entity withdraws liquidity or dumps inventory, JEV flags <code className="text-cyan-300 font-mono">is_toxic_flow</code> (&gt;15%) to prevent entering a rug-pull or directional trap.
          </p>
        </div>

        {/* Nansen Box */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Nansen: Smart Money & Mempool Congestion
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Macro Inflows</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nansen monitors 24h smart money token net flows, sudden DEX pool depth contractions, and mempool bot cluster density. Feeding this state into JEV allows sub-second detection of sandwich bots competing for the identical pool hash.
          </p>
        </div>
      </div>

      {/* Structured Transcript Viewer */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
          <span className="text-xs font-mono font-semibold text-slate-300">
            Transcript Viewer: Research Session & Technical Architecture
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Markdown Preview</span>
        </div>

        <div className="p-5 font-sans text-xs text-slate-300 space-y-4 max-h-[500px] overflow-y-auto leading-relaxed">
          <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
            <div className="text-white font-semibold text-sm">Key Takeaway: System-One vs Autoregressive LLMs</div>
            <p className="text-slate-400">
              Autoregressive LLMs generate text token by token, taking 2 to 4 seconds and costing dollars. TypeSafe AI's Jev is a System-One model that operates in &lt;200ms and costs $0.042/1M input tokens with zero output token fees. It allows micro-decision gating inside high-frequency trading loops.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
            <div className="text-white font-semibold text-sm">Why Flash Loans Need Jev Firewalls</div>
            <p className="text-slate-400">
              Flash loans borrow millions uncollateralized. If the trade fails, the transaction reverts and the user loses the network gas fee. On Arbitrum, thousands of attempts without a pre-flight firewall waste significant capital. JEV drops the revert rate from 35% down to under 2%, preserving profit margins.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
            <div className="text-white font-semibold text-sm">Why Arbitrum One is the Optimal EVM Target</div>
            <p className="text-slate-400">
              Arbitrum One features 0.25-second block times and a First-Come, First-Served (FCFS) sequencer. Unlike Ethereum Mainnet, there is no public mempool bidding war or sandwich front-running. A fast off-chain scanner with JEV gating can execute inside the very next 250ms block window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
