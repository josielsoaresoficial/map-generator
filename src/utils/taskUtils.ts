import { Task } from "@/types/task";

export const defaultTasks: Task[] = [
  { id: "1", time: "06:00", description: "Acordar e ir trabalhar" },
  { id: "2", time: "07:15", description: "Colocar a batata no fogo, cuscuz, café" },
  { id: "3", time: "08:30", description: "Tomar café e ler a Bíblia" },
  { id: "4", time: "09:00", description: "Trabalho" },
  { id: "5", time: "13:00", description: "Almoço" },
  { id: "6", time: "13:30", description: "Trabalho" },
  { id: "7", time: "17:00", description: "Lazer / Culto" },
  { id: "8", time: "18:30", description: "(Horário livre)" },
];

export const getGreeting = (hour: number): string => {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  
  if (minute === 0) {
    return `${hour} horas em ponto`;
  }
  return `${hour} horas e ${minute} minutos`;
};

export const findNextTask = (tasks: Task[], currentTime: Date): Task | null => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const sortedTasks = [...tasks].sort((a, b) => {
    const [aHours, aMinutes] = a.time.split(":").map(Number);
    const [bHours, bMinutes] = b.time.split(":").map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });

  for (const task of sortedTasks) {
    const [taskHours, taskMinutes] = task.time.split(":").map(Number);
    const taskTotalMinutes = taskHours * 60 + taskMinutes;
    
    if (taskTotalMinutes > currentMinutes) {
      return task;
    }
  }

  return null;
};

export const findCurrentTask = (tasks: Task[], currentTime: Date): Task | null => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const sortedTasks = [...tasks].sort((a, b) => {
    const [aHours, aMinutes] = a.time.split(":").map(Number);
    const [bHours, bMinutes] = b.time.split(":").map(Number);
    return (bHours * 60 + bMinutes) - (aHours * 60 + aMinutes);
  });

  for (const task of sortedTasks) {
    const [taskHours, taskMinutes] = task.time.split(":").map(Number);
    const taskTotalMinutes = taskHours * 60 + taskMinutes;
    
    if (taskTotalMinutes <= currentMinutes) {
      return task;
    }
  }

  return null;
};
