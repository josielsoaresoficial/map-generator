import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  highlightNextTask?: boolean;
}

export const TaskList = ({ tasks, onEdit, onDelete, highlightNextTask = false }: TaskListProps) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getNextTaskId = () => {
    if (!highlightNextTask) return null;
    
    for (const task of tasks) {
      const [taskHours, taskMinutes] = task.time.split(":").map(Number);
      const taskTotalMinutes = taskHours * 60 + taskMinutes;
      if (taskTotalMinutes > currentMinutes) {
        return task.id;
      }
    }
    return null;
  };

  const nextTaskId = getNextTaskId();

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isNextTask = task.id === nextTaskId;
        
        return (
          <Card
            key={task.id}
            className={`p-3 md:p-4 transition-all ${
              isNextTask
                ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary shadow-lg scale-[1.02]"
                : "hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className={`flex items-center gap-1 md:gap-2 ${isNextTask ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="font-mono text-sm md:text-base whitespace-nowrap">{task.time}</span>
                </div>
                <div className="h-6 md:h-8 w-px bg-border flex-shrink-0" />
                <p className={`text-sm md:text-base ${isNextTask ? "font-semibold text-foreground" : ""} truncate`}>
                  {task.description}
                </p>
              </div>
              <div className="flex gap-1 md:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="h-7 w-7 md:h-8 md:w-8"
                >
                  <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(task.id)}
                  className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
