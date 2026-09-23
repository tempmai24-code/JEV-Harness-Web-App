import React, { useState, useEffect, useRef } from 'react';
import { ArbitrageOpportunity } from '../types/arbitrage';
import { SCENARIO_PRESETS, AAVE_V3_ARBITRUM_POOL_ADDRESS } from '../data/mockData';
import { JevEngineService } from '../services/jevEngine';
import { STANDARD_JEV_QUESTIONS } from '../data/mockData';
import { 
  Play, 
  Pause, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ChevronRight, 
  ArrowUpRight,
  ExternalLink,
  Code
} from 'lucide-react';

interface LivePipelineProps {
  onSelectForJev: (opp: ArbitrageOpportunity) => void;
  onOpenCode: () => void;
}

export const LivePipeline: React.FC<LivePipelineProps> = ({ onSelectForJev, onOpenCode }) => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [blockNumber, setBlockNumber] = useState(214839210);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<ArbitrageOpportunity | null>(null);
  const [totalProfit, setTotalProfit] = useState(14850);
  const [gasSaved, setGasSaved] = useState(3840);
  const [activeFlashLoanSize, setActiveFlashLoanSize] = useState<number>(500000);
  const [selectedLatencyStep, setSelectedLatencyStep] = useState<number>(2); // 0..4

  // Initialize initial history
  useEffect(() => {
    const initialList: ArbitrageOpportunity[] = [
      {
        id: 'opp-1',
        timestamp: '15:02:18.120',
        blockNumber: 214839201,
        tokenPair: 'WETH / USDC',
        tokenSymbol: 'WETH',
        borrowAsset: 'USDC',
        flashLoanAmountUsd: 500000,
        buyExchange: 'Uniswap V3',
        buyPrice: 3241.10,
        sellExchange: 'Camelot DEX',
        sellPrice: 3256.70,
        spreadPct: 0.48,
        grossProfitUsd: 2400,
        aaveFeeUsd: 250,
        dexSwapFeesUsd: 300,
        estimatedGasUsd: 0.02,
        netProfitUsd: 1849.98,
        network: 'Arbitrum One',
        arkhamSignal: {
          entity: 'Retail Whale Order',
          action: 'Uniswap V3 Single Pool Swap',
          riskLevel: 'LOW',
          rawDescription: 'Single organic transaction pushed Camelot out of balance by 0.48%. Zero smart money exits.'
        },
        nansenMetrics: {
          smartMoneyFlow24hUsd: 840000,
          mempoolBotCompetitors: 0,
          poolLiquidityDepthUsd: 14200000,
          poolLiquidityChange10mPct: 0,
          baseFeeGwei: 0.12
        },
        jevStatus: 'APPROVED',
        executionStatus: 'EXECUTED_PROFIT',
        txHash: '0x7f92b...a49d'
      },
      {
        id: 'opp-2',
        timestamp: '15:02:12.840',
        blockNumber: 214839180,
        tokenPair: 'ARB / USDC',
        tokenSymbol: 'ARB',
        borrowAsset: 'USDC',
        flashLoanAmountUsd: 1000000,
        buyExchange: 'SushiSwap',
        buyPrice: 0.812,
        sellExchange: 'Uniswap V3',
        sellPrice: 0.817,
        spreadPct: 0.62,
        grossProfitUsd: 6200,
        aaveFeeUsd: 500,
        dexSwapFeesUsd: 600,
        estimatedGasUsd: 0.02,
        netProfitUsd: 0,
        network: 'Arbitrum One',
        arkhamSignal: {
          entity: 'Wintermute + MEV Sandwich',
          action: 'Aggressive Liquidity Removal',
          riskLevel: 'HIGH',
          rawDescription: 'Arkham alert: Wintermute pulled $600k liquidity; 4 competing MEV bots clustered in current block.'
        },
        nansenMetrics: {
          smartMoneyFlow24hUsd: -2400000,
          mempoolBotCompetitors: 4,
          poolLiquidityDepthUsd: 4800000,
          poolLiquidityChange10mPct: -35,
          baseFeeGwei: 48.0
        },
        jevStatus: 'BLOCKED',
        executionStatus: 'ABORTED_PREFLIGHT'
      },
      {
        id: 'opp-3',
        timestamp: '15:02:04.410',
        blockNumber: 214839150,
        tokenPair: 'WBTC / USDC',
        tokenSymbol: 'WBTC',
        borrowAsset: 'USDC',
        flashLoanAmountUsd: 2000000,
        buyExchange: 'Uniswap V3',
        buyPrice: 91420,
        sellExchange: 'Curve Finance',
        sellPrice: 91480,
        spreadPct: 0.065,
        grossProfitUsd: 1300,
        aaveFeeUsd: 1000,
        dexSwapFeesUsd: 1800,
        estimatedGasUsd: 0.02,
        netProfitUsd: -1500,
        network: 'Arbitrum One',
        arkhamSignal: {
          entity: 'High-Frequency Quants',
          action: 'Narrow Spread Squeeze',
          riskLevel: 'MEDIUM',
          rawDescription: 'Raw spread (0.065%) fails to cover Aave 0.05% fee ($1000) and DEX fees ($1800).'
        },
        nansenMetrics: {
          smartMoneyFlow24hUsd: 120000,
          mempoolBotCompetitors: 1,
          poolLiquidityDepthUsd: 28000000,
          poolLiquidityChange10mPct: -2,
          baseFeeGwei: 0.18
        },
        jevStatus: 'BLOCKED',
        executionStatus: 'ABORTED_PREFLIGHT'
      }
    ];

    setOpportunities(initialList);
    setSelectedOpp(initialList[0]);
  }, []);

  // Block counter simulation (Arbitrum 0.25s blocks)
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setBlockNumber((prev) => prev + 1);
    }, 250);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Periodic opportunities generator (push-based Alchemy websocket simulation)
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // 70% of random events are risky/aborted (saving gas!), 30% are clean profit
      const isRisky = Math.random() > 0.35;
      const presets = SCENARIO_PRESETS;
      const preset = isRisky 
        ? presets[1 + Math.floor(Math.random() * (presets.length - 1))]
        : presets[0];

      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const loanAmount = activeFlashLoanSize;
      const gross = loanAmount * (preset.spreadPct / 100);
      const aaveFee = loanAmount * 0.0005; // 0.05%
      const dexSwap = loanAmount * 0.0006;  // 0.06%
      const gas = 0.02;
      const net = gross - (aaveFee + dexSwap + gas);

      const newOpp: ArbitrageOpportunity = {
        id: 'opp-' + Date.now(),
        timestamp: timeStr,
        blockNumber: blockNumber + 1,
        tokenPair: preset.tokenPair,
        tokenSymbol: preset.tokenPair.split(' / ')[0],
        borrowAsset: preset.borrowAsset,
        flashLoanAmountUsd: loanAmount,
        buyExchange: preset.buyDex,
        buyPrice: 3200 + Math.random() * 50,
        sellExchange: preset.sellDex,
        sellPrice: 3200 * (1 + preset.spreadPct / 100),
        spreadPct: preset.spreadPct,
        grossProfitUsd: Math.round(gross),
        aaveFeeUsd: Math.round(aaveFee),
        dexSwapFeesUsd: Math.round(dexSwap),
        estimatedGasUsd: gas,
        netProfitUsd: preset.expectedVerdict === 'PROCEED' ? Math.round(net) : 0,
        network: 'Arbitrum One',
        arkhamSignal: {
          entity: preset.arkhamContext.entity,
          action: preset.arkhamContext.action,
          riskLevel: preset.expectedVerdict === 'PROCEED' ? 'LOW' : 'HIGH',
          rawDescription: preset.arkhamContext.description
        },
        nansenMetrics: {
          smartMoneyFlow24hUsd: preset.nansenContext.smartMoneyFlow24hUsd,
          mempoolBotCompetitors: preset.nansenContext.mempoolBots,
          poolLiquidityDepthUsd: 12000000,
          poolLiquidityChange10mPct: preset.nansenContext.poolLiquidityDrop10mPct,
          baseFeeGwei: preset.nansenContext.baseFeeGwei
        },
        jevStatus: preset.expectedVerdict === 'PROCEED' ? 'APPROVED' : 'BLOCKED',
        executionStatus: preset.expectedVerdict === 'PROCEED' ? 'EXECUTED_PROFIT' : 'ABORTED_PREFLIGHT',
        txHash: preset.expectedVerdict === 'PROCEED' ? `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}` : undefined
      };

      setOpportunities((prev) => [newOpp, ...prev.slice(0, 19)]);
      if (preset.expectedVerdict === 'PROCEED') {
        setTotalProfit((prev) => prev + Math.round(net));
      } else {
        // Saved gas by not reverting
        setGasSaved((prev) => prev + 45); // saved estimated revert gas
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming, blockNumber, activeFlashLoanSize]);

  // Inject manual scenarios
  const injectScenario = async (scenarioIndex: number) => {
    const preset = SCENARIO_PRESETS[scenarioIndex];
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const loanAmount = activeFlashLoanSize;
    const gross = loanAmount * (preset.spreadPct / 100);
    const aaveFee = loanAmount * 0.0005;
    const dexSwap = loanAmount * 0.0006;
    const net = gross - (aaveFee + dexSwap + 0.02);

    const manualOpp: ArbitrageOpportunity = {
      id: 'opp-inj-' + Date.now(),
      timestamp: timeStr,
      blockNumber: blockNumber + 1,
      tokenPair: preset.tokenPair,
      tokenSymbol: preset.tokenPair.split(' / ')[0],
      borrowAsset: preset.borrowAsset,
      flashLoanAmountUsd: loanAmount,
      buyExchange: preset.buyDex,
      buyPrice: 3240,
      sellExchange: preset.sellDex,
      sellPrice: 3240 * (1 + preset.spreadPct / 100),
      spreadPct: preset.spreadPct,
      grossProfitUsd: Math.round(gross),
      aaveFeeUsd: Math.round(aaveFee),
      dexSwapFeesUsd: Math.round(dexSwap),
      estimatedGasUsd: 0.02,
      netProfitUsd: preset.expectedVerdict === 'PROCEED' ? Math.round(net) : 0,
      network: 'Arbitrum One',
      arkhamSignal: {
        entity: preset.arkhamContext.entity,
        action: preset.arkhamContext.action,
        riskLevel: preset.expectedVerdict === 'PROCEED' ? 'LOW' : 'EXTREME',
        rawDescription: preset.arkhamContext.description
      },
      nansenMetrics: {
        smartMoneyFlow24hUsd: preset.nansenContext.smartMoneyFlow24hUsd,
        mempoolBotCompetitors: preset.nansenContext.mempoolBots,
        poolLiquidityDepthUsd: 10000000,
        poolLiquidityChange10mPct: preset.nansenContext.poolLiquidityDrop10mPct,
        baseFeeGwei: preset.nansenContext.baseFeeGwei
      },
      jevStatus: 'EVALUATING'
    };

    setOpportunities((prev) => [manualOpp, ...prev]);
    setSelectedOpp(manualOpp);

    // Run real JEV evaluation
    const jevResp = await JevEngineService.evaluate({
      state: preset.rawState,
      questions: STANDARD_JEV_QUESTIONS
    });

    manualOpp.jevResult = jevResp;
    manualOpp.jevStatus = jevResp.decision.passed ? 'APPROVED' : 'BLOCKED';
    manualOpp.executionStatus = jevResp.decision.passed ? 'EXECUTED_PROFIT' : 'ABORTED_PREFLIGHT';
    if (jevResp.decision.passed) {
      manualOpp.txHash = `0x${Math.random().toString(16).substring(2, 8)}...arbitrum`;
      setTotalProfit((prev) => prev + Math.round(net));
    } else {
      setGasSaved((prev) => prev + 50);
    }

    setOpportunities((prev) => [manualOpp, ...prev.filter((o) => o.id !== manualOpp.id)]);
    setSelectedOpp({ ...manualOpp });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Telemetry & Key Invariants Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400">Arbitrum Block</div>
          <div className="text-lg font-mono font-bold text-white tabular-nums tracking-tight">
            #{blockNumber.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">0.25s block time · FCFS</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400">JEV Engine Latency</div>
          <div className="text-lg font-mono font-bold text-cyan-400 tabular-nums tracking-tight">
            165 ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">$0.042 / 1M tokens · System 1</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400">Net Profit Harvested</div>
          <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums tracking-tight">
            ${totalProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Post Aave 0.05% & DEX fees</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400">Revert Gas Protected</div>
          <div className="text-lg font-mono font-bold text-amber-400 tabular-nums tracking-tight">
            ${gasSaved.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Pre-flight aborted bad blocks</div>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg col-span-2 md:col-span-1">
          <div className="text-[11px] font-medium text-slate-400">WebSocket Senses</div>
          <div className="text-lg font-mono font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Alchemy Push
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Listening Uniswap V3 logs</div>
        </div>
      </div>

      {/* Stream Controls & Injection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isStreaming
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Alchemy Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Streaming</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Aave Capital:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
              {[250000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setActiveFlashLoanSize(amt)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    activeFlashLoanSize === amt
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Scenario Injectors */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden xl:inline">Simulate Dislocation:</span>
          <button
            onClick={() => injectScenario(0)}
            className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Clean Dislocation</span>
          </button>
          <button
            onClick={() => injectScenario(1)}
            className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded hover:bg-amber-900/60 transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>MEV Bot Sandwich</span>
          </button>
          <button
            onClick={() => injectScenario(2)}
            className="px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded hover:bg-rose-900/60 transition-colors flex items-center gap-1"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Fee Exhaustion Trap</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Opportunities Stream (Left 7 cols) & JEV Decision Inspection Panel (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Arbitrum Dislocation Stream</span>
              <span className="text-xs text-slate-400 font-normal">
                ({opportunities.length} live records)
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Aave V3 fee: 0.05% · DEX swap fee: 0.06%
            </span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <div className="overflow-x-auto max-h-[540px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                    <th className="py-2.5 px-3 font-medium">Time / Block</th>
                    <th className="py-2.5 px-3 font-medium">Pair & Route</th>
                    <th className="py-2.5 px-3 font-medium text-right">Spread</th>
                    <th className="py-2.5 px-3 font-medium">Arkham / Nansen</th>
                    <th className="py-2.5 px-3 font-medium text-center">JEV Gate</th>
                    <th className="py-2.5 px-3 font-medium text-right">Net PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {opportunities.map((opp) => {
                    const isSelected = selectedOpp?.id === opp.id;
                    return (
                      <tr
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-950/40 text-slate-100'
                            : 'hover:bg-slate-900/40 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-slate-200">{opp.timestamp}</div>
                          <div className="text-[10px] text-slate-400">#{opp.blockNumber}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-200 font-sans">{opp.tokenPair}</div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {opp.buyExchange} → {opp.sellExchange}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap tabular-nums">
                          <div className="font-bold text-white">+{opp.spreadPct}%</div>
                          <div className="text-[10px] text-slate-400">${(opp.flashLoanAmountUsd / 1000).toFixed(0)}k loan</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-xs text-slate-200 font-sans truncate max-w-[130px]" title={opp.arkhamSignal.rawDescription}>
                            {opp.arkhamSignal.entity}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {opp.nansenMetrics.mempoolBotCompetitors > 0 ? (
                              <span className="text-amber-400">⚠ {opp.nansenMetrics.mempoolBotCompetitors} competing bots</span>
                            ) : (
                              <span className="text-emerald-400">✓ Clean block</span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {opp.jevStatus === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              PASS
                            </span>
                          )}
                          {opp.jevStatus === 'BLOCKED' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold font-sans">
                              <XCircle className="w-3.5 h-3.5 text-amber-400" />
                              ABORT
                            </span>
                          )}
                          {opp.jevStatus === 'EVALUATING' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-semibold font-sans">
                              <Zap className="w-3.5 h-3.5 animate-spin" />
                              EVAL
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap tabular-nums">
                          {opp.executionStatus === 'EXECUTED_PROFIT' ? (
                            <div className="font-bold text-emerald-400 font-mono">
                              +${opp.netProfitUsd.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs font-mono">
                              $0 <span className="text-[10px] text-slate-400">(Saved Gas)</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Gross ${opp.grossProfitUsd.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed JEV System-One Inspection & Latency Waterfall */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Pre-Flight Gate Assessment</h3>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedOpp ? `${selectedOpp.tokenPair} · Block #${selectedOpp.blockNumber}` : 'Select a transaction'}
                </div>
              </div>

              {selectedOpp && (
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${
                      selectedOpp.jevStatus === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {selectedOpp.jevStatus === 'APPROVED' ? 'PASSED · EXECUTED' : 'BLOCKED · SAVED GAS'}
                  </span>
                </div>
              )}
            </div>

            {selectedOpp ? (
              <div className="space-y-4 text-xs">
                {/* Arkham Intel & Nansen Context */}
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                    1. Ingestion: Arkham & Nansen State
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">
                    {selectedOpp.arkhamSignal.rawDescription}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                    <span>Base Gas: {selectedOpp.nansenMetrics.baseFeeGwei} gwei</span>
                    <span>·</span>
                    <span>MEV Competitors: {selectedOpp.nansenMetrics.mempoolBotCompetitors}</span>
                    <span>·</span>
                    <span>Pool Depth: ${(selectedOpp.nansenMetrics.poolLiquidityDepthUsd / 1_000_000).toFixed(1)}M</span>
                  </div>
                </div>

                {/* Probabilistic Output from JEV System One */}
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                      2. JEV System-One Probabilities
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">&lt; 180ms inference</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {/* will_aave_callback_revert */}
                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>will_aave_callback_revert (noul)</span>
                        <span className="font-semibold text-white">
                          {selectedOpp.jevStatus === 'APPROVED' ? '2.4% (Threshold < 12%)' : '79.2% (EXCEEDS 12%)'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${selectedOpp.jevStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: selectedOpp.jevStatus === 'APPROVED' ? '2.4%' : '79.2%' }}
                        ></div>
                      </div>
                    </div>

                    {/* block_safety_score */}
                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>block_safety_score (score 1-5)</span>
                        <span className="font-semibold text-white">
                          {selectedOpp.jevStatus === 'APPROVED' ? '4.85 / 5.0 (Min 4.0)' : '2.10 / 5.0 (FAIL)'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${selectedOpp.jevStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: selectedOpp.jevStatus === 'APPROVED' ? '97%' : '42%' }}
                        ></div>
                      </div>
                    </div>

                    {/* profit_margin_viability */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">profit_margin_viability (choice):</span>
                      <span className={`font-semibold ${selectedOpp.jevStatus === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedOpp.jevStatus === 'APPROVED' ? 'highly_profitable' : 'revert_loss_only'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deterministic Execution Branch */}
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                    3. Python Harness Conditional Gate
                  </div>
                  <pre className="text-slate-300 bg-slate-900 p-2 rounded text-[10px] overflow-x-auto leading-relaxed">
{selectedOpp.jevStatus === 'APPROVED'
  ? `# Rule Check: Passed all invariants
if revert_risk (0.024) <= 0.12 and safety (4.85) >= 4.0:
    broadcast_tx(POOL.flashLoanSimple(
        receiver=CONTRACT, 
        asset=USDC, 
        amount=$${selectedOpp.flashLoanAmountUsd.toLocaleString()}
    ))
    -> SUCCESS: Net Profit +$${selectedOpp.netProfitUsd.toLocaleString()}`
  : `# Rule Check: Triggered safety firewall
if revert_risk (0.792) > 0.12:
    abort_execution("MEV / Revert risk too high")
    -> ABORTED: Saved ~$45 gas, zero capital risk`}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectForJev(selectedOpp)}
                    className="flex-1 py-1.5 px-3 text-center text-xs font-semibold text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 rounded hover:bg-cyan-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open in JEV Playground</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenCode}
                    className="py-1.5 px-3 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>View Script</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Select an arbitrage opportunity from the stream to view full JEV classification telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Second Lifecycle Interactive Waterfall (0ms to 550ms) */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Sub-Second Lifecycle of a Single Flash Loan Arbitrage (Arbitrum One)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Total loop: ~500ms · Fits Arbitrum 250ms block window</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            {
              time: '0ms - 50ms',
              title: '1. Alchemy WebSockets',
              subtitle: 'The Senses',
              desc: 'Pushes raw Uniswap V3 Swap event logs the exact millisecond they happen on-chain.',
              active: selectedLatencyStep === 0
            },
            {
              time: '50ms - 70ms',
              title: '2. Math Engine',
              subtitle: 'The Calculator',
              desc: 'Calculates raw spread, gross profit, and verifies Aave 0.05% fee ($250) is covered.',
              active: selectedLatencyStep === 1
            },
            {
              time: '70ms - 235ms',
              title: '3. TypeSafe AI Jev',
              subtitle: 'The Brain (<165ms)',
              desc: 'Non-autoregressive System-1 classification. Outputs typed probabilities for revert & safety.',
              active: selectedLatencyStep === 2
            },
            {
              time: '235ms - 255ms',
              title: '4. Python Harness',
              subtitle: 'The Muscle',
              desc: 'Deterministic conditional guard checks. Signs raw Web3 transaction with private key.',
              active: selectedLatencyStep === 3
            },
            {
              time: '255ms - 505ms',
              title: '5. Arbitrum Sequencer',
              subtitle: 'Execution Finality',
              desc: 'Arbitrum FCFS Sequencer finalizes block. Aave loan borrowed, swaps executed, profit deposited.',
              active: selectedLatencyStep === 4
            }
          ].map((step, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedLatencyStep(idx)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                selectedLatencyStep === idx
                  ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-cyan-400 font-semibold">{step.time}</div>
              <div className="text-xs font-semibold text-white mt-0.5">{step.title}</div>
              <div className="text-[11px] text-slate-400 font-mono">{step.subtitle}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
