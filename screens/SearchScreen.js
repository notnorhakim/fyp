import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SearchScreen( { tasks = [] }) {
  const route = useRoute();
  const navigation = useNavigation();
  


  useEffect(() => {
    console.log("SearchScreen tasks:", tasks);
  }, [tasks]);

  const [query, setQuery] = useState('');

  // When query is empty, return all tasks
  const filteredTasks = useMemo(() => {
    if (!query.trim()) return null;
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => task.title.toLowerCase().includes(lowerQuery));
  }, [query, tasks]);

  const renderTaskItem = ({ item }) => {
    const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
    const completedSubtasks = item.subtasks ? item.subtasks.filter(s => s.completed).length : 0;
    const completeness = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const categories = Array.from(new Set(tasks.map((task) => task.category)));

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => {
          navigation.navigate('Edit Task', {
            taskToEdit: item,
            categories: Array.from(new Set(tasks.map((task) => task.category))),
          });
        }}
               
      >
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.subtasks && item.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={styles.subtaskHeader}>Subtasks:</Text>
            {item.subtasks.map((sub, index) => (
              <Text key={index} style={styles.subtaskText}>
                {sub.completed ? '✔' : '✗'} {sub.name}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Tasks</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Enter task title..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No tasks found.</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f9f9f9' 
  },
  header: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  taskCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  taskDetails: { 
    fontSize: 14, 
    marginTop: 4 
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
    color: 'gray', 
    textAlign: 'center', 
    marginTop: 16 
  },
});
