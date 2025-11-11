import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface AssistantButtonProps {
  onClick: () => void;
  isSpeaking: boolean;
}

export const AssistantButton = ({ onClick, isSpeaking }: AssistantButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="w-full h-14 md:h-16 text-base md:text-lg font-semibold shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-primary to-primary-glow"
    >
      {isSpeaking ? (
        <>
          <MicOff className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Parar Assistente</span>
          <span className="sm:hidden">Parar</span>
        </>
      ) : (
        <>
          <Mic className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Iniciar Assistente</span>
          <span className="sm:hidden">Iniciar</span>
        </>
      )}
    </Button>
  );
};
