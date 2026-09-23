import { NetworkProfile, JevQuestionDefinition } from '../types/arbitrage';

export const AAVE_V3_ARBITRUM_POOL_ADDRESS = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
export const JEV_COST_PER_MILLION_INPUT_TOKENS = 0.042; // $0.042 / 1M input tokens

export const NETWORK_PROFILES: NetworkProfile[] = [
  {
    name: 'Arbitrum One',
    symbol: 'ARB',
    blockTimeSec: 0.25,
    avgGasCostUsd: 0.02,
    failedRevertCostUsd: 0.005,
    aaveV3LiquidityUsd: '$850M+ in Core Pools',
    mempoolArchitecture: 'First-Come, First-Served (FCFS) Sequencer',
    jevSynergy: 'PERFECT',
    synergyReason: '0.25s block time perfectly matches JEV <200ms evaluation. FCFS eliminates MEV sandwich gas wars.'
  },
  {
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    blockTimeSec: 12.0,
    avgGasCostUsd: 48.00,
    failedRevertCostUsd: 55.00,
    aaveV3LiquidityUsd: '$4.2B+ Multi-Billion Pools',
    mempoolArchitecture: 'Public Mempool / Flashbots MEV-Boost Auctions',
    jevSynergy: 'POOR',
    synergyReason: '12s block times are too slow for dynamic micro-arbitrage. $50+ gas wipes out margins on tight spreads.'
  },
  {
    name: 'Base Network',
    symbol: 'BASE',
    blockTimeSec: 2.0,
    avgGasCostUsd: 0.008,
    failedRevertCostUsd: 0.002,
    aaveV3LiquidityUsd: '$320M+ Retail Heavy',
    mempoolArchitecture: 'Sequencer-Driven Execution',
    jevSynergy: 'GOOD',
    synergyReason: 'Ultra-low gas fees, but 2.0s block latency is 8x slower than Arbitrum, allowing more slippage drift.'
  }
];

export const STANDARD_JEV_QUESTIONS: JevQuestionDefinition[] = [
  {
    id: 'will_aave_callback_revert',
    type: 'noul',
    instructions: 'Evaluate if competitive MEV bidding or rapid liquidity exhaustion will cause the executeOperation loop to revert before block finality.'
  },
  {
    id: 'profit_margin_viability',
    type: 'choice',
    instructions: 'Categorize the net-profit outcome after subtracting the 0.05% Aave fee and expected network gas.',
    options: ['highly_profitable', 'fee_exhausted_negative', 'revert_loss_only']
  },
  {
    id: 'block_safety_score',
    type: 'score',
    instructions: 'Rate the overall block environment safety from 1 (guaranteed front-run or sandwich attack) to 5 (clean block space execution).',
    scaleMin: 1,
    scaleMax: 5
  },
  {
    id: 'is_toxic_flow',
    type: 'noul',
    instructions: 'The state indicates a high probability of an impending rug-pull, developer dump, or directional liquidity trap.'
  }
];

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  expectedVerdict: 'PROCEED' | 'ABORT';
  tokenPair: string;
  borrowAsset: string;
  flashLoanAmountUsd: number;
  spreadPct: number;
  buyDex: string;
  sellDex: string;
  arkhamContext: {
    entity: string;
    action: string;
    description: string;
  };
  nansenContext: {
    smartMoneyFlow24hUsd: number;
    mempoolBots: number;
    poolLiquidityDrop10mPct: number;
    baseFeeGwei: number;
  };
  rawState: string;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'clean_arbitrum_alpha',
    name: 'Arbitrum Clean Sequencer Slot (Ideal Execution)',
    badge: 'High Profit / Clean Block',
    expectedVerdict: 'PROCEED',
    tokenPair: 'WETH / USDC',
    borrowAsset: 'USDC',
    flashLoanAmountUsd: 500000,
    spreadPct: 0.48,
    buyDex: 'Uniswap V3',
    sellDex: 'Camelot DEX',
    arkhamContext: {
      entity: 'Normal Retail Flow',
      action: 'Large Organic Market Order',
      description: 'Single institutional swap caused temporary 0.48% pool price dislocation. No large smart-money exits.'
    },
    nansenContext: {
      smartMoneyFlow24hUsd: 840000,
      mempoolBots: 0,
      poolLiquidityDrop10mPct: 0,
      baseFeeGwei: 0.12
    },
    rawState: `Protocol: AaveV3 on Arbitrum One. Borrow: 500,000 USDC. Aave Premium Fee: 250 USDC (0.05%).
Estimated Gross Profit: 2,400 USDC (0.48% spread between Uniswap V3 and Camelot).
Current Base Fee: 0.12 Gwei. Sequencer Latency: 18ms.
Nansen mempool tracker: Zero competing arbitrage transactions for pool hash in current 250ms batch.
Arkham entity alert: No adverse developer or market-maker liquidity withdrawals in past 60 minutes.`
  },
  {
    id: 'toxic_mev_congestion',
    name: 'MEV Bot Congestion & Sandwich Threat',
    badge: 'Frontrun Trap',
    expectedVerdict: 'ABORT',
    tokenPair: 'ARB / USDC',
    borrowAsset: 'USDC',
    flashLoanAmountUsd: 1000000,
    spreadPct: 0.62,
    buyDex: 'SushiSwap',
    sellDex: 'Uniswap V3',
    arkhamContext: {
      entity: 'Wintermute + High-Freq MEV',
      action: 'Aggressive Liquidity Withdrawal',
      description: 'Arkham entity alert: Wintermute is aggressively withdrawing liquidity from the target DEX side within this minute.'
    },
    nansenContext: {
      smartMoneyFlow24hUsd: -2400000,
      mempoolBots: 4,
      poolLiquidityDrop10mPct: 35,
      baseFeeGwei: 48.0
    },
    rawState: `Protocol: AaveV3. Borrow: 1,000,000 USDC. Aave Premium: 500 USDC. Expected Gross: 6,200 USDC.
Current base fee: 48 Gwei (spiking 300%).
Nansen mempool signals: High density of 4 competitive MEV bots actively interacting with target pool hash in the last 3 blocks.
Arkham alert: Top liquidity provider just pulled 35% of total pool depth; Wintermute actively selling inventory on target venue.`
  },
  {
    id: 'fee_exhaustion_trap',
    name: 'Fee Exhaustion Margin Trap (Tight Spread)',
    badge: 'Negative Yield',
    expectedVerdict: 'ABORT',
    tokenPair: 'WBTC / USDC',
    borrowAsset: 'USDC',
    flashLoanAmountUsd: 2000000,
    spreadPct: 0.065,
    buyDex: 'Uniswap V3',
    sellDex: 'Curve Finance',
    arkhamContext: {
      entity: 'Institutional Arbitrageurs',
      action: 'Micro-spread tightening',
      description: 'Raw spread is only 0.065%. After Aave 0.05% fee and DEX swap fees (0.05%), net profit is negative.'
    },
    nansenContext: {
      smartMoneyFlow24hUsd: 120000,
      mempoolBots: 1,
      poolLiquidityDrop10mPct: 2,
      baseFeeGwei: 24.5
    },
    rawState: `Protocol: AaveV3. Borrow: 2,000,000 USDC. Aave Fee: 1,000 USDC (0.05%).
Estimated Gross Spread: 0.065% (1,300 USDC gross revenue).
Swap fee tier: Uniswap 0.05% ($1,000 fee) + Curve 0.04% ($800 fee).
Calculated net cash flow: 1,300 - (1,000 + 1,000 + 800) = -$1,500 net loss before gas.`
  },
  {
    id: 'rug_pull_toxic_flow',
    name: 'Deployer Dump / Directional Liquidity Trap',
    badge: 'Impending Rug',
    expectedVerdict: 'ABORT',
    tokenPair: 'MEME / WETH',
    borrowAsset: 'WETH',
    flashLoanAmountUsd: 300000,
    spreadPct: 2.40,
    buyDex: 'Uniswap V3',
    sellDex: 'Arkham Spot',
    arkhamContext: {
      entity: 'Contract Deployer Wallet',
      action: 'Large Token Dump in Mempool',
      description: 'Deployer wallet is currently moving 20% of supply to DEX liquidity pool. Nansen liquidity dropped 40% in 10 mins.'
    },
    nansenContext: {
      smartMoneyFlow24hUsd: -1800000,
      mempoolBots: 6,
      poolLiquidityDrop10mPct: 40,
      baseFeeGwei: 85.0
    },
    rawState: `Arbitrage Opp: Buy $TOKEN on Uniswap V3, sell on Arkham Spot. Raw Spread: 2.4% ($7,200 profit).
Nansen Pool Data: Liquidity has dropped 40% in the last 10 mins.
Arkham Alert: Deployer wallet is currently moving large blocks of $TOKEN into the active pool.
Base gas fee is spiking by 30 gwei. Slippage estimated over 5%.`
  }
];

export const CONVERSATION_TRANSCRIPT_RAW = `# Building an Agent Harness with JEV for Aave Flash Loan Arbitrage on Arbitrum
**Original Research & Architecture Exchange**

### Core Concept: TypeSafe AI's Jev
Building an agent harness with Jev is a powerful pattern for offloading the micro-decisions in your agent loop from a heavy, expensive text-generation model to a fast, specialized decision engine. Released by TypeSafe AI, Jev is a "System One" model. It does not generate text; instead, it consumes unstructured state and outputs typed, probabilistic classifications in milliseconds.

By putting Jev inside your custom middleware or harness, you can run decision logic up to 200x faster and 400x cheaper than using a traditional autoregressive LLM ($0.042 per million input tokens, zero charge on output tokens).

---

### Key Primitives of Jev
1. **noul**: Yes/No Boolean probability distribution (e.g. \`will_aave_callback_revert\`, \`is_toxic_flow\`).
2. **choice**: Selecting a single categorical option with exact probabilities (e.g. \`profit_margin_viability\`: \`['highly_profitable', 'fee_exhausted_negative', 'revert_loss_only']\`).
3. **score**: Calibrated numerical confidence rating on a 1–5 scale (e.g. \`block_safety_score\`).

---

### The 3 Pillars of the Arbitrage Pipeline
1. **Alchemy WebSockets (The Senses)**: Persistent, low-latency connection pushing raw Arbitrum contract event logs (Uniswap V3 Swap, Curve, SushiSwap) the millisecond they occur.
2. **TypeSafe AI Jev (The Brain)**: Sub-200ms System-One decision engine that evaluates on-chain state, Nansen pool depth, and Arkham entity alerts to provide instant "Go / No-Go" gating.
3. **Python Execution Harness (The Muscle)**: Conditional guard logic that signs and broadcasts the Web3 transaction to Arbitrum's First-Come, First-Served (FCFS) sequencer.

---

### The Flash Loan Profit Equation
\`\`\`
Net Profit = Gross Arbitrage Revenue - (Aave V3 Fee [0.05%] + DEX Swap Fees + Network Gas Fees)
\`\`\`

### Why Arbitrum One Wins
- **0.25-second block time**: Matches Jev's <200ms response window.
- **FCFS Sequencer**: No public mempool bidding wars or sandwich attacks (unlike Ethereum Mainnet).
- **Sub-cent gas fees ($0.01 - $0.05)**: Even if an execution reverts, you lose fractions of a cent rather than $50+ on Ethereum Mainnet.

---

### Immutable Addresses (Arbitrum One)
- Aave V3 Pool Addresses Provider: \`0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb\`
`;
