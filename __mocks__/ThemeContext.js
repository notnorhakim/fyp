const React = require('react');

const mockThemeContextValue = {
  theme: 'light',
  toggleTheme: jest.fn(),
  themeStyles: {
    backgroundColor: '#fff',
    textColor: '#000',
    buttonBackground: '#ddd',
    subtaskBackground: '#f9f9f9',
    subtaskBorder: '#ccc',
    completedSubtaskBackground: '#d4edda',
    completedSubtaskBorder: '#28a745',
    selectedCardBackground: '#e0f7fa',
  },
};

module.exports = {
  ThemeContext: React.createContext(mockThemeContextValue),
};
