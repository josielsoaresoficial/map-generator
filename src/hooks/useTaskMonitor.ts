import { useEffect, useRef, useState } from "react";
import { Task } from "@/types/task";

interface TaskMonitorProps {
  tasks: Task[];
  onTaskAlert: (task: Task) => void;
  onReminderAlert?: (task: Task, minutesBefore: number) => void;
  enabled: boolean;
}

export const useTaskMonitor = ({ tasks, onTaskAlert, onReminderAlert, enabled }: TaskMonitorProps) => {
  const lastCheckedRef = useRef<string>("");
  const remindersTriggeredRef = useRef<Set<string>>(new Set());
  const [isAppVisible, setIsAppVisible] = useState(!document.hidden);

  useEffect(() => {
    // Monitor document visibility
    const handleVisibilityChange = () => {
      setIsAppVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const checkTasks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      // Check if we already alerted for this minute
      if (currentTime === lastCheckedRef.current) {
        return;
      }

      lastCheckedRef.current = currentTime;

      // Find task matching current time
      const matchingTask = tasks.find((task) => task.time === currentTime);

      if (matchingTask) {
        console.log(`[Task Monitor] Alert triggered for: ${matchingTask.description} at ${currentTime}`);
        onTaskAlert(matchingTask);
      }

      // Check for reminder alerts
      if (onReminderAlert) {
        tasks.forEach((task) => {
          if (task.reminderMinutes && task.reminderMinutes > 0) {
            const [taskHour, taskMinute] = task.time.split(":").map(Number);
            const taskTime = new Date(now);
            taskTime.setHours(taskHour, taskMinute, 0, 0);
            
            const reminderTime = new Date(taskTime.getTime() - task.reminderMinutes * 60 * 1000);
            const reminderTimeStr = `${reminderTime.getHours().toString().padStart(2, "0")}:${reminderTime.getMinutes().toString().padStart(2, "0")}`;
            
            const reminderKey = `${task.id}-${task.reminderMinutes}`;
            
            if (currentTime === reminderTimeStr && !remindersTriggeredRef.current.has(reminderKey)) {
              console.log(`[Task Monitor] Reminder triggered for: ${task.description} (${task.reminderMinutes} minutes before)`);
              remindersTriggeredRef.current.add(reminderKey);
              onReminderAlert(task, task.reminderMinutes);
            }
          }
        });
      }
    };

    // Check immediately
    checkTasks();

    // Check every 10 seconds (more frequent to catch the exact minute)
    const interval = setInterval(checkTasks, 10000);

    return () => clearInterval(interval);
  }, [tasks, onTaskAlert, enabled]);

  return { isAppVisible };
};
