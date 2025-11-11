import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

interface PomodoroTimerProps {
  isActive: boolean;
  isWorkSession: boolean;
  timeLeft: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const PomodoroTimer = ({
  isActive,
  isWorkSession,
  timeLeft,
  onStart,
  onPause,
  onReset,
}: PomodoroTimerProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-card to-card/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {isWorkSession ? "🍅 Sessão de Foco" : "☕ Pausa"}
        </h2>
        <p className="text-muted-foreground">
          {isWorkSession ? "Concentre-se na tarefa" : "Relaxe um pouco"}
        </p>
      </div>

      <div className="mb-8">
        <div className="text-7xl font-bold tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {!isActive ? (
          <Button onClick={onStart} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Iniciar
          </Button>
        ) : (
          <Button onClick={onPause} size="lg" variant="secondary" className="gap-2">
            <Pause className="h-5 w-5" />
            Pausar
          </Button>
        )}
        <Button onClick={onReset} size="lg" variant="outline" className="gap-2">
          <RotateCcw className="h-5 w-5" />
          Resetar
        </Button>
      </div>
    </Card>
  );
};
