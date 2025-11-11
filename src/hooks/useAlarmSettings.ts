import { useState, useEffect } from "react";

const ALARM_SETTINGS_KEY = "routine-assistant-alarm-settings";

export interface AlarmSettings {
  repeatDuration: number; // em segundos (0 = desligado)
  repeatInterval: number; // intervalo entre repetições em segundos
}

const DEFAULT_SETTINGS: AlarmSettings = {
  repeatDuration: 60, // 1 minuto por padrão
  repeatInterval: 10, // repetir a cada 10 segundos
};

export const useAlarmSettings = () => {
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem(ALARM_SETTINGS_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configurações do alarme:", e);
      }
    }
  }, []);

  const saveAlarmSettings = (newSettings: Partial<AlarmSettings>) => {
    const updated = { ...settings, ...newSettings };
    localStorage.setItem(ALARM_SETTINGS_KEY, JSON.stringify(updated));
    setSettings(updated);
  };

  return {
    settings,
    saveAlarmSettings,
  };
};
