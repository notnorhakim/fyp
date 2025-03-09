import React, { useState, useMemo, useEffect, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from './ThemeContext';

export default function SearchScreen({ tasks = [] }) {
  const { theme, themeStyles } = useContext(ThemeContext);
  const route = useRoute();
  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: themeStyles.backgroundColor,
        ...(theme === 'dark'
          ? {
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            }
          : {}),
      },
      headerTitleStyle: { color: themeStyles.textColor },
      headerTintColor: themeStyles.textColor,
    });
  }, [navigation, themeStyles, theme]);

  useEffect(() => {
    console.log("SearchScreen tasks:", tasks);
  }, [tasks]);

  const [query, setQuery] = useState('');

  // When query is empty, return null (or you can return all tasks)
  const filteredTasks = useMemo(() => {
    if (!query.trim()) return null;
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => task.title.toLowerCase().includes(lowerQuery));
  }, [query, tasks]);

  const renderTaskItem = ({ item }) => {
    const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
    const completedSubtasks = item.subtasks ? item.subtasks.filter(s => s.completed).length : 0;
    const completeness = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const categories = Array.from(new Set(tasks.map(task => task.category)));

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          { 
            backgroundColor: themeStyles.backgroundColor, 
            borderColor: theme === 'dark' ? '#555' : '#ccc' 
          }
        ]}
        onPress={() => {
          navigation.navigate('Edit Task', {
            taskToEdit: item,
            categories: Array.from(new Set(tasks.map(task => task.category))),
          });
        }}
      >
        <Text style={[styles.taskTitle, { color: themeStyles.textColor }]}>{item.title}</Text>
        {item.subtasks && item.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={[styles.subtaskHeader, { color: themeStyles.textColor }]}>Subtasks:</Text>
            {item.subtasks.map((sub, index) => (
              <Text key={index} style={[styles.subtaskText, { color: themeStyles.textColor }]}>
                {sub.completed ? '✔' : '✗'} {sub.name}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.header, { color: themeStyles.textColor }]}>Search Tasks</Text>
      <TextInput
        style={[
          styles.searchInput,
          { 
            backgroundColor: theme === 'light' ? '#fff' : themeStyles.subtaskBackground,
            borderColor: theme === 'light' ? '#ccc' : '#fff',
            color: themeStyles.textColor,
          }
        ]}
        placeholder="Enter task title..."
        placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: themeStyles.textColor }]}>
            No tasks found.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  header: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  taskCard: { 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8, 
    borderWidth: 1,
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  subtasksContainer: { 
    marginTop: 8 
  },
  subtaskHeader: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  subtaskText: { 
    fontSize: 14, 
    marginLeft: 8, 
    marginTop: 2 
  },
  emptyMessage: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 16 
  },
});
