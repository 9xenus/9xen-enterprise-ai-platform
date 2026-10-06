import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Download, Terminal, ShieldAlert } from 'lucide-react';

interface ErrorPageProps {
  error?: Error | null;
  errorInfo?: string | null;
  resetErrorBoundary?: () => void;
  message?: string;
  statusCode?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
  message = "An unexpected error occurred in our system process.",
  statusCode = "500_SYSTEM_ERROR",
}) => {
  useEffect(() => {
    document.title = "System Interrupted | 9xenai";
  }, []);

  const handleGoHome = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    window.location.href = '/';
  };

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      statusCode,
      errorMessage: error?.message || message,
      errorStack: error?.stack || 'No Stack Trace',
      componentStack: errorInfo || 'No Component Stack',
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `9xenai_diagnostics_${statusCode.toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-rose-500" />
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" />
              <span>Failsafe Protection Active</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              System Render Interrupted
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {message} Our multi-layered security and exception sandbox has successfully isolated this event to maintain data state integrity.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-rose-400/90 overflow-x-auto space-y-2 max-h-44 shadow-inner">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-500 text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>NEXUS_UI_FAILSAFE_DUMP ({statusCode})</span>
          </div>
          <p className="font-bold text-slate-200">Exception Context: {error?.toString() || message}</p>
          {error?.stack && (
            <pre className="whitespace-pre-wrap text-slate-500 leading-normal font-sans text-[10px]">
              {error.stack}
            </pre>
          )}
          {errorInfo && (
            <pre className="whitespace-pre-wrap text-slate-500 leading-normal font-sans text-[10px]">
              {errorInfo}
            </pre>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <button
            onClick={resetErrorBoundary || (() => window.location.reload())}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reload Component</span>
          </button>
          <button
            onClick={handleGoHome}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Core Hub</span>
          </button>
          
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 sm:col-span-1"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Diagnostic Logs</span>
          </button>
        </div>

        <div className="flex justify-center border-t border-slate-800/60 pt-4 text-[10px] text-slate-500 font-mono">
          <span>SECURE SHELL // SESSION PROTECTION ON</span>
        </div>
      </div>
    </div>
  );
};
