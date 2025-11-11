import { useState, useEffect } from "react";

const VIBRATION_SETTINGS_KEY = "routine-assistant-vibration-settings";

export type VibrationPattern = "soft" | "normal" | "intense";

export interface VibrationSettings {
  pattern: VibrationPattern;
}

const DEFAULT_SETTINGS: VibrationSettings = {
  pattern: "normal",
};

const VIBRATION_PATTERNS: Record<VibrationPattern, number[]> = {
  soft: [200, 100, 200],
  normal: [500, 200, 500, 200, 500],
  intense: [1000, 500, 1000, 500, 1000],
};

export const useVibrationSettings = () => {
  const [settings, setSettings] = useState<VibrationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem(VIBRATION_SETTINGS_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configurações de vibração:", e);
      }
    }
  }, []);

  const saveVibrationSettings = (newSettings: Partial<VibrationSettings>) => {
    const updated = { ...settings, ...newSettings };
    localStorage.setItem(VIBRATION_SETTINGS_KEY, JSON.stringify(updated));
    setSettings(updated);
  };

  const getVibrationPattern = (): number[] => {
    return VIBRATION_PATTERNS[settings.pattern];
  };

  return {
    settings,
    saveVibrationSettings,
    getVibrationPattern,
  };
};
