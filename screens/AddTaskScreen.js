import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AddTaskScreen({ navigation, route }) {
  const { addTask } = route.params;
  const [title, setTitle] = useState('');
  const [subtaskName, setSubtaskName] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(['Work', 'Personal']); // Initial categories
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false); // Toggle for new category input
  const [newCategory, setNewCategory] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true); // Control placeholder visibility

  const addSubtask = () => {
    if (subtaskName.trim() !== '') {
      setSubtasks([...subtasks, { name: subtaskName, completed: false }]);
      setSubtaskName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false); // Hide the new category input
    } else {
      alert('Category is empty or already exists.');
    }
  };

  const handleAddTask = () => {
    if (title.trim() && subtasks.length > 0 && category.trim() !== '') {
      addTask({ title, subtasks, dueDate: dueDate.toDateString(), priority, category });
      navigation.goBack();
    } else {
      alert('Please fill in all fields and add at least one subtask.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Task Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
      />
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
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => setPriority(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>
      </View>
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => {
            if (itemValue === 'create') {
              setShowNewCategoryInput(true); // Show the new category input
              setCategory('');
            } else {
              setShowNewCategoryInput(false); // Hide the new category input
              setCategory(itemValue);
            }
          }}
          onFocus={() => setShowPlaceholder(false)} // Hide placeholder when interacting with the picker
          style={styles.picker}
        >
          {showPlaceholder && <Picker.Item label="Select a category" value="" />}
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
          <Picker.Item label="Create new category" value="create" />
        </Picker>
      </View>
      {showNewCategoryInput && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter new category"
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
            <Text style={styles.addCategoryButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.label}>Subtasks</Text>
      <View style={styles.subtaskInputContainer}>
        <TextInput
          style={styles.subtaskInput}
          placeholder="Enter subtask"
          value={subtaskName}
          onChangeText={setSubtaskName}
        />
        <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
          <Text style={styles.addSubtaskButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.subtasksContainer}>
        {subtasks.map((subtask, index) => (
          <Text key={index} style={styles.subtaskItem}>• {subtask.name}</Text>
        ))}
      </View>
      <View style={styles.addButtonContainer}>
        <Button title="Add Task" onPress={handleAddTask} />
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  addCategoryButton: {
    marginTop: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addCategoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addSubtaskButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtasksContainer: {
    marginVertical: 8,
  },
  subtaskItem: { marginVertical: 4, fontSize: 16 },
  addButtonContainer: {
    marginTop: 16,
    marginBottom: 32, // Extra margin for scroll padding
  },
});
