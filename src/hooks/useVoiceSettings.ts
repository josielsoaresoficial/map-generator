import { useState, useEffect } from "react";

const VOICE_SETTINGS_KEY = "routine-assistant-voice-settings";

interface VoiceSettings {
  selectedVoiceURI: string | null;
}

export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    selectedVoiceURI: null,
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Filter for Portuguese (Brazil) voices
      const ptBrVoices = voices.filter(
        (voice) => voice.lang.startsWith("pt-BR") || voice.lang.startsWith("pt_BR")
      );
      setAvailableVoices(ptBrVoices.length > 0 ? ptBrVoices : voices.filter(v => v.lang.startsWith("pt")));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const saveVoiceSettings = (voiceURI: string) => {
    const newSettings = { selectedVoiceURI: voiceURI };
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const getSelectedVoice = (): SpeechSynthesisVoice | null => {
    if (!settings.selectedVoiceURI) return null;
    return availableVoices.find((v) => v.voiceURI === settings.selectedVoiceURI) || null;
  };

  return {
    availableVoices,
    selectedVoiceURI: settings.selectedVoiceURI,
    saveVoiceSettings,
    getSelectedVoice,
  };
};
