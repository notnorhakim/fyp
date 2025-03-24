import React, { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from './ThemeContext';

// Import task functions from utils
import { toggleSubtask, sortTasks } from '../utils/taskUtils';

export default function HomeScreen({ tasks = [], setTasks }) {
  const { theme, toggleTheme, themeStyles: globalThemeStyles } = useContext(ThemeContext);
  const navigation = useNavigation();


  const themeStyles = useMemo(() => {
    return theme === 'light'
      ? { 
          backgroundColor: '#fff', 
          textColor: '#000', 
          buttonBackground: '#ddd',
          subtaskBackground: '#f9f9f9',
          subtaskBorder: '#ccc',
          completedSubtaskBackground: '#d4edda',  // light green for completed subtasks
          completedSubtaskBorder: '#28a745',
          selectedCardBackground: '#e0f7fa' // a pale blue highlight for light mode
        }
      : { 
          backgroundColor: '#333', 
          textColor: '#fff', 
          buttonBackground: '#555',
          subtaskBackground: '#444',
          subtaskBorder: '#666',
          completedSubtaskBackground: '#2e7d32',  // darker green variant for dark mode
          completedSubtaskBorder: '#66bb6a',
          selectedCardBackground: '#555' // a lighter shade than the dark background
        };
  }, [theme]);


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

  const [sortOption, setSortOption] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState('detailed');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskFilter, setTaskFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState({}); // Track selected tasks
  const [selectMode, setSelectMode] = useState(false); // Toggle Select Mode

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedSortOption = await AsyncStorage.getItem('sortOption');
        const storedFilterCategory = await AsyncStorage.getItem('filterCategory');
        const storedTaskFilter = await AsyncStorage.getItem('taskFilter');
        const storedViewMode = await AsyncStorage.getItem('viewMode');
        const storedExpandedTasks = await AsyncStorage.getItem('expandedTasks');

        if (storedSortOption !== null) setSortOption(storedSortOption);
        if (storedFilterCategory !== null) setFilterCategory(storedFilterCategory);
        if (storedTaskFilter !== null) setTaskFilter(storedTaskFilter);
        if (storedViewMode) setViewMode(storedViewMode);
        if (storedExpandedTasks) setExpandedTasks(JSON.parse(storedExpandedTasks));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const savePreferences = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  const handleViewModeChange = async () => {
    const newMode = viewMode === 'detailed' ? 'simplified' : 'detailed';
    setViewMode(newMode);
    await AsyncStorage.setItem('viewMode', newMode);

    setExpandedTasks((prevExpanded) => {
      const newExpandedState = {};
      if (newMode === 'detailed') {
        tasks.forEach((task) => {
          newExpandedState[task.id] = true;
        });
      }
      AsyncStorage.setItem('expandedTasks', JSON.stringify(newExpandedState));
      return newExpandedState;
    });
  };

  const categories = Array.from(new Set(tasks.map((task) => task.category)));

  const filteredTasks = tasks
    .filter((task) => (filterCategory ? task.category === filterCategory : true))
    .filter((task) => {
      if (taskFilter === 'completed') return task.completed;
      if (taskFilter === 'incomplete') return !task.completed;
      return true;
    });

  const today = moment().startOf('day');
  const endOfWeek = moment().endOf('week');

  const tasksDueToday = filteredTasks.filter((task) =>
    moment(task.dueDate).isSame(today, 'day')
  );
  const tasksDueThisWeek = filteredTasks.filter((task) =>
    moment(task.dueDate).isAfter(today, 'day') &&
    moment(task.dueDate).isBefore(endOfWeek, 'day')
  );
  const upcomingTasks = filteredTasks.filter((task) =>
    moment(task.dueDate).isAfter(endOfWeek, 'day')
  );

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks((prev) => {
      const updatedExpanded = {
        ...prev,
        [taskId]: !prev[taskId],
      };
      AsyncStorage.setItem('expandedTasks', JSON.stringify(updatedExpanded));
      return updatedExpanded;
    });
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const markSelectedAsComplete = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (selectedTasks[task.id]) {
          const updatedSubtasks = task.subtasks?.map((subtask) => ({
            ...subtask,
            completed: true,
          }));
          return {
            ...task,
            completed: true,
            subtasks: updatedSubtasks,
          };
        }
        return task;
      })
    );

    setSelectedTasks({});
    setSelectMode(false);
  };

  const deleteSelectedTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => !selectedTasks[task.id])
    );
    setSelectedTasks({});
    setSelectMode(false);
  };

  const selectAllTasks = () => {
    if (Object.keys(selectedTasks).length === tasks.length) {
      setSelectedTasks({});
    } else {
      const allSelected = {};
      tasks.forEach((task) => {
        allSelected[task.id] = true;
      });
      setSelectedTasks(allSelected);
    }
  };

  const getFilterLabel = () => {
    if (taskFilter === 'completed') return 'Completed';
    if (taskFilter === 'incomplete') return 'Incomplete';
    return 'All Tasks';
  };

  const getSortLabel = () => {
    if (sortOption === 'priority') return 'Priority';
    if (sortOption === 'dueDate') return 'Due Date';
    if (sortOption === 'progress') return 'Progress';
    return 'Unsorted';
  };

  const renderTaskItem = ({ item }) => {
    const completedSubtasks = (item.subtasks ?? []).filter(
      (sub) => sub.completed
    ).length;
    const progress = item.subtasks && item.subtasks.length > 0 ? completedSubtasks / item.subtasks.length : 0;
    const percentage = Math.round(progress * 100);
    const isExpanded =
      expandedTasks[item.id] !== undefined
        ? expandedTasks[item.id]
        : viewMode === 'detailed';
    const isSelected = !!selectedTasks[item.id];

    // Conditional card style adjustments for dark theme
    const cardExtraStyle = theme === 'dark'
      ? { 
          elevation: 4,
          shadowColor: '#fff',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          borderWidth: 1,
          borderColor: '#555'
        }
      : {};

    return (
      <TouchableOpacity
        onPress={() => {
          if (selectMode) {
            setSelectedTasks((prev) => ({
              ...prev,
              [item.id]: !prev[item.id] ? true : undefined,
            }));
          } else {
            toggleTaskExpansion(item.id);
          }
        }}
        activeOpacity={0.7}
        style={[
          styles.taskCard,
          item.completed && styles.completedTask,
          
          { backgroundColor: selectMode && selectedTasks[item.id] ? themeStyles.selectedCardBackground : themeStyles.backgroundColor },
          cardExtraStyle
        ]}
      >
        {selectMode && (
          <View style={styles.checkboxContainer} testID={`task-checkbox-${item.id}`}>
            <Ionicons
              name={isSelected ? 'checkbox-outline' : 'square-outline'}
              size={20}
              color={themeStyles.textColor}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            navigation.navigate('Edit Task', {
              taskToEdit: item,
              updateTask: (updatedTask) => {
                setTasks((prevTasks) =>
                  prevTasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                  )
                );
              },
              categories: categories,
            });
          }}
        >
          <Ionicons name="create-outline" size={20} color={themeStyles.textColor} />
        </TouchableOpacity>

        <Text style={[styles.taskTitle, { color: themeStyles.textColor }]}>
          {item.title}
        </Text>

        {isExpanded && (
          <>
            <Text style={[styles.details, { color: themeStyles.textColor }]}>
              Due Date: {moment(item.dueDate).format('DD MMMM YYYY')}
            </Text>
            <Text style={[styles.details, { color: themeStyles.textColor }]}>
              Priority: {item.priority}
            </Text>
            <Text style={[styles.details, { color: themeStyles.textColor }]}>
              Category: {item.category}
            </Text>
            {item.completed ? (
              <Text style={styles.completedLabel}>✔ Completed</Text>
            ) : null}

            <View style={styles.progressContainer}>
              <Progress.Bar progress={progress} width={200} />
              <Text style={[styles.percentage, { color: themeStyles.textColor }]}>{percentage}%</Text>
            </View>

            {item.subtasks.map((sub, subIndex) => {
              const subtaskStyle = sub.completed
                ? { 
                    backgroundColor: themeStyles.completedSubtaskBackground, 
                    borderColor: themeStyles.completedSubtaskBorder 
                  }
                : { 
                    backgroundColor: themeStyles.subtaskBackground, 
                    borderColor: themeStyles.subtaskBorder 
                  };

              return (
                <TouchableOpacity
                  key={subIndex}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSubtask(
                      tasks,
                      setTasks,
                      setExpandedTasks,
                      item.id,
                      subIndex,
                      sortOption
                    );
                  }}
                  style={[
                    styles.subtask,
                    subtaskStyle
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.subtaskText, { color: themeStyles.textColor }]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeStyles.textColor }]}>
          {getFilterLabel()} | {getSortLabel()} | {filterCategory ? filterCategory : 'All Categories'}
        </Text>
        <View style={styles.headerButtons}>
        <TouchableOpacity
            onPress={() => setSelectMode(!selectMode)}
            testID="select-toggle"
          >
            <Ionicons
              name={selectMode ? 'close-circle' : 'checkbox'}
              size={18}
              color={themeStyles.textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewModeChange}>
            <Ionicons name={viewMode === 'detailed' ? 'list' : 'eye'} size={18} color={themeStyles.textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="filter" size={18} color={themeStyles.textColor} />
          </TouchableOpacity>
          {/* Theme toggle button on home page controls global theme */}
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={theme === 'light' ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={themeStyles.textColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {menuVisible && (
        <View style={[styles.menuContainer, { backgroundColor: themeStyles.backgroundColor }]}>
          <Text style={[styles.menuLabel, { color: themeStyles.textColor }]}>Sort By:</Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme === 'light' ? '#fff' : '#444',
                borderColor: theme === 'light' ? '#ccc' : '#666',
              },
            ]}
          >
            <Picker
              selectedValue={sortOption}
              onValueChange={(value) => {
                setSortOption(value);
                savePreferences('sortOption', value);
                sortTasks(tasks, setTasks, value);
                setMenuVisible(false);
              }}
              style={[styles.picker, { color: themeStyles.textColor }]}
              itemStyle={{ color: themeStyles.textColor, fontSize: 16 }}
            >
              <Picker.Item label="Select an option" value="" />
              <Picker.Item label="Priority" value="priority" />
              <Picker.Item label="Due Date" value="dueDate" />
              <Picker.Item label="Progress" value="progress" />
            </Picker>
          </View>

          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme === 'light' ? '#fff' : '#444',
                borderColor: theme === 'light' ? '#ccc' : '#666',
              },
            ]}
          >
            <Picker
              selectedValue={filterCategory}
              onValueChange={(value) => {
                setFilterCategory(value);
                savePreferences('filterCategory', value);
                setMenuVisible(false);
              }}
              style={[styles.picker, { color: themeStyles.textColor }]}
              itemStyle={{ color: themeStyles.textColor, fontSize: 16 }}
            >
              <Picker.Item label="All Categories" value="" />
              {categories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme === 'light' ? '#fff' : '#444',
                borderColor: theme === 'light' ? '#ccc' : '#666',
              },
            ]}
          >
            <Picker
              selectedValue={taskFilter}
              onValueChange={(value) => {
                setTaskFilter(value);
                savePreferences('taskFilter', value);
              }}
              style={[styles.picker, { color: themeStyles.textColor }]}
              itemStyle={{ color: themeStyles.textColor, fontSize: 16 }}
            >
              <Picker.Item label="Show All" value="all" />
              <Picker.Item label="Completed" value="completed" />
              <Picker.Item label="Incomplete" value="incomplete" />
            </Picker>
          </View>
        </View>
      )}

      {selectMode && (
        <View style={styles.selectActions}>
          <TouchableOpacity
            onPress={selectAllTasks}
            style={[
              styles.actionButton,
              {
                backgroundColor: themeStyles.buttonBackground,
                borderColor: themeStyles.buttonBackground,
                shadowColor: theme === 'dark' ? '#fff' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 3,
              },
            ]}
          >
            <Text style={styles.actionText}>{Object.keys(selectedTasks).length === tasks.length ? 'Clear All' : 'Select All'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={markSelectedAsComplete}
            style={[
              styles.actionButton,
              {
                backgroundColor: themeStyles.buttonBackground,
                borderColor: themeStyles.buttonBackground,
                shadowColor: theme === 'dark' ? '#fff' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 3,
              },
            ]}
          >
            <Text style={styles.actionText}>✔ Mark Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deleteSelectedTasks}
            style={[
              styles.actionButton,
              {
                backgroundColor: themeStyles.buttonBackground,
                borderColor: themeStyles.buttonBackground,
                shadowColor: theme === 'dark' ? '#fff' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 3,
              },
            ]}
          >
            <Text style={styles.actionText}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={[
          { title: 'Due Today', data: tasksDueToday },
          { title: 'This Week', data: tasksDueThisWeek },
          { title: 'Upcoming', data: upcomingTasks },
        ]}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => (
          <>
            <Text style={[styles.sectionTitle, { color: themeStyles.textColor }]}>{item.title}</Text>
            <FlatList
              data={item.data}
              keyExtractor={(task) => task.id}
              renderItem={renderTaskItem}
              ListEmptyComponent={
                <Text style={[styles.emptyMessage, { color: themeStyles.textColor }]}>
                  No tasks in this category.
                </Text>
              }
            />
          </>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
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
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', gap: 12 },
  menuContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  menuLabel: { fontSize: 16, fontWeight: 'bold' },
  picker: {},
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    position: 'relative',
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
  subtaskText: { fontSize: 16, color: '#333' },
  emptyMessage: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 10 },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  selectedTask: { backgroundColor: 'lightgrey' },
  checkboxContainer: { marginRight: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  taskContent: { flex: 1 },
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
  selectActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
