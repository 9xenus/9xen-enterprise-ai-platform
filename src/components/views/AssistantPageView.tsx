import React, { useState } from 'react';
import { ChatWidget } from '../common/ai-assistant/ChatWidget';
import { Sparkles, Bot, Layers, HelpCircle, ArrowRight, CheckCircle2, Sliders } from 'lucide-react';
import { ChatLeadForm } from '../common/ai-assistant/ChatLeadForm';
import { ChatMeetingScheduler } from '../common/ai-assistant/ChatMeetingScheduler';
import { ChatRoiCalculator } from '../common/ai-assistant/ChatRoiCalculator';
import { ChatProposalBuilder } from '../common/ai-assistant/ChatProposalBuilder';
import { ChatComparisonMatrix } from '../common/ai-assistant/ChatComparisonMatrix';
import { ChatKnowledgeNavigator } from '../common/ai-assistant/ChatKnowledgeNavigator';

export const AssistantPageView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<{ type: string; data?: any } | null>(null);

  const renderToolWorkspace = () => {
    if (!activeTool) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 text-[var(--chat-text-muted)] select-none">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--chat-text)]">
              Interactive Workspace Panel
            </h4>
            <p className="text-xs max-w-xs">
              When the AI Advisor generates interactive tools (ROI Calculator, Proposal Builder, Lead Sync, or Comparison Matrix), they will render here in full resolution.
            </p>
          </div>
          <div className="w-full pt-4 space-y-2 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--chat-text-muted)]">
              Quick Workspace Utilities
            </div>
            <button
              onClick={() => setActiveTool({ type: 'roi_calculator' })}
              className="w-full p-2.5 rounded-xl bg-[var(--chat-surface)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-xs text-[var(--chat-text)] flex items-center justify-between transition-colors"
            >
              <span>Launch ROI & Cost Savings Calculator</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            </button>
            <button
              onClick={() => setActiveTool({ type: 'comparison_matrix' })}
              className="w-full p-2.5 rounded-xl bg-[var(--chat-surface)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-xs text-[var(--chat-text)] flex items-center justify-between transition-colors"
            >
              <span>Open 9xen vs Legacy AI Comparison</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            </button>
            <button
              onClick={() => setActiveTool({ type: 'proposal_builder' })}
              className="w-full p-2.5 rounded-xl bg-[var(--chat-surface)] hover:bg-[var(--chat-surface-hover)] border border-[var(--chat-border)] text-xs text-[var(--chat-text)] flex items-center justify-between transition-colors"
            >
              <span>Build Custom Enterprise Proposal</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            </button>
          </div>
        </div>
      );
    }

    switch (activeTool.type) {
      case 'roi_calculator':
        return <ChatRoiCalculator initialData={activeTool.data} />;
      case 'comparison_matrix':
        return <ChatComparisonMatrix initialData={activeTool.data} />;
      case 'proposal_builder':
        return <ChatProposalBuilder initialData={activeTool.data} />;
      case 'lead_form':
        return <ChatLeadForm initialData={activeTool.data} />;
      case 'meeting_scheduler':
        return <ChatMeetingScheduler initialData={activeTool.data} />;
      case 'knowledge_navigator':
        return <ChatKnowledgeNavigator initialData={activeTool.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--chat-bg)] flex flex-col">
      {/* Page Sub-Header */}
      <div className="px-6 py-3 border-b border-[var(--chat-border)] bg-[var(--chat-surface)] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            9X
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--chat-text)] flex items-center space-x-2">
              <span>9xen Autonomous AI Advisor</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/20">
                Enterprise Workspace
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Full-Page Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0">
          <ChatWidget
            isFullPage={true}
            onSelectToolCard={(type, data) => setActiveTool({ type, data })}
          />
        </div>

        {/* Right Contextual Panel */}
        <div className="hidden lg:block w-96 border-l border-[var(--chat-border)] bg-[var(--chat-surface)] h-[calc(100vh-4rem)] overflow-y-auto p-4">
          {renderToolWorkspace()}
        </div>
      </div>
    </div>
  );
};
