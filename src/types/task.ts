export interface Task {
  id: string;
  time: string; // formato "HH:mm"
  description: string;
  completed?: boolean;
  completedAt?: string;
  externalCalendarId?: string;
  reminderMinutes?: number; // Minutos antes para lembrete
}
