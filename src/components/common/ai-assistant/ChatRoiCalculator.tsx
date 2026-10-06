import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, ShieldCheck, Cpu, DollarSign, CheckCircle2 } from 'lucide-react';

interface ChatRoiCalculatorProps {
  onApplyToInquiry?: (summary: string) => void;
  onOpenLeadForm?: () => void;
  initialData?: any;
}

export const ChatRoiCalculator: React.FC<ChatRoiCalculatorProps> = ({
  onApplyToInquiry,
  onOpenLeadForm,
}) => {
  const [calculatorType, setCalculatorType] = useState<'quantTrading' | 'enterpriseAi'>('quantTrading');

  // Quant Trading State
  const [capitalAum, setCapitalAum] = useState<number>(500000);
  const [monthlyVolumeLots, setMonthlyVolumeLots] = useState<number>(120);
  const [drawdownTarget, setDrawdownTarget] = useState<number>(4);
  const [currentExecutionLatencyMs, setCurrentExecutionLatencyMs] = useState<number>(45);

  // Enterprise AI State
  const [monthlyTokensMillions, setMonthlyTokensMillions] = useState<number>(80);
  const [humanReviewers, setHumanReviewers] = useState<number>(6);
  const [currentModelCostPerMonth, setCurrentModelCostPerMonth] = useState<number>(4500);

  // Quant Calculations
  const estimatedAlphaYieldBps = Math.min(320, Math.round(180 + (45 - 1.8) * 2.2));
  const estimatedMonthlyAlphaGain = Math.round((capitalAum * (estimatedAlphaYieldBps / 10000)));
  const drawdownRiskSaved = Math.round(capitalAum * (drawdownTarget / 100) * 0.75);
  const executionSpeedupFactor = (currentExecutionLatencyMs / 1.8).toFixed(1);

  // Enterprise AI Calculations
  const estimatedTokenSavingsPercent = 42; // Via prompt caching & 9xen Flash / Omni routing
  const humanHoursSavedPerMonth = Math.round(humanReviewers * 160 * 0.65);
  const humanLaborCostSaved = Math.round(humanHoursSavedPerMonth * 48); // $48/hr avg
  const computeCostSaved = Math.round(currentModelCostPerMonth * (estimatedTokenSavingsPercent / 100));
  const totalMonthlySavings = humanLaborCostSaved + computeCostSaved;

  const handleApplyQuant = () => {
    const summary = `[Quant Architecture ROI Estimate] Capital AUM: $${capitalAum.toLocaleString()}, Monthly Volume: ${monthlyVolumeLots} lots, Target Drawdown: ${drawdownTarget}%, Latency: ${currentExecutionLatencyMs}ms -> 1.8ms (Speedup: ${executionSpeedupFactor}x). Estimated Monthly Alpha Boost: +$${estimatedMonthlyAlphaGain.toLocaleString()} / Drawdown Risk Mitigated: $${drawdownRiskSaved.toLocaleString()}.`;
    onApplyToInquiry(summary);
  };

  const handleApplyEnterprise = () => {
    const summary = `[Enterprise AI Architecture Estimate] Monthly Volume: ${monthlyTokensMillions}M tokens, ${humanReviewers} reviewers. Estimated Monthly Net Savings: $${totalMonthlySavings.toLocaleString()} (Labor Hours Saved: ${humanHoursSavedPerMonth} hrs/mo, Compute Optimization: ${estimatedTokenSavingsPercent}%).`;
    onApplyToInquiry(summary);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Info */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/20 text-cyan-200 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Institutional Architecture & ROI Sizing</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono">
            DUCKDB BENCHMARKS
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Simulate expected alpha gains, latency improvements, and labor savings based on 9xen proprietary benchmarks.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setCalculatorType('quantTrading')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            calculatorType === 'quantTrading'
              ? 'bg-cyan-500 text-black shadow'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Quant Trading Bot (AlphaBot)</span>
        </button>
        <button
          onClick={() => setCalculatorType('enterpriseAi')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            calculatorType === 'enterpriseAi'
              ? 'bg-purple-500 text-white shadow'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Enterprise AI & Agentic Core</span>
        </button>
      </div>

      {/* CALCULATOR 1: Quant Trading */}
      {calculatorType === 'quantTrading' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Deployed Capital / AUM:</span>
                <span className="text-cyan-300 font-mono font-bold">${capitalAum.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={capitalAum}
                onChange={(e) => setCapitalAum(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-white/30 font-mono">
                <span>$50k (Prop Challenge)</span>
                <span>$10M+ (Fund)</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Current Execution Latency:</span>
                <span className="text-amber-300 font-mono font-bold">{currentExecutionLatencyMs} ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="1"
                value={currentExecutionLatencyMs}
                onChange={(e) => setCurrentExecutionLatencyMs(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-white/30 font-mono">
                <span>5ms (Fast)</span>
                <span>120ms (Cloud retail)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Prop Firm / Fund Max Daily Drawdown Limit:</span>
              <span className="text-emerald-400 font-mono font-bold">{drawdownTarget}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={drawdownTarget}
              onChange={(e) => setDrawdownTarget(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-white/30 font-mono">
              <span>2% (Ultra-Safe)</span>
              <span>10% (FTMO Standard)</span>
            </div>
          </div>

          {/* Results Metric Grid */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulated Monthly Performance Impact</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Latency Boost</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">{executionSpeedupFactor}x faster</div>
                <div className="text-[9px] text-white/40 font-mono">&lt;1.8ms FIX Engine</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Alpha Boost Est.</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">+${estimatedMonthlyAlphaGain.toLocaleString()}</div>
                <div className="text-[9px] text-white/40 font-mono">~{estimatedAlphaYieldBps} bps / mo</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Drawdown Shield</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">${drawdownRiskSaved.toLocaleString()}</div>
                <div className="text-[9px] text-white/40 font-mono">Risk Mitigated</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleApplyQuant}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>Inject Simulation into Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenLeadForm}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <span>Schedule Trial Call</span>
            </button>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: Enterprise AI & Agentic Core */}
      {calculatorType === 'enterpriseAi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Monthly Tokens Processed:</span>
                <span className="text-purple-300 font-mono font-bold">{monthlyTokensMillions}M tokens</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={monthlyTokensMillions}
                onChange={(e) => setMonthlyTokensMillions(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-white/30 font-mono">
                <span>10M</span>
                <span>500M+ (Enterprise)</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Compliance/Audit Team Size:</span>
                <span className="text-cyan-300 font-mono font-bold">{humanReviewers} Staff</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={humanReviewers}
                onChange={(e) => setHumanReviewers(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-white/30 font-mono">
                <span>1 Analyst</span>
                <span>50+ Reviewers</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Current Monthly AI/LLM Cloud Bill:</span>
              <span className="text-emerald-400 font-mono font-bold">${currentModelCostPerMonth.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={currentModelCostPerMonth}
              onChange={(e) => setCurrentModelCostPerMonth(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Results Metric Grid */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Projected Monthly Cost & Productivity ROI</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Labor Saved</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">{humanHoursSavedPerMonth} hrs/mo</div>
                <div className="text-[9px] text-white/40 font-mono">65% Workflow Automation</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Compute Savings</div>
                <div className="text-sm font-bold text-purple-300 mt-0.5">${computeCostSaved.toLocaleString()}</div>
                <div className="text-[9px] text-white/40 font-mono">Caching & Routing</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-400">Net Monthly ROI</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">+${totalMonthlySavings.toLocaleString()}</div>
                <div className="text-[9px] text-white/40 font-mono">Labor + Compute</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleApplyEnterprise}
              className="flex-1 py-2.5 px-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>Inject ROI Model into Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenLeadForm}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <span>Schedule Architecture Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
