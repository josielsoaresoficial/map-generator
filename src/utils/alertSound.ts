export type NotificationSoundType = "task" | "pomodoro" | "break" | "reminder";

// Create different beep sounds for different notification types
const createBeep = (
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine"
) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

export const playAlertSound = (soundType: NotificationSoundType = "task") => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const currentTime = audioContext.currentTime;
    
    switch (soundType) {
      case "task":
        // High urgent beeps - 3 quick beeps
        createBeep(audioContext, 900, currentTime, 0.15);
        createBeep(audioContext, 900, currentTime + 0.2, 0.15);
        createBeep(audioContext, 900, currentTime + 0.4, 0.15);
        break;
        
      case "pomodoro":
        // Work session complete - ascending tones (motivation)
        createBeep(audioContext, 600, currentTime, 0.2);
        createBeep(audioContext, 700, currentTime + 0.25, 0.2);
        createBeep(audioContext, 800, currentTime + 0.5, 0.3);
        break;
        
      case "break":
        // Break complete - descending tones (relaxing)
        createBeep(audioContext, 800, currentTime, 0.2);
        createBeep(audioContext, 700, currentTime + 0.25, 0.2);
        createBeep(audioContext, 600, currentTime + 0.5, 0.3);
        break;
        
      case "reminder":
        // Gentle reminder - single soft beep
        createBeep(audioContext, 700, currentTime, 0.25);
        break;
    }
    
    console.log(`[Alert Sound] ${soundType} sound played`);
  } catch (error) {
    console.error("[Alert Sound] Error playing sound:", error);
  }
};
