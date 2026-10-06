import React from 'react';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { chatStrings } from './strings';

interface ChatHandoffBannerProps {
  onContactClick?: () => void;
}

export const ChatHandoffBanner: React.FC<ChatHandoffBannerProps> = ({ onContactClick }) => {
  return (
    <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-emerald-500/15 border border-cyan-500/30 shadow-md">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
          <UserCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Executive Lead Sync Active</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-full border border-emerald-500/30 font-mono font-bold">
              High Priority
            </span>
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {chatStrings.actions.humanHandoffNotice}
          </p>
          {onContactClick && (
            <button
              type="button"
              onClick={onContactClick}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <span>Direct Solutions Architecture Hotline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
