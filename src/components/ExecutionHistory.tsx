import React, { useState, useMemo } from 'react';
import { ExecutionRecord, ExecutionOutcome } from '../types/arbitrage';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ExternalLink, 
  Search, 
  Filter, 
  Download, 
  Play, 
  ShieldAlert, 
  Cpu, 
  Coins, 
  Clock, 
  Zap, 
  ChevronDown,
  Info,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { generateRandomExecution } from '../data/mockHistory';

interface ExecutionHistoryProps {
  history: ExecutionRecord[];
  onAddExecution?: (record: ExecutionRecord) => void;
  onOpenCode?: () => void;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  history,
  onAddExecution,
  onOpenCode
}) => {
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'SUCCESS' | 'FAIL'>('ALL');
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'margin' | 'profit' | 'loan'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<ExecutionRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Compute metrics
  const stats = useMemo(() => {
    const total = history.length;
    const successes = history.filter((r) => r.outcome === 'SUCCESS');
    const fails = history.filter((r) => r.outcome === 'FAIL');
    const successCount = successes.length;
    const failCount = fails.length;
    const winRate = total > 0 ? (successCount / total) * 100 : 0;
    
    const totalNetProfit = history.reduce((sum, r) => sum + r.netProfitUsd, 0);
    const totalGrossRevenue = history.reduce((sum, r) => sum + r.grossRevenueUsd, 0);
    const totalAaveFees = history.reduce((sum, r) => sum + r.aaveFeeUsd, 0);
    const totalCapitalCycled = history.reduce((sum, r) => sum + r.flashLoanAmountUsd, 0);
    
    const avgMarginSuccess = successCount > 0 
      ? successes.reduce((sum, r) => sum + r.profitMarginPct, 0) / successCount 
      : 0;

    return {
      total,
      successCount,
      failCount,
      winRate,
      totalNetProfit,
      totalGrossRevenue,
      totalAaveFees,
      totalCapitalCycled,
      avgMarginSuccess
    };
  }, [history]);

  // Unique token pairs for filter
  const uniquePairs = useMemo(() => {
    const set = new Set(history.map((r) => r.tokenPair));
    return Array.from(set);
  }, [history]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return history
      .filter((record) => {
        // Outcome filter
        if (filterOutcome !== 'ALL' && record.outcome !== filterOutcome) {
          return false;
        }
        // Pair filter
        if (filterPair !== 'ALL' && record.tokenPair !== filterPair) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPair = record.tokenPair.toLowerCase().includes(q);
          const matchTx = record.txHash.toLowerCase().includes(q);
          const matchExchange = (record.buyExchange + ' ' + record.sellExchange).toLowerCase().includes(q);
          const matchEntity = record.arkhamEntity.toLowerCase().includes(q);
          const matchReason = record.outcomeReason.toLowerCase().includes(q);
          return matchPair || matchTx || matchExchange || matchEntity || matchReason;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'timestamp') {
          diff = new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
        } else if (sortBy === 'margin') {
          diff = b.profitMarginPct - a.profitMarginPct;
        } else if (sortBy === 'profit') {
          diff = b.netProfitUsd - a.netProfitUsd;
        } else if (sortBy === 'loan') {
          diff = b.flashLoanAmountUsd - a.flashLoanAmountUsd;
        }
        return sortDirection === 'desc' ? diff : -diff;
      });
  }, [history, filterOutcome, filterPair, searchQuery, sortBy, sortDirection]);

  // Quick simulate new trade attempt
  const handleSimulateAttempt = (outcomeType?: 'SUCCESS' | 'FAIL') => {
    setIsSimulating(true);
    setTimeout(() => {
      const newRec = generateRandomExecution(outcomeType);
      if (onAddExecution) {
        onAddExecution(newRec);
      }
      setIsSimulating(false);
    }, 400);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'BlockNumber',
      'Status',
      'TokenPair',
      'LoanAmountUSD',
      'SpreadPct',
      'ProfitMarginPct',
      'GrossRevenueUSD',
      'AaveFeeUSD',
      'DexSwapFeeUSD',
      'NetProfitUSD',
      'BuyExchange',
      'SellExchange',
      'TxHash',
      'OutcomeReason'
    ];

    const rows = history.map((r) => [
      `"${r.timestamp}"`,
      r.blockNumber,
      r.outcome,
      `"${r.tokenPair}"`,
      r.flashLoanAmountUsd,
      r.spreadPct,
      r.profitMarginPct,
      r.grossRevenueUsd,
      r.aaveFeeUsd,
      r.dexSwapFeeUsd,
      r.netProfitUsd,
      `"${r.buyExchange}"`,
      `"${r.sellExchange}"`,
      `"${r.txHash}"`,
      `"${r.outcomeReason.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arbitrage_execution_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span>Execution History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical audit log of past Aave V3 flash loan executions, profit margins, and on-chain settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateAttempt('SUCCESS')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm"
            title="Simulate a profitable flash loan execution"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Trade</span>
          </button>

          <button
            onClick={() => handleSimulateAttempt('FAIL')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 rounded-md transition-colors"
            title="Simulate a reverted or fee-exhausted attempt"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Revert</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-md transition-colors"
            title="Download execution history as CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Realized Profit */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Net Realized Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-mono font-bold mt-1 ${stats.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.totalNetProfit >= 0 ? '+' : ''}${stats.totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Gross Rev: ${stats.totalGrossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Metric 2: Win Rate & Attempt Count */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span className="text-emerald-400 font-semibold">{stats.successCount} won</span>
            <span className="text-slate-600 mx-1.5">/</span>
            <span className="text-rose-400 font-semibold">{stats.failCount} failed</span>
            <span className="text-slate-600 mx-1.5">·</span>
            <span>{stats.total} total</span>
          </div>
        </div>

        {/* Metric 3: Average Profit Margin */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Avg Win Margin</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300 mt-1">
            +{stats.avgMarginSuccess.toFixed(3)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Aave 0.05% fee subtracted
          </div>
        </div>

        {/* Metric 4: Total Flash Loan Capital Cycled */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Total Capital Cycled</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-100 mt-1">
            ${(stats.totalCapitalCycled / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Aave Pool Fees Paid: ${stats.totalAaveFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Filter Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setFilterOutcome('ALL')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                filterOutcome === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilterOutcome('SUCCESS')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                filterOutcome === 'SUCCESS'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Success ({stats.successCount})</span>
            </button>
            <button
              onClick={() => setFilterOutcome('FAIL')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
                filterOutcome === 'FAIL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Fail ({stats.failCount})</span>
            </button>
          </div>

          {/* Pair Select */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <span className="text-slate-500">Pair:</span>
            <select
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Pairs</option>
              {uniquePairs.map((pair) => (
                <option key={pair} value={pair} className="bg-slate-900 text-slate-200">{pair}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair, DEX, tx..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="timestamp" className="bg-slate-900 text-slate-200">Timestamp</option>
              <option value="margin" className="bg-slate-900 text-slate-200">Profit Margin</option>
              <option value="profit" className="bg-slate-900 text-slate-200">Net Profit ($)</option>
              <option value="loan" className="bg-slate-900 text-slate-200">Loan Capital</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
              className="p-0.5 hover:text-white"
              title="Toggle sort direction"
            >
              {sortDirection === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Execution History Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                <th className="py-3 px-3.5 font-medium">Timestamp / Block</th>
                <th className="py-3 px-3.5 font-medium">Status</th>
                <th className="py-3 px-3.5 font-medium">Pair & Route</th>
                <th className="py-3 px-3.5 font-medium text-right">Capital Cycled</th>
                <th className="py-3 px-3.5 font-medium text-right">Raw Spread</th>
                <th className="py-3 px-3.5 font-medium text-right">Profit Margin</th>
                <th className="py-3 px-3.5 font-medium text-right">Net Realized PnL</th>
                <th className="py-3 px-3.5 font-medium">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No execution records match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isSuccess = record.outcome === 'SUCCESS';
                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="cursor-pointer transition-colors hover:bg-slate-900/50"
                    >
                      {/* Timestamp & Block */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{record.timestamp}</div>
                        <div className="text-[10px] text-slate-500">#{record.blockNumber}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 border border-emerald-800/90 text-emerald-300 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Success</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-950/80 border border-rose-800/90 text-rose-300 font-sans">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Fail</span>
                          </span>
                        )}
                      </td>

                      {/* Pair & Route */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-100 font-sans flex items-center gap-1.5">
                          <span>{record.tokenPair}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {record.buyExchange} → {record.sellExchange}
                        </div>
                      </td>

                      {/* Capital Cycled */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap tabular-nums">
                        <div className="text-slate-200 font-semibold">
                          ${(record.flashLoanAmountUsd).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          Aave V3 {record.borrowAsset}
                        </div>
                      </td>

                      {/* Raw Spread */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap tabular-nums">
                        <div className="text-slate-300 font-medium">
                          +{record.spreadPct.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Gross: ${record.grossRevenueUsd.toFixed(0)}
                        </div>
                      </td>

                      {/* Profit Margin % */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap tabular-nums">
                        <div className={`font-bold ${record.profitMarginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {record.profitMarginPct >= 0 ? '+' : ''}{record.profitMarginPct.toFixed(3)}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Fee: 0.05% Aave
                        </div>
                      </td>

                      {/* Net Realized PnL */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap tabular-nums">
                        <div className={`text-sm font-bold ${record.netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {record.netProfitUsd >= 0 ? '+' : ''}${record.netProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Gas: ${record.gasFeeUsd.toFixed(2)}
                        </div>
                      </td>

                      {/* Tx Hash */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
                          <span>{record.txHash.slice(0, 8)}...{record.txHash.slice(-6)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {record.arkhamEntity}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Detail Modal */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                {selectedRecord.outcome === 'SUCCESS' ? (
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedRecord.tokenPair} Arbitrage Execution</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                      selectedRecord.outcome === 'SUCCESS' 
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300' 
                        : 'bg-rose-950 border border-rose-800 text-rose-300'
                    }`}>
                      {selectedRecord.outcome}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Block #{selectedRecord.blockNumber} · Timestamp {selectedRecord.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Outcome Reason Statement */}
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                selectedRecord.outcome === 'SUCCESS'
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
              }`}>
                <span className="font-semibold">Execution Audit:</span> {selectedRecord.outcomeReason}
              </div>

              {/* PnL & Margin Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400">Flash Loan Capital</div>
                  <div className="text-sm font-bold text-white font-mono mt-1">
                    ${selectedRecord.flashLoanAmountUsd.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {selectedRecord.borrowAsset} via Aave V3
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400">Profit Margin</div>
                  <div className={`text-sm font-bold font-mono mt-1 ${selectedRecord.profitMarginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedRecord.profitMarginPct >= 0 ? '+' : ''}{selectedRecord.profitMarginPct.toFixed(3)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Net return on capital
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400">Net Realized PnL</div>
                  <div className={`text-sm font-bold font-mono mt-1 ${selectedRecord.netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedRecord.netProfitUsd >= 0 ? '+' : ''}${selectedRecord.netProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Settled to wallet
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400">Aave V3 Fee (0.05%)</div>
                  <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                    ${selectedRecord.aaveFeeUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Premium paid to pool
                  </div>
                </div>
              </div>

              {/* Swap Route & Price Spread */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3 font-mono">
                <div className="text-slate-400 font-medium font-sans">Multi-Hop DEX Settlement Route</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 text-[11px]">Leg 1: Buy Swap</div>
                    <div className="text-white font-semibold mt-0.5">{selectedRecord.buyExchange}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Price: ${selectedRecord.buyPrice.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 text-[11px]">Leg 2: Sell Swap</div>
                    <div className="text-white font-semibold mt-0.5">{selectedRecord.sellExchange}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Price: ${selectedRecord.sellPrice.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400 font-sans">
                  <span>Gross Spread: <strong className="text-slate-200">+{selectedRecord.spreadPct}%</strong></span>
                  <span>DEX Fees: <strong className="text-slate-200">${selectedRecord.dexSwapFeeUsd.toFixed(2)}</strong></span>
                  <span>Gas: <strong className="text-slate-200">${selectedRecord.gasFeeUsd.toFixed(2)} ({selectedRecord.gasUsedUnits.toLocaleString()} units)</strong></span>
                </div>
              </div>

              {/* Intelligence Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400 font-medium font-sans">Arkham Intelligence Signal</div>
                  <div className="text-slate-200 font-mono text-[11px]">{selectedRecord.arkhamEntity}</div>
                  <div className="text-[10px] text-slate-500 font-sans">Risk Flag: {selectedRecord.arkhamRisk}</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="text-slate-400 font-medium font-sans">TypeSafe JEV Gate Verdict</div>
                  <div className="text-cyan-300 font-mono text-[11px]">
                    {selectedRecord.jevVerdict} ({(selectedRecord.jevConfidence * 100).toFixed(1)}% confidence)
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">Inference Latency: {selectedRecord.executionLatencyMs}ms</div>
                </div>
              </div>

              {/* On-Chain Transaction & Contract Reference */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Arbitrum One TxHash:</span>
                  <a
                    href={`https://arbiscan.io/tx/${selectedRecord.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <span>{selectedRecord.txHash.slice(0, 14)}...{selectedRecord.txHash.slice(-10)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-sans">
                  <span>Aave V3 Pool:</span>
                  <span className="font-mono text-slate-300">0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80">
              <a
                href={`https://arbiscan.io/tx/${selectedRecord.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>View Full Receipt on Arbiscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
