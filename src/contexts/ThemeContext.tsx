import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'lavender' | 'mint';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeOrder: Theme[] = ['dark', 'light', 'lavender', 'mint'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('flowly-theme') as Theme | null;
    if (stored && themeOrder.includes(stored)) return stored;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'lavender', 'mint');
    
    // Add current theme class
    root.classList.add(theme);
    
    localStorage.setItem('flowly-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const currentIndex = themeOrder.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      return themeOrder[nextIndex];
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}