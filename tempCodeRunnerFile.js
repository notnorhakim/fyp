import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import SearchScreen from './screens/SearchScreen';
import TimerScreen from './screens/TimerScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import EditTaskScreen from './screens/EditTaskScreen'; // ✅ Import Edit Screen

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [tasks, setTasks] = useState([]); // ✅ Store tasks globally

  function addTask(task) {
    setTasks((prevTasks) => [...prevTasks, task]); // ✅ Ensure state updates persist
  }

  function updateTask(updatedTask) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    ); // ✅ Update the edited task
  }

  function BottomTabs() {
    return (
      <Tab.Navigator screenOptions={{ tabBarShowLabel: false, tabBarStyle: styles.tabBar }}>
        <Tab.Screen
          name="Home"
          children={() => <HomeScreen tasks={tasks} setTasks={setTasks} />}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="AddTask"
          children={(props) => <AddTaskScreen {...props} addTask={addTask} />}
          options={{
            tabBarButton: () => <CustomAddTaskButton />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="AddTask">
          {(props) => <AddTaskScreen {...props} addTask={addTask} />}
        </Stack.Screen>
        <Stack.Screen name="Edit Task">
          {(props) => <EditTaskScreen {...props} updateTask={updateTask} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Custom Floating Add Task Button
function CustomAddTaskButton() {
  const navigation = useNavigation(); // ✅ Ensure navigation is available

  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => navigation.navigate('AddTask')} // ✅ Navigate correctly
    >
      <Ionicons name="add" size={32} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    height: 60,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  addButton: {
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    elevation: 5,
  },
});
