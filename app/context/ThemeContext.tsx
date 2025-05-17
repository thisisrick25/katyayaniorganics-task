import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  useEffect(() => {
     // On initial mount, try to load theme from localStorage
     // or use system preference if Tailwind is configured for it (though 'class' mode overrides this)
     const storedTheme = localStorage.getItem('theme') as Theme | null;
     if (storedTheme) {
         setTheme(storedTheme);
     } else {
         // Check system preference if no theme is stored
         const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
         setTheme(prefersDark ? 'dark' : 'light');
     }
  }, []);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist to localStorage only if window is defined (client-side)
    if (typeof window !== 'undefined') {
         localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};