import { useMemo } from "react";
import { Task } from "@/types/task";

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  streak: number;
  todayCompleted: number;
  weekCompleted: number;
}

export const useStatistics = (tasks: Task[]): { statistics: Statistics } => {
  const statistics = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // Buscar histórico do localStorage
    const historyStr = localStorage.getItem("task-history");
    const history: Array<{ taskId: string; completedAt: string; date: string }> = historyStr 
      ? JSON.parse(historyStr) 
      : [];

    // Tarefas completadas hoje
    const todayCompleted = history.filter(h => h.date === today).length;

    // Tarefas completadas na semana
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekCompleted = history.filter(h => {
      const date = new Date(h.completedAt);
      return date >= oneWeekAgo;
    }).length;

    // Calcular sequência (streak)
    let streak = 0;
    let checkDate = new Date(now);
    
    while (true) {
      const dateStr = checkDate.toDateString();
      const hasCompletions = history.some(h => h.date === dateStr);
      
      if (hasCompletions) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalTasks = tasks.length;
    const completedTasks = history.length;
    const pendingTasks = totalTasks;
    const completionRate = totalTasks > 0 ? (todayCompleted / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      streak,
      todayCompleted,
      weekCompleted,
    };
  }, [tasks]);

  return { statistics };
};
