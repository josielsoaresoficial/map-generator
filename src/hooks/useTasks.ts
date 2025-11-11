import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { defaultTasks } from "@/utils/taskUtils";

const TASKS_KEY = "routine-assistant-tasks";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(defaultTasks);
      localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    const sortedTasks = [...newTasks].sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(":").map(Number);
      const [bHours, bMinutes] = b.time.split(":").map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });
    localStorage.setItem(TASKS_KEY, JSON.stringify(sortedTasks));
    setTasks(sortedTasks);
  };

  const addTask = (task: Omit<Task, "id">) => {
    const newTask = { ...task, id: Date.now().toString() };
    saveTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updatedTask: Omit<Task, "id">) => {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...updatedTask, id } : task
    );
    saveTasks(newTasks);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((task) => task.id !== id));
  };

  return { tasks, addTask, updateTask, deleteTask };
};
