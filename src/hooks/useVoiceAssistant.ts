import { useState } from "react";
import { Task } from "@/types/task";
import { getGreeting, formatTime, findNextTask, findCurrentTask } from "@/utils/taskUtils";

interface SpeakOptions {
  voice?: SpeechSynthesisVoice | null;
}

export const useVoiceAssistant = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string, options?: SpeakOptions) => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.error('Speech Synthesis não suportado neste navegador');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1;

      if (options?.voice) {
        utterance.voice = options.voice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  };

  const startAssistant = async (userName: string, tasks: Task[]) => {
    const now = new Date();
    const hour = now.getHours();
    const greeting = getGreeting(hour);
    const currentTimeStr = formatTime(`${hour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);

    let message = `${greeting}, ${userName}! Agora são ${currentTimeStr}. `;

    const currentTask = findCurrentTask(tasks, now);
    const nextTask = findNextTask(tasks, now);

    if (nextTask) {
      if (currentTask) {
        message += `Você está no seu horário de '${currentTask.description}'. Sua próxima atividade é '${nextTask.description}', às ${nextTask.time}.`;
      } else {
        message += `Sua próxima atividade programada é '${nextTask.description}', às ${nextTask.time}.`;
      }
    } else {
      message += "Parece que não há mais tarefas programadas para hoje. Aproveite seu descanso!";
    }

    await speak(message);
    return message;
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const announceTask = async (taskDescription: string, voice?: SpeechSynthesisVoice | null) => {
    const message = `Está na hora de: ${taskDescription}.`;
    await speak(message, { voice });
    return message;
  };

  return { isSpeaking, startAssistant, stopSpeaking, speak, announceTask };
};
