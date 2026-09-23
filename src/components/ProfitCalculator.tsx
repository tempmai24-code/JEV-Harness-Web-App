import React, { useState } from 'react';
import { NETWORK_PROFILES } from '../data/mockData';
import { Calculator, ArrowRight, ShieldCheck, TrendingUp, Layers } from 'lucide-react';

export const ProfitCalculator: React.FC = () => {
  // Configurable inputs
  const [loanAmount, setLoanAmount] = useState<number>(1000000); // $1M USDC
  const [spreadPct, setSpreadPct] = useState<number>(0.35);      // 0.35% gross
  const [dexFeePct, setDexFeePct] = useState<number>(0.10);      // 0.05% + 0.05%
  const [customGasUsd, setCustomGasUsd] = useState<number>(0.02);
  const [dailyScanAttempts, setDailyScanAttempts] = useState<number>(250);

  // Aave V3 fixed invariant
  const aaveFeePct = 0.05; // 0.05% fixed on Aave V3

  // Core Math Formula
  const grossProfitUsd = loanAmount * (spreadPct / 100);
  const aaveFeeUsd = loanAmount * (aaveFeePct / 100);
  const dexFeesUsd = loanAmount * (dexFeePct / 100);
  const totalCostUsd = aaveFeeUsd + dexFeesUsd + customGasUsd;
  const netProfitUsd = grossProfitUsd - totalCostUsd;
  const breakEvenSpreadPct = ((aaveFeeUsd + dexFeesUsd + customGasUsd) / loanAmount) * 100;
  const netRoiOnBorrowPct = (netProfitUsd / loanAmount) * 100;

  // Revert Pain Analysis
  // Assume a naive bot without JEV attempts trades where 35% revert due to MEV competition
  const revertRateNaive = 0.35;
  const revertRateWithJev = 0.02; // JEV catches 94% of doomed blocks
  const dailyRevertsNaive = Math.round(dailyScanAttempts * revertRateNaive);
  const dailyRevertsJev = Math.round(dailyScanAttempts * revertRateWithJev);

  return (
    <div className="space-y-6">
      {/* Mathematical Header Formula */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>The Flash Loan Profit Equation (Aave V3 · Arbitrum One)</span>
        </h2>
        <div className="mt-3 p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
          <span className="text-cyan-400 font-bold">Net Profit</span> = Gross Arbitrage Revenue - (
          <span className="text-amber-400">Aave V3 Fee (0.05%)</span> +{' '}
          <span className="text-purple-400">DEX Swap Fees (0.10%)</span> +{' '}
          <span className="text-emerald-400">Network Gas (~$0.02)</span>)
        </div>
      </div>

      {/* Main Interactive Controls & Live Cash Flow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Variables (Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4 p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Arbitrage Trade Parameters
          </h3>

          {/* Flash Loan Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Aave V3 Flash Loan Amount:</span>
              <span className="font-mono font-bold text-white">${loanAmount.toLocaleString()} USDC</span>
            </div>
            <input
              type="range"
              min={100000}
              max={5000000}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>$100k</span>
              <span>$1M</span>
              <span>$2.5M</span>
              <span>$5M</span>
            </div>
          </div>

          {/* Gross Dislocation Spread % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Gross Price Spread (DEX A vs DEX B):</span>
              <span className="font-mono font-bold text-cyan-400">+{spreadPct.toFixed(3)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.5}
              step={0.01}
              value={spreadPct}
              onChange={(e) => setSpreadPct(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.05% (Squeezed)</span>
              <span>0.25% (Standard)</span>
              <span>0.80% (Volatile)</span>
              <span>1.50% (Extreme)</span>
            </div>
          </div>

          {/* Combined DEX Swap Fees */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Combined DEX Swap Fees (Buy + Sell):</span>
              <span className="font-mono font-bold text-purple-400">{dexFeePct.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.30}
              step={0.01}
              value={dexFeePct}
              onChange={(e) => setDexFeePct(Number(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.04% (Curve)</span>
              <span>0.10% (Uniswap V3 0.05%)</span>
              <span>0.30% (Uniswap 0.3%)</span>
            </div>
          </div>

          {/* Arbitrum Gas Fee */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated Arbitrum Execution Gas:</span>
              <span className="font-mono font-bold text-emerald-400">${customGasUsd.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.005}
              max={0.20}
              step={0.005}
              value={customGasUsd}
              onChange={(e) => setCustomGasUsd(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded"
            />
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Aave V3 Protocol Invariant:</div>
            <div className="font-mono text-slate-200">
              Immutable Premium Fee: <strong className="text-amber-400">0.0500%</strong> (Fixed on Pool 0xa976...CDb)
            </div>
          </div>
        </div>

        {/* Real-time Ledger Breakdown & Net Output (Right 6 cols) */}
        <div className="lg:col-span-6 space-y-4 p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Atomic Transaction Cash Flow
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800 text-slate-300">
              <span>Gross Revenue ({spreadPct.toFixed(2)}% on ${(loanAmount/1000).toFixed(0)}k):</span>
              <span className="font-bold text-white text-sm">+${grossProfitUsd.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 text-slate-400">
              <span>- Aave V3 Flash Loan Fee (0.05%):</span>
              <span className="text-amber-400">-${aaveFeeUsd.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 text-slate-400">
              <span>- DEX Multi-Hop Swap Fees ({dexFeePct.toFixed(2)}%):</span>
              <span className="text-purple-400">-${dexFeesUsd.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 text-slate-400">
              <span>- Arbitrum Sequencer Gas:</span>
              <span className="text-emerald-400">-${customGasUsd.toFixed(3)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-300">Net Profit Per Flash Loan:</span>
                <div className="text-[11px] text-slate-500">Atomic single-block payout</div>
              </div>
              <div className={`text-xl font-bold font-mono ${netProfitUsd > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfitUsd > 0 ? `+$${netProfitUsd.toFixed(2)}` : `-$${Math.abs(netProfitUsd).toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Break-even Indicator Box */}
          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Break-Even Spread Threshold:</span>
              <span className="font-mono font-bold text-cyan-400">{breakEvenSpreadPct.toFixed(4)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${spreadPct >= breakEvenSpreadPct ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (spreadPct / (breakEvenSpreadPct * 2)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              {spreadPct >= breakEvenSpreadPct
                ? `✓ Current spread of ${spreadPct.toFixed(2)}% is ${(spreadPct - breakEvenSpreadPct).toFixed(3)}% above break-even. Yield is positive.`
                : `⚠ Warning: Spread is below ${breakEvenSpreadPct.toFixed(3)}%. JEV will flag 'fee_exhausted_negative' and abort.`}
            </p>
          </div>
        </div>
      </div>

      {/* Network Profile Comparison Matrix (Arbitrum vs Ethereum vs Base) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Strategic Network Comparison: Why Arbitrum One Wins
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NETWORK_PROFILES.map((net) => {
            const isArbitrum = net.name === 'Arbitrum One';
            // Calculate same trade on each network
            const gasCost = net.avgGasCostUsd;
            const netOnNet = grossProfitUsd - (aaveFeeUsd + dexFeesUsd + gasCost);

            return (
              <div
                key={net.name}
                className={`p-4 rounded-lg border space-y-3 ${
                  isArbitrum
                    ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{net.name}</span>
                      {isArbitrum && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          RECOMMENDED
                        </span>
                      )}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{net.mempoolArchitecture}</div>
                  </div>
                  <span className={`text-xs font-bold font-mono ${
                    net.jevSynergy === 'PERFECT' ? 'text-emerald-400' : net.jevSynergy === 'GOOD' ? 'text-cyan-400' : 'text-rose-400'
                  }`}>
                    {net.jevSynergy} SYNERGY
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono border-y border-slate-800/80 py-2.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Block Time:</span>
                    <span className="text-white font-semibold">{net.blockTimeSec}s</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Average Gas:</span>
                    <span className="text-white font-semibold">${net.avgGasCostUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Failed Revert Cost:</span>
                    <span className={net.failedRevertCostUsd > 10 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      ${net.failedRevertCostUsd.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Aave V3 Liquidity:</span>
                    <span className="text-slate-200">{net.aaveV3LiquidityUsd}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Net Profit on This Trade:</span>
                    <span className={`font-bold ${netOnNet > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${netOnNet.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug">
                    {net.synergyReason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The "Revert Pain" Gas Savings Analysis */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Revert Pain Analysis: Why JEV Pre-Flight is Mandatory</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {dailyScanAttempts} simulated daily arbitrage checks
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Arbitrum transactions are cheap, but over hundreds of opportunities per day, blind flash loan execution results in 30% to 50% reverted transactions due to fleeting liquidity and competitive MEV bots. JEV operates as a sub-200ms pre-flight firewall, saving thousands in wasted block space.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
          <div className="p-3 bg-slate-950 border border-rose-900/50 rounded space-y-1.5">
            <div className="text-rose-400 font-bold flex items-center justify-between">
              <span>Naive Blind Bot (Without JEV)</span>
              <span>~35% Revert Failure</span>
            </div>
            <div className="text-slate-300">Daily Reverts: ~{dailyRevertsNaive} failed blocks</div>
            <div className="text-slate-400">
              Wasted Gas / Day: <strong className="text-rose-400">${(dailyRevertsNaive * 0.45).toFixed(2)}</strong> (on Arbitrum) or <strong className="text-rose-400">${(dailyRevertsNaive * 55).toFixed(0)}</strong> (on Ethereum)
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              Reverts erode operational capital and eat tight arbitrage margins.
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-emerald-900/50 rounded space-y-1.5">
            <div className="text-emerald-400 font-bold flex items-center justify-between">
              <span>JEV-Gated Bot (System-One Firewall)</span>
              <span>&lt;2% Revert Failure</span>
            </div>
            <div className="text-slate-300">Daily Reverts: ~{dailyRevertsJev} failed blocks (94% filtered out)</div>
            <div className="text-slate-400">
              Total JEV Cost for 250 checks: <strong className="text-cyan-400">$0.0018</strong> ($0.042/1M tokens)
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              ROI on JEV checks exceeds 4,000x by preventing failed contract execution fees.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
