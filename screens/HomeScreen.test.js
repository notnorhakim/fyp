import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { waitFor } from '@testing-library/react-native';

// ✅ Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// ✅ Mock ThemeContext (inline to avoid Jest scoping issues)
jest.mock('./ThemeContext', () => {
  const React = require('react');
  return {
    ThemeContext: React.createContext({
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
    }),
  };
});

// ✅ Mock React Navigation's useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// ✅ Mock vector icons
jest.mock('@expo/vector-icons');

// ✅ Mock taskUtils to spy on toggleSubtask
jest.mock('../utils/taskUtils', () => ({
  toggleSubtask: jest.fn(),
  sortTasks: jest.fn(),
}));

import { toggleSubtask } from '../utils/taskUtils';

const mockSetTasks = jest.fn();

// ✅ Test suite
describe('HomeScreen', () => {
  it('renders task title', () => {
    const dummyTasks = [
      {
        id: '1',
        title: 'Sample Task',
        dueDate: new Date().toISOString(),
        priority: 'High',
        category: 'Work',
        completed: false,
        subtasks: [],
      },
    ];

    const { getByText } = render(
      <HomeScreen tasks={dummyTasks} setTasks={mockSetTasks} />
    );
    expect(getByText('Sample Task')).toBeTruthy();
  });

  it('renders subtasks and calls toggleSubtask when tapped', () => {
    const dummyTasksWithSubtasks = [
      {
        id: '1',
        title: 'Task with Subtasks',
        dueDate: new Date().toISOString(),
        priority: 'Medium',
        category: 'Home',
        completed: false,
        subtasks: [
          { name: 'Subtask 1', completed: false },
          { name: 'Subtask 2', completed: true },
        ],
      },
    ];
  
    const { getByText } = render(
      <HomeScreen tasks={dummyTasksWithSubtasks} setTasks={mockSetTasks} />
    );
  
    expect(getByText('Subtask 1')).toBeTruthy();
    expect(getByText('Subtask 2')).toBeTruthy();
  
    // Provide fake event with stopPropagation to avoid error
    fireEvent(getByText('Subtask 1'), 'press', {
      stopPropagation: () => {},
    });
  
    expect(toggleSubtask).toHaveBeenCalled();
  });

  it('enters select mode and shows checkboxes', async () => {
    const dummyTasks = [
      {
        id: '1',
        title: 'Task for Select Mode',
        dueDate: new Date().toISOString(),
        priority: 'Low',
        category: 'Chores',
        completed: false,
        subtasks: [],
      },
    ];
  
    const { getByTestId, getByText } = render(
      <HomeScreen tasks={dummyTasks} setTasks={mockSetTasks} />
    );
  
    fireEvent.press(getByTestId('select-toggle'));
  
    expect(getByText('Task for Select Mode')).toBeTruthy();
  
    await waitFor(() => {
      expect(getByTestId('task-checkbox-1')).toBeTruthy();
    });
  });
  
  
  
  
});
