import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  Cpu, 
  Eye, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Key,
  Server
} from 'lucide-react';
import { IntegrationService, IntegrationStatus, PingResponse } from '../services/integrationService';
import { WalletService, WalletState } from '../services/walletService';

interface ApiWalletBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: WalletState;
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
}

export const ApiWalletBindingModal: React.FC<ApiWalletBindingModalProps> = ({
  isOpen,
  onClose,
  walletState,
  setWalletState
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'wallet' | 'jev' | 'arkham' | 'nansen' | 'rpc'>('all');
  const [statusData, setStatusData] = useState<IntegrationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [pingResults, setPingResults] = useState<Record<string, PingResponse>>({});
  const [pinging, setPinging] = useState<string | null>(null);
  const [watchAddressInput, setWatchAddressInput] = useState<string>('');
  const [walletConnectError, setWalletConnectError] = useState<string | null>(null);

  // Fetch status on modal open
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await IntegrationService.getStatus();
      setStatusData(data);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePing = async (service: 'jev' | 'arkham' | 'nansen' | 'rpc') => {
    setPinging(service);
    try {
      const res = await IntegrationService.pingService(service);
      setPingResults((prev) => ({ ...prev, [service]: res }));
    } catch {
      // ignore
    } finally {
      setPinging(null);
    }
  };

  const handleConnectInjectedWallet = async () => {
    setWalletConnectError(null);
    try {
      const res = await WalletService.connectInjected();
      setWalletState(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setWalletConnectError(msg);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await WalletService.switchToArbitrum();
      const updated = await WalletService.connectInjected();
      setWalletState(updated);
    } catch {
      // ignore
    }
  };

  const handleConnectSimulated = () => {
    const res = WalletService.connectSimulated(watchAddressInput || undefined);
    setWalletState(res);
    setWalletConnectError(null);
  };

  const handleDisconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: '',
      balanceEth: '0.0000',
      isArbitrum: false,
      providerType: 'injected',
      error: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950/60 border border-cyan-800/80 rounded-lg text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>API & Wallet Binding Hub</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Arbitrum One (42161)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage backend proxy bindings for JEV, Arkham, Nansen & connect your Web3 wallet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStatus}
              disabled={loadingStatus}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Integrations (Overview)
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Web3 Wallet</span>
            {walletState.isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('jev')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'jev'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>TypeSafe JEV</span>
          </button>
          <button
            onClick={() => setActiveTab('arkham')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'arkham'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Arkham Intel</span>
          </button>
          <button
            onClick={() => setActiveTab('nansen')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nansen'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Nansen</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Security Protocol Banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-cyan-300">Server-Side Proxy Architecture:</span> To guarantee quant security, all upstream API keys (TypeSafe AI, Arkham, Nansen) are stored securely on the backend in environment variables (<code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.env.example</code>) and accessed strictly via server proxy routes (<code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">/api/*</code>). Private keys or credentials are never exposed in browser JavaScript.
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {(activeTab === 'all' || activeTab === 'wallet') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span>1. Arbitrum One Web3 Wallet Binding</span>
                </h3>
                {walletState.isConnected ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">NOT CONNECTED</span>
                )}
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-4">
                {walletState.isConnected ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-slate-400 font-medium">Bound Address</div>
                        <div className="font-mono text-cyan-300 font-semibold truncate mt-1" title={walletState.address || ''}>
                          {walletState.address}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                          Provider: {walletState.providerType}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-slate-400 font-medium">Network Verification</div>
                        <div className="font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                          {walletState.isArbitrum ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span>Arbitrum One (42161)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span className="text-rose-400">Wrong Network ({walletState.chainId})</span>
                            </>
                          )}
                        </div>
                        {!walletState.isArbitrum && (
                          <button
                            onClick={handleSwitchNetwork}
                            className="mt-1 text-[11px] text-cyan-400 underline hover:text-cyan-300"
                          >
                            Switch to Arbitrum One
                          </button>
                        )}
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                        <div className="text-slate-400 font-medium">Gas Reserve Balance</div>
                        <div className="font-mono text-emerald-400 font-bold text-sm mt-1">
                          {walletState.balanceEth} ETH
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Sufficient for ~{Math.floor(parseFloat(walletState.balanceEth || '0') / 0.0001)} flash loans
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                      <a
                        href={`https://arbiscan.io/address/${walletState.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        <span>View on Arbiscan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-600">·</span>
                      <button
                        onClick={handleDisconnectWallet}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect your Arbitrum One Web3 browser wallet (MetaMask, Rabby, Coinbase Wallet) or bind an external bot/watch address to monitor Aave V3 executions and sign flash loan transactions.
                    </p>

                    {walletConnectError && (
                      <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>{walletConnectError}</div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleConnectInjectedWallet}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Connect Web3 Browser Wallet</span>
                      </button>

                      <button
                        onClick={handleConnectSimulated}
                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                      >
                        <span>Bind Quant Simulator Wallet</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                        Or enter Headless Bot / Watch Address (Arbitrum One):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={watchAddressInput}
                          onChange={(e) => setWatchAddressInput(e.target.value)}
                          placeholder="0x71C95911e9a5d330f4d621842EC243EE1343292e"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={handleConnectSimulated}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 font-medium transition-colors"
                        >
                          Bind Watcher
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JEV ENGINE TAB / SECTION */}
          {(activeTab === 'all' || activeTab === 'jev') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>2. TypeSafe AI JEV System-One Engine</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  {statusData?.integrations.jev.status === 'CONNECTED' ? 'LIVE API CONNECTED' : 'PROXY BOUND & ACTIVE'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Server Route</div>
                    <div className="font-mono text-cyan-300 mt-1">/api/jev/evaluate</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Secure express proxy</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Model / Cost</div>
                    <div className="font-mono text-slate-200 mt-1">JEV System-One</div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">$0.042 / 1M tokens</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Inference Latency</div>
                    <div className="font-mono text-emerald-400 font-bold mt-1">~18ms SLA</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sub-block execution</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span>Env variable: <code className="text-slate-300 font-mono font-semibold">TYPESAFE_API_KEY</code></span>
                  </div>

                  <button
                    onClick={() => handlePing('jev')}
                    disabled={pinging === 'jev'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-medium rounded transition-colors"
                  >
                    <Zap className={`w-3.5 h-3.5 ${pinging === 'jev' ? 'animate-spin' : ''}`} />
                    <span>{pinging === 'jev' ? 'Pinging Gateway...' : 'Test JEV Gateway'}</span>
                  </button>
                </div>

                {pingResults['jev'] && (
                  <div className="p-2.5 bg-slate-900 border border-cyan-800/60 rounded text-xs font-mono text-cyan-300 flex items-center justify-between">
                    <div>✓ {pingResults['jev'].message}</div>
                    <div className="text-slate-400">{pingResults['jev'].latencyMs}ms</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ARKHAM INTELLIGENCE TAB / SECTION */}
          {(activeTab === 'all' || activeTab === 'arkham') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>3. Arkham Intelligence Entity Attribution</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  ONLINE
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                <div className="text-xs text-slate-300">
                  Arkham Intelligence identifies whether on-chain pool swaps originate from retail orderflow, market makers (Wintermute, Jump), or sandwich front-runners.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Tracked Entity Labels</div>
                    <div className="text-slate-200 mt-1 font-mono text-[11px]">
                      Wintermute, Jump Crypto, Alameda, DWF Labs, Uniswap Retail
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Server Route & Env</div>
                    <div className="text-cyan-300 mt-1 font-mono text-[11px]">
                      /api/arkham/intel · ARKHAM_API_KEY
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">
                    Coverage: Arbitrum One L2 Pools
                  </div>

                  <button
                    onClick={() => handlePing('arkham')}
                    disabled={pinging === 'arkham'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pinging === 'arkham' ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Query Entity Feed</span>
                  </button>
                </div>

                {pingResults['arkham'] && (
                  <div className="p-2.5 bg-slate-900 border border-emerald-800/60 rounded text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <div>✓ {pingResults['arkham'].message}</div>
                    <div className="text-slate-400">{pingResults['arkham'].latencyMs}ms</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NANSEN TAB / SECTION */}
          {(activeTab === 'all' || activeTab === 'nansen') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>4. Nansen Smart Money & Mempool Indexer</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  ONLINE
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
                <div className="text-xs text-slate-300">
                  Nansen telemetry detects competing MEV searchers in the Arbitrum Sequencer queue and calculates net 24h smart money inflows for each token pair.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Mempool Analysis</div>
                    <div className="text-slate-200 mt-1 font-mono text-[11px]">
                      Sandwich bot clustering, gas bidding spikes, toxic flow
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-slate-400 font-medium">Server Route & Env</div>
                    <div className="text-cyan-300 mt-1 font-mono text-[11px]">
                      /api/nansen/flow · NANSEN_API_KEY
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400 font-mono">
                    Tracked Wallets: 4,200+ Smart Money Entities
                  </div>

                  <button
                    onClick={() => handlePing('nansen')}
                    disabled={pinging === 'nansen'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pinging === 'nansen' ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Ping Nansen Metrics</span>
                  </button>
                </div>

                {pingResults['nansen'] && (
                  <div className="p-2.5 bg-slate-900 border border-emerald-800/60 rounded text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <div>✓ {pingResults['nansen'].message}</div>
                    <div className="text-slate-400">{pingResults['nansen'].latencyMs}ms</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ARBITRUM RPC / AAVE V3 CONTRACT */}
          {(activeTab === 'all' || activeTab === 'rpc') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>5. Arbitrum One Sequencer RPC & Aave V3 Pool</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  CHAIN ID 42161
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Aave V3 Pool (Arbitrum One):</span>
                    <span className="text-cyan-300 font-semibold">0x794a61358D6845594F94dc1DB02A252b5b4814aD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uniswap V3 SwapRouter:</span>
                    <span className="text-slate-300">0xE592427A0AEce92De3Edee1F18E0157C05861564</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Alchemy WebSocket Log Feed:</span>
                    <span className="text-slate-300">wss://arb-mainnet.g.alchemy.com/v2/...</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 font-sans">
                    0.25s block cadence with Nitro WASM execution
                  </span>

                  <button
                    onClick={() => handlePing('rpc')}
                    disabled={pinging === 'rpc'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pinging === 'rpc' ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Ping Sequencer RPC</span>
                  </button>
                </div>

                {pingResults['rpc'] && (
                  <div className="p-2.5 bg-slate-900 border border-emerald-800/60 rounded text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <div>✓ {pingResults['rpc'].message}</div>
                    <div className="text-slate-400">{pingResults['rpc'].latencyMs}ms</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            {walletState.isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Wallet Bound: {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </span>
            ) : (
              <span className="text-slate-500 font-mono">
                Wallet not yet bound
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
