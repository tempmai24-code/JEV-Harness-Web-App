import {
  JevQuestionDefinition,
  JevEvaluationResponse,
  JevQuestionResult
} from '../types/arbitrage';
import { JEV_COST_PER_MILLION_INPUT_TOKENS } from '../data/mockData';

export interface JevEvaluationOptions {
  model?: string;
  state: string;
  questions: JevQuestionDefinition[];
  revertThreshold?: number; // default 0.12 (12%)
  minSafetyScore?: number;  // default 4.0
}

export class JevEngineService {
  /**
   * Simulates TypeSafe AI JEV System-One non-autoregressive classification engine
   * with sub-200ms latency and typed probabilistic outputs.
   */
  public static async evaluate(options: JevEvaluationOptions): Promise<JevEvaluationResponse> {
    const startTime = performance.now();
    const model = options.model || 'jev-latest';
    const stateText = options.state.toLowerCase();
    const revertThreshold = options.revertThreshold ?? 0.12;
    const minSafetyScore = options.minSafetyScore ?? 4.0;

    // Simulate realistic sub-200ms JEV API network latency (typically 120ms - 190ms)
    const simulatedLatencyMs = Math.floor(110 + Math.random() * 70);
    await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));

    // Token analysis
    const estimatedInputTokens = Math.max(35, Math.ceil(options.state.length / 3.8));
    const costUsd = (estimatedInputTokens / 1_000_000) * JEV_COST_PER_MILLION_INPUT_TOKENS;

    // Analyze State Signals
    const hasMevBots = stateText.includes('mev') || stateText.includes('sandwich') || stateText.includes('competing') || stateText.includes('bots');
    const hasLiquidityDrop = stateText.includes('drop') || stateText.includes('pull') || stateText.includes('withdrawn') || stateText.includes('drained');
    const hasHighGas = stateText.includes('spiking') || stateText.includes('high base fee') || stateText.includes('85 gwei') || stateText.includes('48 gwei');
    const hasDeveloperDump = stateText.includes('dump') || stateText.includes('rug') || stateText.includes('deployer') || stateText.includes('toxic');
    const isFeeExhausted = stateText.includes('negative') || stateText.includes('tight') || stateText.includes('0.065%') || stateText.includes('0.05% fee') && stateText.includes('loss');
    const isClean = stateText.includes('clean') || stateText.includes('ideal') || (stateText.includes('0.12 gwei') && !hasMevBots && !hasLiquidityDrop);

    const results: Record<string, JevQuestionResult> = {};
    const reasons: string[] = [];

    for (const q of options.questions) {
      if (q.id === 'will_aave_callback_revert' || q.id === 'will_transaction_revert') {
        let trueProb = 0.03;
        if (hasDeveloperDump) trueProb = 0.94;
        else if (hasMevBots && hasLiquidityDrop) trueProb = 0.79;
        else if (hasMevBots || hasHighGas) trueProb = 0.42;
        else if (isFeeExhausted) trueProb = 0.22;
        else if (isClean) trueProb = 0.025;

        // Slight natural variance
        trueProb = Math.min(0.99, Math.max(0.01, trueProb + (Math.random() * 0.04 - 0.02)));
        const falseProb = Number((1 - trueProb).toFixed(4));
        trueProb = Number(trueProb.toFixed(4));

        results[q.id] = {
          type: 'noul',
          noul: { true: trueProb, false: falseProb }
        };
      } else if (q.id === 'profit_margin_viability' || q.id === 'gas_economic_viability') {
        let selected = 'highly_profitable';
        let probabilities: Record<string, number> = {
          highly_profitable: 0.88,
          fee_exhausted_negative: 0.08,
          revert_loss_only: 0.04
        };

        if (hasDeveloperDump || (hasMevBots && hasLiquidityDrop)) {
          selected = 'revert_loss_only';
          probabilities = { highly_profitable: 0.04, fee_exhausted_negative: 0.14, revert_loss_only: 0.82 };
        } else if (isFeeExhausted || (hasHighGas && !isClean)) {
          selected = 'fee_exhausted_negative';
          probabilities = { highly_profitable: 0.12, fee_exhausted_negative: 0.76, revert_loss_only: 0.12 };
        } else if (isClean) {
          selected = 'highly_profitable';
          probabilities = { highly_profitable: 0.94, fee_exhausted_negative: 0.04, revert_loss_only: 0.02 };
        }

        results[q.id] = {
          type: 'choice',
          choice: { selected, probabilities }
        };
      } else if (q.id === 'block_safety_score' || q.id === 'safety_score') {
        let score = 4.8;
        if (hasDeveloperDump) score = 1.3;
        else if (hasMevBots && hasLiquidityDrop) score = 2.1;
        else if (hasMevBots || hasHighGas) score = 3.2;
        else if (isFeeExhausted) score = 3.6;
        else if (isClean) score = 4.85;

        score = Number(Math.min(5.0, Math.max(1.0, score + (Math.random() * 0.2 - 0.1))).toFixed(2));

        results[q.id] = {
          type: 'score',
          score: { value: score, normalized: score / 5.0 }
        };
      } else if (q.id === 'is_toxic_flow' || q.id === 'is_insider_pump') {
        let trueProb = 0.01;
        if (hasDeveloperDump) trueProb = 0.96;
        else if (hasLiquidityDrop) trueProb = 0.65;
        else if (hasMevBots) trueProb = 0.35;
        else if (isClean) trueProb = 0.012;

        trueProb = Number(Math.min(0.99, Math.max(0.01, trueProb)).toFixed(4));
        results[q.id] = {
          type: 'noul',
          noul: { true: trueProb, false: Number((1 - trueProb).toFixed(4)) }
        };
      } else {
        // Generic fallback for custom questions
        if (q.type === 'noul') {
          results[q.id] = { type: 'noul', noul: { true: 0.15, false: 0.85 } };
        } else if (q.type === 'choice') {
          const opts = q.options && q.options.length ? q.options : ['option_a', 'option_b'];
          const probs: Record<string, number> = {};
          opts.forEach((opt, idx) => { probs[opt] = idx === 0 ? 0.7 : 0.3 / (opts.length - 1); });
          results[q.id] = { type: 'choice', choice: { selected: opts[0], probabilities: probs } };
        } else {
          results[q.id] = { type: 'score', score: { value: 4.2, normalized: 0.84 } };
        }
      }
    }

    // Evaluate Decision Gate Rules
    const revertRisk = results['will_aave_callback_revert']?.noul?.true ??
                      results['will_transaction_revert']?.noul?.true ?? 0.05;
    const safetyScore = results['block_safety_score']?.score?.value ??
                        results['safety_score']?.score?.value ?? 4.5;
    const economicViability = results['profit_margin_viability']?.choice?.selected ??
                              results['gas_economic_viability']?.choice?.selected ?? 'highly_profitable';
    const toxicFlow = results['is_toxic_flow']?.noul?.true ?? 0.02;

    let passed = true;
    let verdict: JevEvaluationResponse['decision']['verdict'] = 'PROCEED_EXECUTION';

    if (toxicFlow > 0.15) {
      passed = false;
      verdict = 'ABORT_TOXIC_FLOW';
      reasons.push(`Toxic flow detected: ${(toxicFlow * 100).toFixed(1)}% probability of rug-pull or directional trap.`);
    }

    if (revertRisk > revertThreshold || safetyScore < minSafetyScore) {
      passed = false;
      verdict = 'ABORT_REVERT_RISK';
      reasons.push(`Revert risk (${(revertRisk * 100).toFixed(1)}%) exceeds safety threshold (${(revertThreshold * 100).toFixed(0)}%) or safety score (${safetyScore}/5.0) is under minimum (${minSafetyScore}).`);
    }

    if (economicViability === 'fee_exhausted_negative' || economicViability === 'revert_loss_only') {
      passed = false;
      if (verdict === 'PROCEED_EXECUTION') verdict = 'ABORT_FEE_EXHAUSTION';
      reasons.push(`Net profit negative: Aave 0.05% fee, DEX swap fees, or gas eat the entire spread margin.`);
    }

    if (passed) {
      reasons.push(`Passed all JEV System-One gates: Revert risk ${(revertRisk * 100).toFixed(1)}% < ${revertThreshold * 100}%, Safety score ${safetyScore}/5.0, Economic viability: ${economicViability}.`);
    }

    const totalElapsedMs = Math.round(performance.now() - startTime);

    return {
      model,
      latencyMs: totalElapsedMs,
      tokensUsed: { input: estimatedInputTokens, output: 0 }, // JEV has 0 output tokens!
      costUsd,
      results,
      decision: {
        passed,
        verdict,
        reasons,
        safetyScore
      }
    };
  }
}
