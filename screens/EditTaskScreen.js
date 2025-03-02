import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Button, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function EditTaskScreen({ navigation, route, deleteTask, updateTask }) {
  const { taskToEdit, categories } = route.params || {};

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
  const [attachedFiles, setAttachedFiles] = useState(taskToEdit.attachments || []);

  const attachFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    console.log("File picker result:", result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachedFiles(prevFiles => [...prevFiles, result.assets[0]]);
    }
  };

  const deleteFile = (index) => {
    setAttachedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { name: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const deleteSubtask = (index) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index) => {
    setSubtasks(prev =>
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
      deleteTask(taskToEdit.id);
      navigation.goBack();
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
        attachments: attachedFiles,
      };
      updateTask(updatedTask);
      navigation.goBack();
    } else {
      alert('Please fill in all fields and add at least one subtask.');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
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
      <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
        {categories.map((cat, index) => (
          <Picker.Item key={index} label={cat} value={cat} />
        ))}
      </Picker>

      <Text style={styles.label}>Subtasks</Text>
      {subtasks.map((subtask, index) => (
        <View key={index} style={styles.subtaskRow}>
          <TouchableOpacity
            style={[styles.subtask, subtask.completed ? styles.completedSubtask : null, { flex: 1 }]}
            onPress={() => handleToggleSubtask(index)}
          >
            <Text>{subtask.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteSubtask(index)} style={styles.deleteIconContainer}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
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
                <Ionicons name="document-text-outline" size={24} color="black" style={styles.attachmentIcon} />
                <Text style={styles.attachmentTitle} numberOfLines={1}>
                  {file.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteFile(index)} style={styles.deleteIconContainer}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAttachment}>No files attached</Text>
        )}
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
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  subtask: {
    padding: 8,
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
  },
  attachmentsContainer: {
    marginVertical: 8,
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
    width: '100%',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentTitle: {
    fontSize: 16,
    flex: 1,
    flexShrink: 1,
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
