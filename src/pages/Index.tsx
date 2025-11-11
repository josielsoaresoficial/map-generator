import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserName } from "@/hooks/useUserName";
import { useTasks } from "@/hooks/useTasks";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useTaskMonitor } from "@/hooks/useTaskMonitor";
import { useNotifications } from "@/hooks/useNotifications";
import { useVoiceSettings } from "@/hooks/useVoiceSettings";
import { useAlarmSettings } from "@/hooks/useAlarmSettings";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useStatistics } from "@/hooks/useStatistics";
import { useTheme } from "@/hooks/useTheme";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { TaskList } from "@/components/TaskList";
import { TaskDialog } from "@/components/TaskDialog";
import { AssistantButton } from "@/components/AssistantButton";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { StatisticsCard } from "@/components/StatisticsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Calendar, Moon, Sun, BarChart3 } from "lucide-react";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { playAlertSound } from "@/utils/alertSound";

const Index = () => {
  const navigate = useNavigate();
  const { userName, saveUserName, clearUserName } = useUserName();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { isSpeaking, startAssistant, stopSpeaking, announceTask } = useVoiceAssistant();
  const { sendNotification, requestPermission, permission } = useNotifications();
  const { getSelectedVoice } = useVoiceSettings();
  const { settings: alarmSettings } = useAlarmSettings();
  const { theme, toggleTheme } = useTheme();
  
  // Novos hooks
  const pomodoro = usePomodoro();
  const { statistics } = useStatistics(tasks);
  const { syncToCalendar } = useCalendarSync();

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (userName && permission === "default") {
      requestPermission();
    }
  }, [userName, permission, requestPermission]);

  // Handle task alerts with persistent notifications
  const handleTaskAlert = async (task: Task) => {
    const isVisible = !document.hidden;
    
    console.log(`[Task Alert] Triggering alert for: ${task.description}, App visible: ${isVisible}`);
    
    // Clear any existing alarm interval
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    
    // Function to play the alarm
    const playAlarm = async () => {
      // Always send persistent notification via service worker
      // This ensures notifications work even when app is in background or locked
      await sendNotification(
        "Alerta de Tarefa",
        `Está na hora de: ${task.description} (${task.time})`,
        {
          tag: task.id,
          requireInteraction: true,
          vibrate: [500, 200, 500, 200, 500],
          soundType: "task"
        }
      );
      
      // Only play sound and TTS if app is visible
      if (isVisible) {
        playAlertSound("task");
        const selectedVoice = getSelectedVoice();
        await announceTask(task.description, selectedVoice);
      }
    };

    // Play first alarm
    await playAlarm();
    
    // Show toast only if visible
    if (isVisible) {
      toast.success("Alerta de Tarefa", {
        description: `Está na hora de: ${task.description}`,
      });
    }

    // Setup repeat if configured
    if (alarmSettings.repeatDuration > 0) {
      let elapsedTime = 0;
      const intervalTime = alarmSettings.repeatInterval * 1000; // Convert to milliseconds

      alarmIntervalRef.current = setInterval(async () => {
        elapsedTime += alarmSettings.repeatInterval;

        if (elapsedTime >= alarmSettings.repeatDuration) {
          // Stop repeating
          if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
          }
          console.log(`[Task Alert] Alarm repeat finished for: ${task.description}`);
        } else {
          // Play alarm again
          console.log(`[Task Alert] Repeating alarm for: ${task.description} (${elapsedTime}s elapsed)`);
          await playAlarm();
        }
      }, intervalTime);
    }
  };

  // Handle reminder alerts
  const handleReminderAlert = async (task: Task, minutesBefore: number) => {
    const message = `Lembrete: ${task.description} em ${minutesBefore} minutos`;
    
    await sendNotification(
      "Lembrete de Tarefa",
      message,
      {
        tag: `reminder-${task.id}-${minutesBefore}`,
        requireInteraction: false,
        soundType: "reminder"
      }
    );

    if (!document.hidden) {
      playAlertSound("reminder");
      toast.info("Lembrete", {
        description: message,
      });
    }
  };

  // Cleanup alarm interval on unmount
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'COMPLETE_TASK') {
        const taskId = event.data.taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          deleteTask(taskId);
          toast.success("Tarefa Completada!", {
            description: `${task.description} foi concluída.`
          });
        }
      } else if (event.data.type === 'SNOOZE_TASK') {
        const taskId = event.data.taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          toast.info("Tarefa Adiada", {
            description: `${task.description} - Lembrete em 5 minutos`
          });
          
          // Schedule notification after 5 minutes
          setTimeout(() => {
            handleTaskAlert(task);
          }, 5 * 60 * 1000);
        }
      } else if (event.data.type === 'PLAY_NOTIFICATION_SOUND') {
        // Play the appropriate sound when notification is shown
        const soundType = event.data.soundType || 'task';
        playAlertSound(soundType);
        console.log(`[SW Message] Playing ${soundType} sound`);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [tasks, deleteTask]);

  // Monitor tasks with reminders
  useTaskMonitor({
    tasks,
    onTaskAlert: handleTaskAlert,
    onReminderAlert: handleReminderAlert,
    enabled: monitoringEnabled && !!userName,
  });

  // Enable monitoring when user logs in
  useEffect(() => {
    if (userName) {
      setMonitoringEnabled(true);
      console.log("[Task Monitor] Monitoring enabled");
    }
  }, [userName]);

  const handleAssistantClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!userName) return;

    try {
      const message = await startAssistant(userName, tasks);
      toast.success("Assistente falou!", {
        description: message,
      });
    } catch (error) {
      toast.error("Erro ao iniciar assistente", {
        description: "Verifique se seu navegador suporta Text-to-Speech",
      });
    }
  };

  // Auto-start assistant when app loads
  useEffect(() => {
    if (userName && tasks.length > 0 && !hasAutoStarted) {
      const timer = setTimeout(() => {
        handleAssistantClick();
        setHasAutoStarted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userName, tasks, hasAutoStarted]);

  const handleSaveTask = async (taskData: Omit<Task, "id">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success("Tarefa atualizada!");
    } else {
      const newTask = addTask(taskData);
      // Sincronizar com calendário se configurado
      if (taskData.externalCalendarId) {
        await syncToCalendar(newTask);
      }
      toast.success("Tarefa adicionada!");
    }
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteTask(id);
      toast.success("Tarefa excluída!");
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleResetName = () => {
    if (confirm("Deseja redefinir seu nome?")) {
      clearUserName();
      toast.success("Nome redefinido!");
    }
  };

  const handleGoToSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-safe">
      <WelcomeDialog open={!userName} onSave={saveUserName} />

      <div className="container max-w-4xl mx-auto p-4 md:p-8 safe-top">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                Assistente de Rotina
              </h1>
              {userName && (
                <p className="text-sm md:text-base text-muted-foreground truncate">Olá, {userName}! 👋</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="flex-shrink-0">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleGoToSettings} className="flex-shrink-0">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <span>🍅 Foco</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Tarefas */}
          <TabsContent value="tasks">
            {/* Assistant Button */}
            <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-br from-card to-card/50 shadow-xl border-primary/20">
              <AssistantButton onClick={handleAssistantClick} isSpeaking={isSpeaking} />
            </Card>

            {/* Task List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg md:text-2xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="truncate">Sua Agenda de Hoje</span>
                </h2>
                <Button onClick={handleNewTask} size="sm" className="gap-2 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Tarefa</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>

              {tasks.length > 0 ? (
                <TaskList
                  tasks={tasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  highlightNextTask
                />
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Nenhuma tarefa agendada ainda.</p>
                  <p className="text-sm mt-2">Clique em "Nova Tarefa" para adicionar uma atividade.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab Pomodoro */}
          <TabsContent value="pomodoro">
            <div className="space-y-6">
              <PomodoroTimer
                isActive={pomodoro.isActive}
                isWorkSession={pomodoro.isWorkSession}
                timeLeft={pomodoro.timeLeft}
                onStart={pomodoro.startPomodoro}
                onPause={pomodoro.pausePomodoro}
                onReset={pomodoro.resetPomodoro}
              />
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sessões de Foco</h3>
                <p className="text-muted-foreground">
                  {pomodoro.sessionsCompleted} sessões completadas hoje
                </p>
                <div className="mt-4 flex gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 flex-1 rounded-full ${
                        index < pomodoro.sessionsCompleted 
                          ? "bg-green-500" 
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Estatísticas */}
          <TabsContent value="stats">
            <StatisticsCard statistics={statistics} />
            
            <Card className="p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Suas Conquistas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Tarefas Completas</span>
                  <span className="font-bold">{statistics.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de Conclusão</span>
                  <span className="font-bold">{statistics.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sequência Atual</span>
                  <span className="font-bold">{statistics.streak} dias</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task Dialog */}
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          onSave={handleSaveTask}
          editingTask={editingTask}
        />
      </div>
    </div>
  );
};

export default Index;
