export const toggleSubtask = (tasks, setTasks, setExpandedTasks, taskId, subtaskIndex, sortOption) => {
  setTasks((prevTasks) => {
    const updatedTasks = prevTasks.map((task) => {
      if (task.id !== taskId) return task; 

      const updatedSubtasks = task.subtasks.map((subtask, subIndex) =>
        subIndex === subtaskIndex ? { ...subtask, completed: !subtask.completed } : subtask
      );

      const completedSubtasks = updatedSubtasks.filter((sub) => sub.completed).length;
      const totalSubtasks = updatedSubtasks.length || 1;
      const progress = completedSubtasks / totalSubtasks;

      return {
        ...task,
        subtasks: updatedSubtasks,
        progress,
        completed: progress === 1, 
      };
    });

    if (sortOption === 'progress') {
      updatedTasks.sort((a, b) => b.progress - a.progress);
    }

    // ✅ Preserve user-expanded state
    setExpandedTasks((prevExpanded) => {
      const updatedExpanded = {
        ...prevExpanded,
        [taskId]: true, // Ensure only the parent task stays expanded
      };
      AsyncStorage.setItem('expandedTasks', JSON.stringify(updatedExpanded)); // ✅ Save expanded state persistently
      return updatedExpanded;
    });

    return updatedTasks;
  });
};

  export const sortTasks = (tasks, setTasks, option) => {
    let sortedTasks = [...tasks];
  
    if (option === 'priority') {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (option === 'dueDate') {
      sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (option === 'progress') {
      sortedTasks = sortedTasks.map((task) => {
        const completedSubtasks = task.subtasks.filter((sub) => sub.completed).length;
        const progress = completedSubtasks / task.subtasks.length || 0;
        return { ...task, progress };
      });
  
      sortedTasks.sort((a, b) => b.progress - a.progress);
    }
  
    setTasks(sortedTasks);
  };
  
  export const filterTasksByCategory = (tasks, category) => {
    return category ? tasks.filter((task) => task.category === category) : tasks;
  };
  