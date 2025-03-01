import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

export default function CalendarScreen({ tasks = [] }) {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

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
      <View style={[
        styles.taskCard, 
        item.completed 
          ? styles.completedTask 
          : (completeness > 0 && completeness < 100) 
            ? styles.partialTask 
            : null
      ]}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDetails}>Priority: {item.priority}</Text>
        <Text style={styles.taskDetails}>Progress: {completeness}%</Text>
        {item.subtasks && item.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={styles.subtaskHeader}>Subtasks:</Text>
            {item.subtasks.map((sub, index) => (
              <Text key={index} style={styles.subtaskText}>
                {sub.name} {sub.completed ? '✔' : '✗'} 
              </Text>
            ))}
          </View>
        )}
        
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={tasksForDate}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderTaskItem}
      ListEmptyComponent={<Text style={styles.noTask}>No tasks for this day.</Text>}
      ListHeaderComponent={
        <>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType={'multi-dot'}
          />
          <Text style={styles.header}>Tasks for {moment(selectedDate).format('D MMMM YYYY')}</Text>
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
    backgroundColor: '#fff', 
    padding: 16, 
    marginHorizontal: 16, 
    marginBottom: 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDetails: { fontSize: 14, marginTop: 4 },
  subtasksContainer: { marginTop: 8 },
  subtaskHeader: { fontSize: 14, fontWeight: 'bold' },
  subtaskText: { fontSize: 14, marginLeft: 8, marginTop: 2 },
  noTask: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 16 },completedTask: {
    backgroundColor: '#d4edda', 
    borderColor: '#28a745',    
  },
  partialTask: {
    backgroundColor: '#ffffe0', 
    borderColor: '#f0e68c',     
  },
  
  
  
});
