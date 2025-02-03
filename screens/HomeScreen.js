import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed


export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [menuVisible, setMenuVisible] = useState(false); // Toggle for menu visibility
  const categories = Array.from(new Set(tasks.map((task) => task.category))); // Extract unique categories

  useEffect(() => {
    if (sortOption === 'progress') {
      setTasks(prevTasks => [...prevTasks].sort((a, b) => b.progress - a.progress));
    }
  }, [sortOption]); // Only runs when sortOption changes
  
  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  //test


  const toggleSubtask = (taskIndex, subtaskIndex) => {
  
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map((subtask, index) =>
          index === subtaskIndex && task === prevTasks[taskIndex]
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        )
      }));
  
      // Recalculate progress for each task
      updatedTasks.forEach(task => {
        const completedSubtasks = task.subtasks.filter(sub => sub.completed).length;
        task.progress = completedSubtasks / (task.subtasks.length || 1);
      });
  
      // Apply sorting only if sorting by progress
      if (sortOption === 'progress') {
        return [...updatedTasks].sort((a, b) => b.progress - a.progress);
      }
  
      return updatedTasks;
    });
  };
  


  const sortTasks = (option) => {
    let sortedTasks = [...tasks];
  
    if (option === 'priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (option === 'dueDate') {
      sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (option === 'progress') {
      // Compute progress dynamically and sort based on it
      sortedTasks = sortedTasks.map(task => {
        const completedSubtasks = task.subtasks.filter(sub => sub.completed).length;
        const progress = completedSubtasks / task.subtasks.length || 0;
        return { ...task, progress }; // Add progress temporarily for sorting
      });
  
      sortedTasks.sort((a, b) => b.progress - a.progress);
    }
  
    setTasks(sortedTasks);
    setSortOption(option);
  };
  

  const filteredTasks = filterCategory
    ? tasks.filter((task) => task.category === filterCategory)
    : tasks;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="filter" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Sort & Filter Menu */}
      {menuVisible && (
        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Sort By:</Text>
          <Picker
            selectedValue={sortOption}
            onValueChange={(value) => {
              sortTasks(value);
              setMenuVisible(false); // Close menu after selection
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
              setMenuVisible(false); // Close menu after selection
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

          return (
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.details}>Due Date: {item.dueDate}</Text>
              <Text style={styles.details}>Priority: {item.priority}</Text>
              <Text style={styles.details}>Category: {item.category}</Text>
              <View style={styles.progressContainer}>
                <Progress.Bar progress={progress} width={200} />
                <Text style={styles.percentage}>{percentage}%</Text>
              </View>
              {item.subtasks.map((sub, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  onPress={() => toggleSubtask(index, subIndex)}
                  style={[
                    styles.subtask,
                    sub.completed ? styles.completedSubtask : null,
                  ]}
                >
                  <Text>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={<Text>No tasks yet. Add one!</Text>}
  
      />
      
      <Button
        title="Add Task"
        onPress={() => navigation.navigate('Add Task', { addTask })}
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
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  menuContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  menuLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  picker: { height: 50, width: '100%' },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  details: { fontSize: 14, marginTop: 4 },
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
