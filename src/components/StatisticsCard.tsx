import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, TrendingUp, Flame } from "lucide-react";
import { Statistics } from "@/hooks/useStatistics";

interface StatisticsCardProps {
  statistics: Statistics;
}

export const StatisticsCard = ({ statistics }: StatisticsCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hoje</p>
            <p className="text-2xl font-bold">{statistics.todayCompleted}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Tarefas completadas</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Esta Semana</p>
            <p className="text-2xl font-bold">{statistics.weekCompleted}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Tarefas completadas</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sequência</p>
            <p className="text-2xl font-bold">{statistics.streak}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Dias consecutivos</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <Circle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxa</p>
            <p className="text-2xl font-bold">{statistics.completionRate.toFixed(0)}%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Conclusão de tarefas</p>
      </Card>
    </div>
  );
};
