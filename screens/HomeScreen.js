import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 

// Import task functions from utils
import { toggleSubtask, sortTasks, filterTasksByCategory } from '../utils/taskUtils';

export default function HomeScreen({ tasks = [], setTasks }) {
  const [sortOption, setSortOption] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // "detailed" or "simplified"
  const [expandedTasks, setExpandedTasks] = useState({}); // ✅ Track expanded tasks
  const navigation = useNavigation();

  useEffect(() => {
    if (sortOption === 'progress') {
      sortTasks(tasks, setTasks, 'progress');
    }
  }, [sortOption]);

  console.log('before categories');
  const categories = Array.from(new Set(tasks.map((task) => task.category)));
  console.log(categories);
  const filteredTasks = filterTasksByCategory(tasks, filterCategory);

  const toggleTaskExpansion = (index) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [index]: !prev[index], // ✅ Toggle expansion state only for the tapped task
    }));
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.title === updatedTask.title ? updatedTask : task))
    );
  };

  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerButtons}>
          {/* View Toggle Button */}
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'detailed' ? 'simplified' : 'detailed')}>
            <Ionicons name={viewMode === 'detailed' ? 'list' : 'eye'} size={28} color="black" />
          </TouchableOpacity>

          {/* Filter Toggle Button */}
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="filter" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort & Filter Menu */}
      {menuVisible && (
        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Sort By:</Text>
          <Picker
            selectedValue={sortOption}
            onValueChange={(value) => {
              sortTasks(tasks, setTasks, value);
              setSortOption(value);
              setMenuVisible(false);
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select an option" value="" />
            <Picker.Item label="Priority" value="priority" />
            <Picker.Item label="Due Date" value="dueDate" />
            <Picker.Item label="Progress" value="progress" />
          </Picker>

          <Text style={styles.menuLabel}>Filter By Category:</Text>
          <Picker
            selectedValue={filterCategory}
            onValueChange={(value) => {
              setFilterCategory(value);
              setMenuVisible(false);
            }}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const completedSubtasks = item.subtasks.filter((sub) => sub.completed).length;
          const progress = completedSubtasks / item.subtasks.length;
          const percentage = Math.round(progress * 100);
          const isExpanded = expandedTasks[index] || viewMode === 'detailed'; // ✅ Keep expanded only for the clicked task

          return (
            <TouchableOpacity onPress={() => toggleTaskExpansion(index)} activeOpacity={0.7}>
              <View style={[styles.taskCard, item.completed && styles.completedTask]}>
                {/* Task Title & Edit Button */}
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Edit Task', {
                          taskToEdit: item,
                          updateTask: (updatedTask) => {
                            // Update the task in the global state
                            setTasks((prevTasks) =>
                              prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
                            );
                          },
                          categories: categories });
                      }}
                    >
                      <Ionicons name="create-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* ✅ Expand task details only when clicked */}
                {isExpanded && (
                  <>
                    <Text style={styles.details}>Due Date: {item.dueDate}</Text>
                    <Text style={styles.details}>Priority: {item.priority}</Text>
                    <Text style={styles.details}>Category: {item.category}</Text>

                    {item.completed ? <Text style={styles.completedLabel}>✔ Completed</Text> : null}

                    <View style={styles.progressContainer}>
                      <Progress.Bar progress={progress} width={200} />
                      <Text style={styles.percentage}>{percentage}%</Text>
                    </View>

                    {item.subtasks.map((sub, subIndex) => (
                      <TouchableOpacity
                        key={subIndex}
                        onPress={(e) => {
                          e.stopPropagation(); // ✅ Prevents expanding all tasks
                          toggleSubtask(tasks, setTasks, setExpandedTasks, index, subIndex, sortOption);
                        }}
                        style={[styles.subtask, sub.completed ? styles.completedSubtask : null]}
                      >
                        <Text>{sub.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>No tasks yet. Add one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  menuContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedTask: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  details: { fontSize: 14, marginTop: 4 },
  completedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  percentage: { marginLeft: 8, fontSize: 16, fontWeight: 'bold' },
  subtask: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  completedSubtask: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
});
