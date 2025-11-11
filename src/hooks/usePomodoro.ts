import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { playAlertSound } from "@/utils/alertSound";
import { useNotifications } from "./useNotifications";

const WORK_TIME = 25 * 60; // 25 minutos em segundos
const BREAK_TIME = 5 * 60; // 5 minutos em segundos
const LONG_BREAK_TIME = 15 * 60; // 15 minutos em segundos

export const usePomodoro = () => {
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { sendNotification } = useNotifications();

  useEffect(() => {
    // Carregar sessões do localStorage
    const saved = localStorage.getItem("pomodoro-sessions");
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        setSessionsCompleted(data.count);
      } else {
        localStorage.setItem("pomodoro-sessions", JSON.stringify({ date: today, count: 0 }));
      }
    }
  }, []);

  const handleSessionComplete = useCallback(async () => {
    setIsActive(false);
    
    if (isWorkSession) {
      // Completou uma sessão de trabalho
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      
      // Salvar no localStorage
      const today = new Date().toDateString();
      localStorage.setItem("pomodoro-sessions", JSON.stringify({ date: today, count: newCount }));
      
      // Decidir tipo de pausa
      const isLongBreak = newCount % 4 === 0;
      setTimeLeft(isLongBreak ? LONG_BREAK_TIME : BREAK_TIME);
      setIsWorkSession(false);
      
      const description = `Hora de ${isLongBreak ? "uma pausa longa" : "uma pausa"} de ${isLongBreak ? 15 : 5} minutos`;
      
      // Send notification
      await sendNotification(
        "Pomodoro Completo!",
        description,
        {
          tag: "pomodoro-work-complete",
          requireInteraction: true,
          soundType: "pomodoro"
        }
      );
      
      // Play sound and show toast
      playAlertSound("pomodoro");
      toast.success("Sessão completa!", {
        description,
      });
    } else {
      // Completou uma pausa
      setTimeLeft(WORK_TIME);
      setIsWorkSession(true);
      
      const description = "Hora de voltar ao trabalho!";
      
      // Send notification
      await sendNotification(
        "Pausa Terminada!",
        description,
        {
          tag: "pomodoro-break-complete",
          requireInteraction: true,
          soundType: "break"
        }
      );
      
      // Play sound and show toast
      playAlertSound("break");
      toast.info("Pausa terminada!", {
        description,
      });
    }
  }, [isWorkSession, sessionsCompleted, sendNotification]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleSessionComplete]);

  const startPomodoro = () => {
    setIsActive(true);
  };

  const pausePomodoro = () => {
    setIsActive(false);
  };

  const resetPomodoro = () => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(WORK_TIME);
  };

  return {
    isActive,
    isWorkSession,
    timeLeft,
    sessionsCompleted,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
  };
};
