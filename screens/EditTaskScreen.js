import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function EditTaskScreen({ navigation, route, deleteTask}) {
  const { taskToEdit, updateTask, categories } = route.params || {};

  if (!taskToEdit) {
    alert('Error: No task found to edit.');
    navigation.goBack();
    return null;
  }

  const [title, setTitle] = useState(taskToEdit.title);
  const [dueDate, setDueDate] = useState(new Date(taskToEdit.dueDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(taskToEdit.priority);
  const [category, setCategory] = useState(taskToEdit.category);
  const [subtasks, setSubtasks] = useState(taskToEdit.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks((prev) => [...prev, { name: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (index) => {
    setSubtasks((prev) =>
      prev.map((subtask, i) =>
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };

  const handleDeleteTask = () => {
    if (!deleteTask) {
      alert('Error: deleteTask function not found.');
      return;
    }
  
    if (taskToEdit) {
      deleteTask(taskToEdit.id); // ✅ Call the function correctly
      alert('Task deleted successfully.');
      navigation.goBack(); // ✅ Navigate back to HomeScreen
    }
  };
  
  

  const handleUpdateTask = () => {
    if (title.trim() && subtasks.length > 0 && category.trim() !== '') {
      const updatedTask = {
        ...taskToEdit,
        title,
        dueDate: dueDate.toISOString(),
        priority,
        category,
        subtasks,
      };

      updateTask(updatedTask); // ✅ Updates the task in HomeScreen
      navigation.goBack(); // ✅ Returns to HomeScreen after update
    } else {
      alert('Please fill in all fields and add at least one subtask.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Edit Task</Text>

      <Text style={styles.label}>Task Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{dueDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Priority</Text>
      <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
        <Picker.Item label="High" value="High" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Low" value="Low" />
      </Picker>

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
      >
        {categories.map((cat, index) => (
          <Picker.Item key={index} label={cat} value={cat} />
        ))}
      </Picker>

      <Text style={styles.label}>Subtasks</Text>
      {subtasks.map((subtask, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.subtask, subtask.completed ? styles.completedSubtask : null]}
          onPress={() => handleToggleSubtask(index)}
        >
          <Text>{subtask.name}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.subtaskInputContainer}>
        <TextInput
          style={styles.subtaskInput}
          placeholder="Add new subtask"
          value={newSubtask}
          onChangeText={setNewSubtask}
        />
        <TouchableOpacity style={styles.addSubtaskButton} onPress={handleAddSubtask}>
          <Text style={styles.addSubtaskButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addButtonContainer}>
        <Button title="Update Task" onPress={handleUpdateTask} />
      </View>
      <View style={styles.deleteButtonContainer}>
        <Button title="Delete Task" onPress={handleDeleteTask} color="red" />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 8,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  dateText: {
    fontSize: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  picker: { height: 50, width: '100%' },
  subtask: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  completedSubtask: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  subtaskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  addSubtaskButton: {
    marginLeft: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 10,
  },
  addSubtaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  }
  
});
