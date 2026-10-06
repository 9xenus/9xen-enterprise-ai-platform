import React, { useState } from 'react';
import { Settings, X, Bot, Sliders, Shield, Zap } from 'lucide-react';
import { chatStrings } from './strings';

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel?: string;
  currentPersona?: string;
  onSaveSettings: (model: string, persona: string) => void;
  primaryColor?: string;
}

export const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  isOpen,
  onClose,
  currentModel = '9xen-omni-2.5',
  currentPersona = 'standard',
  onSaveSettings,
  primaryColor = '#06b6d4',
}) => {
  const [model, setModel] = useState(currentModel);
  const [persona, setPersona] = useState(currentPersona);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(model, persona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-[var(--chat-surface)] border border-[var(--chat-border)] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--chat-border)]">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-[var(--chat-text)]">
              {chatStrings.settings.modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--chat-text-muted)] hover:text-[var(--chat-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Target Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--chat-text)] flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{chatStrings.settings.modelLabel}</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs rounded-xl bg-[var(--chat-bg)] border border-[var(--chat-border)] text-[var(--chat-text)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="9xen-omni-2.5">9xen Omni 2.5 (Fast Reasoning & Multimodal)</option>
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Enterprise Direct API)</option>
              <option value="9xen-quant-pro">AlphaBot Quant Pro Engine (High Precision)</option>
              <option value="9xen-reguletter-v2">Reguletter Compliance Model (SEC Grounded)</option>
            </select>
          </div>

          {/* Persona Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--chat-text)] flex items-center space-x-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{chatStrings.settings.personaLabel}</span>
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs rounded-xl bg-[var(--chat-bg)] border border-[var(--chat-border)] text-[var(--chat-text)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="standard">Enterprise Solutions Architect (Balanced)</option>
              <option value="quant">Quant Trading & Algorithmic Specialist</option>
              <option value="compliance">RegTech & Legal Auditor</option>
              <option value="executive">Executive Boardroom Briefing Officer</option>
            </select>
          </div>

          {/* Security & RAG info */}
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-[var(--chat-text-muted)] flex items-start space-x-2">
            <Shield className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
            <span>
              All chat sessions operate under SOC-2 Type II end-to-end VPC isolation with DuckDB OLAP telemetry persistence.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--chat-border)]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs rounded-xl text-[var(--chat-text-muted)] hover:bg-[var(--chat-surface-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs rounded-xl text-white font-medium shadow-md transition-all hover:opacity-95"
            style={{ background: primaryColor }}
          >
            {chatStrings.settings.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
