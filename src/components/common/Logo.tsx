import React from 'react';
import { useCms } from '../../context/CmsContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  subtextClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
  subtextClassName = '',
}) => {
  const { cmsData } = useCms();
  const companyName = cmsData?.settings?.companyName || '9xen';
  const logoUrl = cmsData?.settings?.logoUrl || '/logo.svg';

  const sizeClasses = {
    sm: { box: 'w-7 h-7 p-1', icon: 'w-full h-full', text: 'text-lg', subtext: 'text-[9px]' },
    md: { box: 'w-10 h-10 p-1.5', icon: 'w-full h-full', text: 'text-xl', subtext: 'text-[10px]' },
    lg: { box: 'w-12 h-12 p-2', icon: 'w-full h-full', text: 'text-2xl', subtext: 'text-xs' },
    xl: { box: 'w-16 h-16 p-2.5', icon: 'w-full h-full', text: 'text-3xl', subtext: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Mark Container */}
      <div
        className={`${sizeClasses.box} relative shrink-0 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-slate-950 dark:bg-slate-950 light:bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
          <img
            src={logoUrl}
            alt={`${companyName} Logo`}
            className={`${sizeClasses.icon} object-contain transition-transform duration-300 group-hover:scale-110`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Brand Title and Tagline */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-white dark:text-white light:text-slate-900 leading-none ${sizeClasses.text} ${textClassName}`}
          >
            {companyName}
          </span>
          <span
            className={`font-semibold tracking-widest text-cyan-400 dark:text-cyan-400 light:text-cyan-600 uppercase mt-0.5 ${sizeClasses.subtext} ${subtextClassName}`}
          >
            Autonomous Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
