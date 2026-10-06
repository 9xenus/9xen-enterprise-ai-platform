import React, { useEffect, useState } from 'react';

interface TopProgressBarProps {
  isLoading: boolean;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(20);
      const timer1 = setTimeout(() => setProgress(60), 80);
      const timer2 = setTimeout(() => setProgress(85), 200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(139,92,246,0.6)]"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
};
