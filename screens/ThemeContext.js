import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from storage when the provider mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Toggle and persist theme
  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Define theme-specific styles
  const themeStyles =
    theme === 'light'
      ? { 
          backgroundColor: '#fff', 
          textColor: '#000', 
          buttonBackground: '#ddd',
          subtaskBackground: '#f9f9f9',
          subtaskBorder: '#ccc',
          completedSubtaskBackground: '#d4edda',  // light green for completed subtasks
          completedSubtaskBorder: '#28a745'
        }
      : { 
          backgroundColor: '#333', 
          textColor: '#fff', 
          buttonBackground: '#555',
          subtaskBackground: '#444',
          subtaskBorder: '#666',
          completedSubtaskBackground: 'red',  // a darker green variant for dark mode
          completedSubtaskBorder: '#66bb6a'
        };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};
