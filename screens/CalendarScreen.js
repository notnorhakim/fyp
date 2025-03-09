import React, { useState, useMemo, useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from './ThemeContext';

export default function CalendarScreen({ tasks = [] }) {
  const { theme, themeStyles } = useContext(ThemeContext);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
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

  // Create a custom theme for the Calendar component
  const calendarTheme = useMemo(() => ({
    backgroundColor: themeStyles.backgroundColor,
    calendarBackground: themeStyles.backgroundColor,
    textSectionTitleColor: themeStyles.textColor,
    dayTextColor: themeStyles.textColor,
    todayTextColor: theme === 'light' ? '#00adf5' : '#00adf5',
    selectedDayBackgroundColor: 'orange',
    selectedDayTextColor: themeStyles.textColor,
    monthTextColor: themeStyles.textColor,
    arrowColor: themeStyles.textColor,
    textDisabledColor: '#d9e1e8',
  }), [theme, themeStyles]);

  // Compute marked dates using local conversion for accuracy
  const markedDates = useMemo(() => {
    const marks = {};
    tasks.forEach(task => {
      const date = moment(task.dueDate).local().format('YYYY-MM-DD');
      if (marks[date]) {
        marks[date].dots.push({ color: 'blue' });
      } else {
        marks[date] = { dots: [{ color: 'blue' }] };
      }
    });
    // Highlight the selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: 'orange'
    };
    return marks;
  }, [tasks, selectedDate]);

  // Filter tasks whose local due date matches the selected date
  const tasksForDate = tasks.filter(
    task => moment(task.dueDate).local().format('YYYY-MM-DD') === selectedDate
  );

  const renderTaskItem = ({ item }) => {
    const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
    const completedSubtasks = item.subtasks ? item.subtasks.filter(s => s.completed).length : 0;
    const completeness = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    
    return (
      <TouchableOpacity 
        style={[
          styles.taskCard,
          completeness === 100
            ? styles.completedTask
            : completeness > 0 && completeness < 100
              ? styles.partialTask
              : null,
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
        <Text style={[styles.taskDetails, { color: themeStyles.textColor }]}>Priority: {item.priority}</Text>
        <Text style={[styles.taskDetails, { color: themeStyles.textColor }]}>Progress: {completeness}%</Text>
        {item.subtasks && item.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={[styles.subtaskHeader, { color: themeStyles.textColor }]}>Subtasks:</Text>
            {item.subtasks.map((sub, index) => (
              <Text key={index} style={[styles.subtaskText, { color: themeStyles.textColor }]}>
                {sub.name} {sub.completed ? '✔' : '✗'}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}
      data={tasksForDate}
      keyExtractor={item => item.id.toString()}
      renderItem={renderTaskItem}
      ListEmptyComponent={
        <Text style={[styles.noTask, { color: themeStyles.textColor }]}>
          No tasks for this day.
        </Text>
      }
      ListHeaderComponent={
        <>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={calendarTheme}
          />
          <Text style={[styles.header, { color: themeStyles.textColor }]}>
            Tasks for {moment(selectedDate).format('D MMMM YYYY')}
          </Text>
        </>
      }
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 50 },
  header: { fontSize: 18, fontWeight: 'bold', margin: 16 },
  taskCard: { 
    padding: 16, 
    marginHorizontal: 16, 
    marginBottom: 8, 
    borderRadius: 8, 
    borderWidth: 1,
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDetails: { fontSize: 14, marginTop: 4 },
  subtasksContainer: { marginTop: 8 },
  subtaskHeader: { fontSize: 14, fontWeight: 'bold' },
  subtaskText: { fontSize: 14, marginLeft: 8, marginTop: 2 },
  noTask: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  completedTask: {
    backgroundColor: '#d4edda', 
    borderColor: '#28a745',    
  },
  partialTask: {
    backgroundColor: '#ffffe0', 
    borderColor: '#f0e68c',     
  },
});
