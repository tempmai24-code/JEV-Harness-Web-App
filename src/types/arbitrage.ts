/**
 * Types for TypeSafe AI JEV Flash Loan Arbitrage Harness
 */

export type JevQuestionType = 'noul' | 'choice' | 'score';

export interface JevQuestionDefinition {
  id: string;
  type: JevQuestionType;
  instructions: string;
  options?: string[]; // for 'choice'
  scaleMin?: number;  // for 'score', default 1
  scaleMax?: number;  // for 'score', default 5
}

export interface JevQuestionResult {
  type: JevQuestionType;
  noul?: { true: number; false: number };
  choice?: { selected: string; probabilities: Record<string, number> };
  score?: { value: number; normalized: number };
}

export interface JevEvaluationResponse {
  model: string;
  latencyMs: number;
  tokensUsed: { input: number; output: number };
  costUsd: number;
  results: Record<string, JevQuestionResult>;
  decision: {
    passed: boolean;
    verdict: 'PROCEED_EXECUTION' | 'ABORT_REVERT_RISK' | 'ABORT_FEE_EXHAUSTION' | 'ABORT_TOXIC_FLOW';
    reasons: string[];
    safetyScore: number;
  };
}

export interface ArbitrageOpportunity {
  id: string;
  timestamp: string;
  blockNumber: number;
  tokenPair: string;
  tokenSymbol: string;
  borrowAsset: string;
  flashLoanAmountUsd: number;
  buyExchange: string;
  buyPrice: number;
  sellExchange: string;
  sellPrice: number;
  spreadPct: number;
  grossProfitUsd: number;
  aaveFeeUsd: number;        // 0.05%
  dexSwapFeesUsd: number;    // e.g. 0.10% total
  estimatedGasUsd: number;   // Arbitrum sub-cent (~$0.02)
  netProfitUsd: number;
  network: 'Arbitrum One' | 'Ethereum Mainnet' | 'Base';
  
  // Market & Mempool Context (Arkham + Nansen)
  arkhamSignal: {
    entity: string;
    action: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    rawDescription: string;
  };
  nansenMetrics: {
    smartMoneyFlow24hUsd: number;
    mempoolBotCompetitors: number;
    poolLiquidityDepthUsd: number;
    poolLiquidityChange10mPct: number;
    baseFeeGwei: number;
  };

  // JEV Gate Status
  jevStatus: 'PENDING' | 'EVALUATING' | 'APPROVED' | 'BLOCKED';
  jevResult?: JevEvaluationResponse;
  executionStatus?: 'EXECUTED_PROFIT' | 'REVERTED_IN_BLOCK' | 'ABORTED_PREFLIGHT' | 'SKIPPED_LOW_SPREAD';
  txHash?: string;
}

export interface LatencyStep {
  name: string;
  actor: string;
  durationMs: number;
  description: string;
  category: 'senses' | 'brain' | 'muscle' | 'consensus';
}

export interface NetworkProfile {
  name: string;
  symbol: string;
  blockTimeSec: number;
  avgGasCostUsd: number;
  failedRevertCostUsd: number;
  aaveV3LiquidityUsd: string;
  mempoolArchitecture: string;
  jevSynergy: 'PERFECT' | 'GOOD' | 'POOR';
  synergyReason: string;
}
