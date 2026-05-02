import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--bg-base', '#F0F2F7');
      root.style.setProperty('--bg-surface', '#FFFFFF');
      root.style.setProperty('--bg-elevated', '#E8ECF4');
      root.style.setProperty('--border-subtle', '#D0D8E8');
      root.style.setProperty('--border-accent', 'rgba(59,127,232,0.2)');
      root.style.setProperty('--text-primary', '#0A0D14');
      root.style.setProperty('--text-secondary', '#3A4A6B');
      root.style.setProperty('--text-muted', '#7A8BA8');
      root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.9)');
      root.setAttribute('data-theme', 'light');
    } else {
      root.style.setProperty('--bg-base', '#0A0D14');
      root.style.setProperty('--bg-surface', '#0F1520');
      root.style.setProperty('--bg-elevated', '#131C2E');
      root.style.setProperty('--border-subtle', '#1E2A3A');
      root.style.setProperty('--border-accent', 'rgba(59,127,232,0.15)');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#8A9BB5');
      root.style.setProperty('--text-muted', '#4A5B70');
      root.style.setProperty('--glass-bg', 'rgba(15,21,32,0.85)');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
