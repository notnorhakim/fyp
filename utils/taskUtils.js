export const toggleSubtask = (tasks, setTasks, setExpandedTasks, taskIndex, subtaskIndex, sortOption) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task, index) => {
        if (index !== taskIndex) return task;
  
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
          completed: progress === 1, // ✅ Mark task as completed when progress reaches 100%
        };
      });
  
      if (sortOption === 'progress') {
        updatedTasks.sort((a, b) => b.progress - a.progress);
      }
  
      // ✅ Preserve expandedTasks without affecting other tasks
      setExpandedTasks((prevExpanded) => ({ ...prevExpanded }));
  
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
  