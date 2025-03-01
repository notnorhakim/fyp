import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Button, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';




export default function AddTaskScreen({ navigation, addTask, categories = [] }) {
  const [title, setTitle] = useState('');
  const [subtaskName, setSubtaskName] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState(categories.length > 0 ? categories[0] : 'Work');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);

  useEffect(() => {
    console.log("Attached files:", attachedFiles);
  }, [attachedFiles]);
  

  const addSubtask = () => {
    if (subtaskName.trim() !== '' && !subtasks.some(sub => sub.name === subtaskName.trim())) {
      setSubtasks([...subtasks, { name: subtaskName.trim(), completed: false }]);
      setSubtaskName('');
    } else {
      alert('Subtask is empty or already exists.');
    }
  };

  const deleteFile = (index) => {
    setAttachedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  

  const attachFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    console.log("File picker result:", result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachedFiles(prevFiles => [...prevFiles, result.assets[0]]);
    }
    
  };
  

  const handleAddTask = () => {
    const finalCategory = newCategory.trim() || category;
    
    if (!title.trim() || subtasks.length === 0 || !finalCategory.trim()) {
      alert('Please fill in all fields and add at least one subtask.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      subtasks,
      dueDate: dueDate.toISOString(),
      priority,
      category: finalCategory,
      attachments: attachedFiles,
    };

    addTask(newTask);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
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
              setShowNewCategoryInput(true);
              setCategory('');
            } else {
              setShowNewCategoryInput(false);
              setCategory(itemValue);
            }
          }}
          onFocus={() => setShowPlaceholder(false)}
          style={styles.picker}
        >
          {showPlaceholder && <Picker.Item label="Select a category" value="" />}
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
          <Picker.Item label="Create New Category" value="create" />
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
      <Text style={styles.label}>Attachments</Text>
      <View style={styles.attachmentsContainer}>
        <Button title="Attach File" onPress={attachFile} />
        {attachedFiles.length ? (
          attachedFiles.map((file, index) => (
            <View key={index} style={styles.attachmentRow}>
              <TouchableOpacity
                style={styles.attachmentItem}
                onPress={async () => {
                  try {
                    const newPath = FileSystem.cacheDirectory + file.name;
                    await FileSystem.copyAsync({ from: file.uri, to: newPath });
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(newPath);
                    } else {
                      await Linking.openURL(newPath);
                    }
                  } catch (err) {
                    console.error("Error opening file:", err);
                  }
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="black"
                  style={styles.attachmentIcon}
                />
                <Text style={styles.attachmentTitle} numberOfLines={1}>
                  {file.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteFile(index)}
                style={styles.deleteIconContainer}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAttachment}>No files attached</Text>
        )}


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
  attachmentsContainer: {
    marginVertical: 8,
  },
  fileItem: { marginVertical: 4, fontSize: 16, color: 'blue' },
  addButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%', // keeps it within the parent container
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // allow the file item area to take available space
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentTitle: {
    fontSize: 16,
    flex: 1,         // use available space
    flexShrink: 1,   // shrink text if needed
  },
  deleteIconContainer: {
    padding: 4,
  },
  noAttachment: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  
  
  
  
  
});
