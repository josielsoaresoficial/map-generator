import { useState, useEffect } from "react";

const VOICE_SETTINGS_KEY = "routine-assistant-voice-settings";

type VoiceGender = "male" | "female" | "all";

interface VoiceSettings {
  selectedVoiceURI: string | null;
  preferredGender: VoiceGender;
}

export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    selectedVoiceURI: null,
    preferredGender: "all",
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Categorizar vozes por gênero baseado no nome
  const categorizeVoiceGender = (voice: SpeechSynthesisVoice): VoiceGender => {
    const name = voice.name.toLowerCase();
    
    // Palavras-chave para vozes femininas
    const femaleKeywords = [
      'female', 'mulher', 'woman', 'girl', 'menina', 'luciana', 'maria',
      'ana', 'fernanda', 'julia', 'alice', 'samantha', 'victoria', 'amelie',
      'carmit', 'damayanti', 'dora', 'fiona', 'joana', 'kanya', 'kyoko',
      'laura', 'lekha', 'mariska', 'mei-jia', 'melina', 'milena', 'moira',
      'monica', 'nora', 'paulina', 'petra', 'raveena', 'satu', 'sin-ji',
      'tessa', 'veena', 'yelda', 'yuna', 'zosia', 'zuzana'
    ];
    
    // Palavras-chave para vozes masculinas
    const maleKeywords = [
      'male', 'homem', 'man', 'boy', 'menino', 'daniel', 'pedro',
      'paulo', 'jose', 'alex', 'diego', 'aaron', 'bruce', 'carlos',
      'diego', 'fred', 'jorge', 'juan', 'lee', 'luca', 'maged',
      'nicolas', 'oliver', 'otoya', 'ralph', 'reed', 'serena', 'thomas',
      'xander', 'diego', 'felipe'
    ];
    
    // Verificar se contém palavras-chave femininas
    if (femaleKeywords.some(keyword => name.includes(keyword))) {
      return "female";
    }
    
    // Verificar se contém palavras-chave masculinas
    if (maleKeywords.some(keyword => name.includes(keyword))) {
      return "male";
    }
    
    // Se não identificar, retornar baseado no padrão comum do nome
    // Vozes que terminam com "a" geralmente são femininas em português
    if (name.match(/\ba\b/)) {
      return "female";
    }
    
    return "male"; // Default para masculino se não identificar
  };

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
    if (saved) {
      const loadedSettings = JSON.parse(saved);
      setSettings({
        selectedVoiceURI: loadedSettings.selectedVoiceURI || null,
        preferredGender: loadedSettings.preferredGender || "all",
      });
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

  const saveVoiceSettings = (voiceURI: string, gender?: VoiceGender) => {
    const newSettings = { 
      selectedVoiceURI: voiceURI,
      preferredGender: gender || settings.preferredGender 
    };
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const savePreferredGender = (gender: VoiceGender) => {
    const newSettings = { 
      ...settings,
      preferredGender: gender 
    };
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const getFilteredVoices = (): SpeechSynthesisVoice[] => {
    if (settings.preferredGender === "all") {
      return availableVoices;
    }
    
    return availableVoices.filter(voice => {
      const gender = categorizeVoiceGender(voice);
      return gender === settings.preferredGender;
    });
  };

  const getSelectedVoice = (): SpeechSynthesisVoice | null => {
    if (!settings.selectedVoiceURI) return null;
    return availableVoices.find((v) => v.voiceURI === settings.selectedVoiceURI) || null;
  };

  const getMaleVoices = () => availableVoices.filter(v => categorizeVoiceGender(v) === "male");
  const getFemaleVoices = () => availableVoices.filter(v => categorizeVoiceGender(v) === "female");

  return {
    availableVoices,
    filteredVoices: getFilteredVoices(),
    selectedVoiceURI: settings.selectedVoiceURI,
    preferredGender: settings.preferredGender,
    saveVoiceSettings,
    savePreferredGender,
    getSelectedVoice,
    getMaleVoices,
    getFemaleVoices,
    categorizeVoiceGender,
  };
};
