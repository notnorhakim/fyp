import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';


// Import task functions from utils
import { toggleSubtask, sortTasks } from '../utils/taskUtils';

export default function HomeScreen({ tasks = [], setTasks }) {
  const [sortOption, setSortOption] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState('detailed');
  const [expandedTasks, setExpandedTasks] = useState({});
  const navigation = useNavigation();
  const [taskFilter, setTaskFilter] = useState('all');

  useEffect(() => {
    if (sortOption === 'progress') {
      sortTasks(tasks, setTasks, 'progress');
    }
  }, [sortOption]);

  const categories = Array.from(new Set(tasks.map((task) => task.category)));

  const filteredTasks = tasks
    .filter((task) => (filterCategory ? task.category === filterCategory : true))
    .filter((task) => {
      if (taskFilter === 'completed') return task.completed;
      if (taskFilter === 'incomplete') return !task.completed;
      return true;
    });

  // Categorize tasks into sections
  const today = moment().startOf('day');
  const endOfWeek = moment().endOf('week');

  const tasksDueToday = filteredTasks.filter((task) => moment(task.dueDate).isSame(today, 'day'));
  const tasksDueThisWeek = filteredTasks.filter((task) =>
    moment(task.dueDate).isAfter(today, 'day') && moment(task.dueDate).isBefore(endOfWeek, 'day')
  );
  const upcomingTasks = filteredTasks.filter((task) => moment(task.dueDate).isAfter(endOfWeek, 'day'));

  const toggleTaskExpansion = (index) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.title === updatedTask.title ? updatedTask : task))
    );
  };

  const getFilterLabel = () => {
    if (taskFilter === 'completed') return 'Completed';
    if (taskFilter === 'incomplete') return 'Incomplete';
    return 'All Tasks';
  };

  const getSortLabel = () => {
    if (sortOption === 'priority') return 'Sorted by Priority';
    if (sortOption === 'dueDate') return 'Sorted by Due Date';
    if (sortOption === 'progress') return 'Sorted by Progress';
    return 'Unsorted';
  };

  const renderTaskItem = ({ item, index }) => {
    const completedSubtasks = item.subtasks.filter((sub) => sub.completed).length;
    const progress = completedSubtasks / item.subtasks.length;
    const percentage = Math.round(progress * 100);
    const isExpanded = expandedTasks[index] || viewMode === 'detailed';
  
    return (
      <TouchableOpacity onPress={() => toggleTaskExpansion(index)} activeOpacity={0.7}>
        <View style={[styles.taskCard, item.completed && styles.completedTask]}>
          {/* Edit Button at Top-Right */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              navigation.navigate('Edit Task', {
                taskToEdit: item,
                updateTask: (updatedTask) => {
                  setTasks((prevTasks) =>
                    prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
                  );
                },
                categories: categories,
              });
            }}
          >
            <Ionicons name="create-outline" size={20} color="black" />
          </TouchableOpacity>
  
          {/* Task Title */}
          <Text style={styles.taskTitle}>{item.title}</Text>
  
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
                    e.stopPropagation();
                    toggleSubtask(tasks, setTasks, setExpandedTasks, item.id, subIndex, sortOption);
                  }}
                  style={[
                    styles.subtask,
                    sub.completed ? styles.completedSubtask : null,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subtaskText}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Showing: {getFilterLabel()} - {getSortLabel()} - {filterCategory ? filterCategory : 'All Categories'}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'detailed' ? 'simplified' : 'detailed')}>
            <Ionicons name={viewMode === 'detailed' ? 'list' : 'eye'} size={28} color="black" />
          </TouchableOpacity>

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

          <Text style={styles.filterLabel}>Filter by Completion:</Text>
          <Picker
            selectedValue={taskFilter}
            onValueChange={(value) => setTaskFilter(value)}
            style={styles.picker}
          >
            <Picker.Item label="Show All" value="all" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Incomplete" value="incomplete" />
          </Picker>
        </View>
      )}

      {/* Task List or Sections */}
      <FlatList
        data={sortOption === '' ? [
          { title: 'Due Today', data: tasksDueToday },
          { title: 'This Week', data: tasksDueThisWeek },
          { title: 'Upcoming', data: upcomingTasks },
        ] : filteredTasks}
        keyExtractor={(item, index) => (sortOption === '' ? item.title + index : item.id)}
        renderItem={({ item }) => {
          if (sortOption === '') {
            return (
              <>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <FlatList
                  data={item.data}
                  keyExtractor={(task) => task.id}
                  renderItem={renderTaskItem}
                  ListEmptyComponent={<Text style={styles.emptyMessage}>No tasks in this category.</Text>}
                />
              </>
            );
          } else {
            return renderTaskItem({ item });
          }
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
    color: '#007BFF',
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
    position: 'relative', // Required for positioning the edit button
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
  percentage: { marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  subtask: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  completedSubtask: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  subtaskText: {
    fontSize: 16,
    color: '#333',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute', // Place the button in the top-right corner
    top: 8,
    right: 8,
    zIndex: 1, // Ensure the button appears above other elements
  },
});
