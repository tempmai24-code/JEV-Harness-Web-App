import React, { useState } from 'react';
import { 
  JevQuestionDefinition, 
  JevEvaluationResponse, 
  ArbitrageOpportunity 
} from '../types/arbitrage';
import { 
  SCENARIO_PRESETS, 
  STANDARD_JEV_QUESTIONS, 
  JEV_COST_PER_MILLION_INPUT_TOKENS 
} from '../data/mockData';
import { JevEngineService } from '../services/jevEngine';
import { 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  Settings2, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface JevPlaygroundProps {
  initialOpp?: ArbitrageOpportunity | null;
}

export const JevPlayground: React.FC<JevPlaygroundProps> = ({ initialOpp }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SCENARIO_PRESETS[0].id);
  const [customState, setCustomState] = useState<string>(SCENARIO_PRESETS[0].rawState);
  const [questions, setQuestions] = useState<JevQuestionDefinition[]>(STANDARD_JEV_QUESTIONS);
  
  // Guard thresholds
  const [revertThreshold, setRevertThreshold] = useState<number>(12); // 12%
  const [minSafetyScore, setMinSafetyScore] = useState<number>(4.0);   // 4.0/5.0
  
  // Execution state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<JevEvaluationResponse | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'json' | 'code'>('visual');

  // Load preset
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = SCENARIO_PRESETS.find((s) => s.id === presetId);
    if (p) {
      setCustomState(p.rawState);
    }
  };

  // Run JEV evaluation
  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const response = await JevEngineService.evaluate({
        model: 'jev-latest',
        state: customState,
        questions,
        revertThreshold: revertThreshold / 100,
        minSafetyScore
      });
      setEvalResult(response);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Initial evaluation on mount if empty
  React.useEffect(() => {
    if (!evalResult) {
      handleRunEvaluation();
    }
  }, []);

  const generatedJsonPayload = {
    model: 'jev-latest',
    state: customState,
    questions: questions.reduce((acc, q) => {
      const item: any = {
        type: q.type,
        instructions: q.instructions
      };
      if (q.type === 'choice' && q.options) {
        item.options = q.options;
      }
      if (q.type === 'score') {
        item.scale = [q.scaleMin || 1, q.scaleMax || 5];
      }
      acc[q.id] = item;
      return acc;
    }, {} as Record<string, any>)
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>TypeSafe AI JEV System-One Decision Engine</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Non-Autoregressive
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              JEV does not generate conversational text tokens. It evaluates unstructured on-chain state and outputs strictly typed probabilistic classifications in sub-200ms at $0.042 per million input tokens with zero output token fees.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isEvaluating ? 'Evaluating (<180ms)...' : 'Classify with JEV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Evaluation Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Selector, State Editor, Question Primitives, Thresholds */}
        <div className="lg:col-span-6 space-y-4">
          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Arbitrage State Scenarios</span>
              <span className="text-[11px] text-slate-500 font-mono">From conversation blueprints</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-2.5 text-left rounded border transition-colors ${
                    selectedPresetId === preset.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <span>{preset.tokenPair}</span>
                    <span>·</span>
                    <span className={preset.expectedVerdict === 'PROCEED' ? 'text-emerald-400' : 'text-amber-400'}>
                      {preset.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* State Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Unstructured State Payload (<code className="text-cyan-400">state</code>)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {customState.length} chars · ~{Math.ceil(customState.length / 3.8)} tokens
              </span>
            </div>
            <textarea
              value={customState}
              onChange={(e) => setCustomState(e.target.value)}
              rows={6}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
              placeholder="Enter on-chain state, Nansen metrics, Arkham alerts, and spread math..."
            />
          </div>

          {/* The 3 Primitives Definitions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>The 3 JEV Question Primitives</span>
                <span className="text-[10px] text-cyan-400 font-mono">(noul, choice, score)</span>
              </label>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-white text-[11px]">{q.id}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      q.type === 'noul' 
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : q.type === 'choice'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {q.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{q.instructions}</p>
                  {q.type === 'choice' && q.options && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Options: [{q.options.map(o => `"${o}"`).join(', ')}]
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decision Guard Thresholds */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deterministic Harness Guard Thresholds</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Python middleware rules</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Max Revert Risk:</span>
                  <span className="font-mono font-semibold text-white">{revertThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={revertThreshold}
                  onChange={(e) => setRevertThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Min Block Safety:</span>
                  <span className="font-mono font-semibold text-white">{minSafetyScore.toFixed(1)} / 5.0</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={4.8}
                  step={0.1}
                  value={minSafetyScore}
                  onChange={(e) => setMinSafetyScore(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results, Probability Bars & Payloads */}
        <div className="lg:col-span-6 space-y-4">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Probabilistic Report
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'json'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw JSON Payload
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'code'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Harness Middleware Code
              </button>
            </div>

            {evalResult && (
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">{evalResult.latencyMs} ms</span>
                <span>·</span>
                <span>${evalResult.costUsd.toFixed(6)}</span>
              </div>
            )}
          </div>

          {/* Tab 1: Visual Probabilistic Report */}
          {viewMode === 'visual' && evalResult && (
            <div className="space-y-4">
              {/* Decision Verdict Banner */}
              <div
                className={`p-4 rounded-lg border ${
                  evalResult.decision.passed
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {evalResult.decision.passed ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-bold tracking-tight">
                      {evalResult.decision.passed
                        ? 'CLEARANCE GRANTED · SAFE TO EXECUTE'
                        : `HALTED BY JEV FIREWALL · ${evalResult.decision.verdict}`}
                    </div>
                    <ul className="text-xs mt-1.5 space-y-1 list-disc list-inside text-slate-300">
                      {evalResult.decision.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exact Probability Cards for Each Question */}
              <div className="space-y-3">
                {Object.entries(evalResult.results).map(([qId, qRes]) => {
                  const def = questions.find((q) => q.id === qId);
                  return (
                    <div key={qId} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{qId}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Primitive: {qRes.type}
                        </span>
                      </div>

                      {/* NOUL (Boolean) visualization */}
                      {qRes.type === 'noul' && qRes.noul && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300">
                              true:{' '}
                              <strong className={qRes.noul.true > 0.12 ? 'text-rose-400' : 'text-emerald-400'}>
                                {(qRes.noul.true * 100).toFixed(1)}%
                              </strong>
                            </span>
                            <span className="text-slate-400">
                              false: {(qRes.noul.false * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full ${qRes.noul.true > 0.12 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${qRes.noul.true * 100}%` }}
                            ></div>
                            <div
                              className="h-full bg-slate-800"
                              style={{ width: `${qRes.noul.false * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* CHOICE (Categorical) visualization */}
                      {qRes.type === 'choice' && qRes.choice && (
                        <div className="space-y-2">
                          <div className="text-xs text-slate-300">
                            Selected:{' '}
                            <span className="font-mono font-bold text-cyan-400">
                              {qRes.choice.selected}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(qRes.choice.probabilities).map(([opt, prob]) => (
                              <div key={opt} className="space-y-0.5">
                                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                  <span>{opt}</span>
                                  <span>{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${opt === 'highly_profitable' ? 'bg-cyan-500' : 'bg-amber-500'}`}
                                    style={{ width: `${prob * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SCORE (Numerical) visualization */}
                      {qRes.type === 'score' && qRes.score && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300">
                              Score:{' '}
                              <strong className="text-white text-sm">
                                {qRes.score.value.toFixed(2)} / 5.0
                              </strong>
                            </span>
                            <span className="text-slate-400">
                              {qRes.score.value >= minSafetyScore ? (
                                <span className="text-emerald-400 font-semibold">✓ Meets Threshold ({minSafetyScore})</span>
                              ) : (
                                <span className="text-rose-400 font-semibold">✗ Below Min ({minSafetyScore})</span>
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${qRes.score.value >= minSafetyScore ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${(qRes.score.value / 5.0) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Economic Advantage Box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1 font-mono text-slate-400">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>Economic Efficiency vs Standard LLM:</span>
                  <span className="text-cyan-400">~200x Faster · 400x Cheaper</span>
                </div>
                <div>Tokens Used: {evalResult.tokensUsed.input} input · 0 output (Zero text generation overhead)</div>
                <div>Cost for this check: ${evalResult.costUsd.toFixed(6)} (Only $0.042 per 1M tokens)</div>
              </div>
            </div>
          )}

          {/* Tab 2: Raw JSON Payload */}
          {viewMode === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Exact JEV API Request Payload</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(generatedJsonPayload, null, 2))}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px]">
                {JSON.stringify(generatedJsonPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Tab 3: Python Harness Middleware Code */}
          {viewMode === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Python Middleware Hook (<code className="text-cyan-400">typesafe</code>)</span>
                <button
                  onClick={() => copyToClipboard(`import os
from typesafe import TypeSafeClient

jev = TypeSafeClient(api_key=os.environ["JEV_API_KEY"])

def evaluate_and_fire_loan(arbitrage_state):
    # Query Jev's System One endpoint 
    response = jev.classify(
        model="jev-latest",
        state=arbitrage_state,
        questions=flash_loan_questions
    )
    
    revert_probability = response.will_aave_callback_revert["true"]
    economic_outlook = response.profit_margin_viability["choice"]
    safety = response.block_safety_score["score"]
    
    if revert_probability > ${revertThreshold / 100} or safety < ${minSafetyScore}:
        print(f"❌ Aborted: High revert/MEV risk ({revert_probability*100}%). Skipping contract call.")
        return False
        
    if economic_outlook == "fee_exhausted_negative":
        print("❌ Aborted: Aave 0.05% fee and gas exceeds margin.")
        return False

    # Safe Path -> Trigger Smart Contract on Arbitrum
    print(f"🚀 Jev Approved ({safety}/5). Firing atomic flash loan contract.")
    execute_on_chain_flash_loan(arbitrage_state)
    return True`)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px]">
{`import os
from typesafe import TypeSafeClient

jev = TypeSafeClient(api_key=os.environ["JEV_API_KEY"])

def evaluate_and_fire_loan(arbitrage_state):
    # Query Jev's System One endpoint (<200ms)
    response = jev.classify(
        model="jev-latest",
        state=arbitrage_state,
        questions=flash_loan_questions
    )
    
    # Extract calibrated decision boundaries
    revert_probability = response.will_aave_callback_revert["true"]
    economic_outlook = response.profit_margin_viability["choice"]
    safety = response.block_safety_score["score"]
    
    # 1. Gate for toxic MEV / Revert risk
    if revert_probability > ${revertThreshold / 100} or safety < ${minSafetyScore}:
        print(f"❌ Aborted: High revert risk ({revert_probability*100}%). Saved gas.")
        return False
        
    # 2. Gate for fee exhaustion
    if economic_outlook == "fee_exhausted_negative":
        print("❌ Aborted: Margin squeezed by Aave 0.05% fee.")
        return False

    # 3. Safe Path -> Trigger Aave V3 Flash Loan
    print(f"🚀 Jev Approved ({safety}/5). Submitting to Arbitrum FCFS Sequencer.")
    execute_on_chain_flash_loan(arbitrage_state)
    return True`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
