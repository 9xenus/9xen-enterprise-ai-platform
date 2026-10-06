import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-red-400" />
        <span className="text-slate-200 text-sm font-medium">
          You are currently offline. Some features may be unavailable.
        </span>
      </div>
    </div>
  );
}
