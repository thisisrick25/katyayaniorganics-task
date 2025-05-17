import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';

// Define the possible theme values
type Theme = 'light' | 'dark';

// Define the shape of the Theme Context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Function to switch between themes
}

// Create the Theme Context with an initial undefined value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider component to wrap the application and provide theme state
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to hold the current theme, initialized to 'light' or from localStorage
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  // Effect to load theme from localStorage on initial client-side mount
  useEffect(() => {
    // This check ensures localStorage is only accessed on the client
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        setTheme(storedTheme); // Set theme from localStorage if available
      }
      // Optional: Could also check system preference if no theme is stored:
      // else {
      //   const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      //   setTheme(prefersDark ? 'dark' : 'light');
      // }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to apply theme changes to the HTML root element and persist to localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Get the <html> element
    if (theme === 'dark') {
      root.classList.add('dark');   // Add 'dark' class for dark mode
    } else {
      root.classList.remove('dark'); // Remove 'dark' class for light mode
    }
    // Persist the current theme to localStorage if on the client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]); // Re-run this effect whenever the 'theme' state changes

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide the theme state and toggle function to children components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook 'useTheme' to easily access theme context in components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Throw an error if useTheme is used outside of a ThemeProvider
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context; // Return the theme context (theme and toggleTheme)
};