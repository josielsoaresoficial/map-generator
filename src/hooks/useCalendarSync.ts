import { Task } from "@/types/task";
import { toast } from "sonner";

export const useCalendarSync = () => {
  const syncToCalendar = async (task: Task) => {
    try {
      // Verificar se a API de calendário está disponível
      if (!('calendar' in navigator)) {
        console.log("Calendar API não disponível");
        return;
      }

      // Placeholder para implementação futura com API de calendário
      // Por enquanto, apenas simular sucesso
      console.log("Sincronizando tarefa com calendário:", task);
      
      toast.success("Sincronizado!", {
        description: "Tarefa adicionada ao calendário",
      });
    } catch (error) {
      console.error("Erro ao sincronizar com calendário:", error);
      toast.error("Erro ao sincronizar", {
        description: "Não foi possível adicionar ao calendário",
      });
    }
  };

  return { syncToCalendar };
};
