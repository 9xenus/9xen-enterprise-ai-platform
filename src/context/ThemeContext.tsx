import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCms } from './CmsContext';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  primaryColor: string;
  logoUrl: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  primaryColor: '#06b6d4',
  logoUrl: '',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cmsData } = useCms();
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nexus_theme');
    return (saved as Theme) || 'dark';
  });

  const primaryColor = cmsData?.settings?.systemConfig?.primaryColor || '#06b6d4';
  const logoUrl = cmsData?.settings?.logoUrl || '';

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Parse RGB components for opacity utilities
    const hex = primaryColor.replace('#', '');
    let r = 6, g = 182, b = 212;
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
    }

    let styleEl = document.getElementById('dynamic-branding-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-branding-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      :root {
        --primary-color: ${primaryColor};
        --primary-color-rgb: ${r}, ${g}, ${b};
      }
      
      .bg-cyan-500, .bg-cyan-600 {
        background-color: ${primaryColor} !important;
      }
      .hover\\:bg-cyan-400:hover, .hover\\:bg-cyan-500:hover {
        background-color: ${primaryColor} !important;
        filter: brightness(1.1);
      }
      .text-cyan-400, .text-cyan-500, .hover\\:text-cyan-400:hover {
        color: ${primaryColor} !important;
      }
      .border-cyan-400, .border-cyan-500, .focus\\:border-cyan-500:focus {
        border-color: ${primaryColor} !important;
      }
      .from-cyan-500 {
        --tw-gradient-from: ${primaryColor} !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, ${primaryColor}00) !important;
      }
      .bg-cyan-500\\/20, .bg-cyan-500\\/10 {
        background-color: rgba(${r}, ${g}, ${b}, 0.15) !important;
      }
    `;
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor, logoUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
